import { Dataset, Variable, OutputItem } from '../types';

// Parse CSV string into Dataset
export function parseCSV(csvText: string, fileName = 'Imported_Data'): Dataset {
  const lines = csvText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Detect delimiter (, or ; or \t)
  const firstLine = lines[0];
  let delimiter = ',';
  if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = ';';
  } else if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = '\t';
  }

  // Helper to split row handling quotes
  const splitRow = (rowStr: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(cur.trim().replace(/^"|"$/g, ''));
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const rawHeaders = splitRow(lines[0]);
  const colNames = rawHeaders.map((h, idx) => {
    const sanitized = h.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    return sanitized || `var_${idx + 1}`;
  });

  const rawRows = lines.slice(1).map(line => splitRow(line));

  // Infer types
  const variables: Variable[] = colNames.map((colName, colIdx) => {
    let numericCount = 0;
    let nonBlankCount = 0;

    for (const r of rawRows) {
      const val = r[colIdx];
      if (val !== undefined && val !== '') {
        nonBlankCount++;
        if (!isNaN(Number(val))) {
          numericCount++;
        }
      }
    }

    const isNumeric = nonBlankCount > 0 && numericCount / nonBlankCount >= 0.85;

    return {
      id: `v_${colName}_${Date.now()}_${colIdx}`,
      name: colName,
      type: isNumeric ? 'Numeric' : 'String',
      width: 8,
      decimals: isNumeric ? 2 : 0,
      label: rawHeaders[colIdx] !== colName ? rawHeaders[colIdx] : '',
      values: [],
      missing: '',
      columns: 8,
      align: isNumeric ? 'Right' : 'Left',
      measure: isNumeric ? 'Scale' : 'Nominal',
      role: 'Input'
    };
  });

  // Build row records
  const data = rawRows.map(rowCols => {
    const record: Record<string, any> = {};
    colNames.forEach((colName, idx) => {
      const val = rowCols[idx];
      const varDef = variables[idx];
      if (val === undefined || val === '') {
        record[colName] = null;
      } else if (varDef.type === 'Numeric') {
        record[colName] = isNaN(Number(val)) ? null : Number(val);
      } else {
        record[colName] = val;
      }
    });
    return record;
  });

  return {
    id: 'ds_' + Date.now(),
    name: fileName,
    variables,
    data
  };
}

// Parse Excel (.xlsx / .xls) ArrayBuffer into Dataset
export async function parseExcel(dataBuffer: ArrayBuffer, fileName = 'Excel_Data'): Promise<Dataset> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(dataBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Excel workbook contains no sheets');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  // Convert sheet to json array of arrays
  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

  if (!rawData || rawData.length === 0) {
    throw new Error('The selected Excel sheet is empty');
  }

  // Row 0 is headers
  const headerRow: any[] = rawData[0];
  const colNames = headerRow.map((h, idx) => {
    if (h === null || h === undefined || String(h).trim() === '') {
      return `var_${idx + 1}`;
    }
    return String(h).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() || `var_${idx + 1}`;
  });

  const bodyRows = rawData.slice(1).filter(r => r.some(c => c !== null && c !== undefined && String(c).trim() !== ''));

  // Infer variable types
  const variables: Variable[] = colNames.map((colName, colIdx) => {
    let numericCount = 0;
    let nonBlankCount = 0;

    for (const r of bodyRows) {
      const val = r[colIdx];
      if (val !== null && val !== undefined && String(val).trim() !== '') {
        nonBlankCount++;
        if (!isNaN(Number(val))) {
          numericCount++;
        }
      }
    }

    const isNumeric = nonBlankCount > 0 && numericCount / nonBlankCount >= 0.8;

    return {
      id: `v_${colName}_${Date.now()}_${colIdx}`,
      name: colName,
      type: isNumeric ? 'Numeric' : 'String',
      width: 8,
      decimals: isNumeric ? 2 : 0,
      label: headerRow[colIdx] ? String(headerRow[colIdx]) : '',
      values: [],
      missing: '',
      columns: 8,
      align: isNumeric ? 'Right' : 'Left',
      measure: isNumeric ? 'Scale' : 'Nominal',
      role: 'Input'
    };
  });

  const data = bodyRows.map(rowCols => {
    const record: Record<string, any> = {};
    colNames.forEach((colName, idx) => {
      const val = rowCols[idx];
      const varDef = variables[idx];
      if (val === null || val === undefined || String(val).trim() === '') {
        record[colName] = null;
      } else if (varDef.type === 'Numeric') {
        record[colName] = isNaN(Number(val)) ? null : Number(val);
      } else {
        record[colName] = String(val);
      }
    });
    return record;
  });

  return {
    id: 'ds_' + Date.now(),
    name: fileName.replace(/\.[^/.]+$/, ''),
    variables,
    data
  };
}

// Export dataset to Excel (.xlsx)
export async function exportToExcel(dataset: Dataset): Promise<void> {
  const XLSX = await import('xlsx');
  const headers = dataset.variables.map(v => v.name);
  const rows = dataset.data.map(row => {
    const r: Record<string, any> = {};
    headers.forEach(h => {
      r[h] = row[h] ?? '';
    });
    return r;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, dataset.name.substring(0, 31) || 'Data');
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${dataset.name}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


// Export dataset to CSV
export function exportToCSV(dataset: Dataset): void {
  const headers = dataset.variables.map(v => v.name);
  const rows = dataset.data.map(row => {
    return headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      return String(val);
    }).join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadFile(csvContent, `${dataset.name}.csv`, 'text/csv;charset=utf-8;');
}

// Export whole project bundle (.ospss)
export function exportProjectBundle(dataset: Dataset, outputs: OutputItem[], syntax: string): void {
  const bundle = {
    version: '1.0.0',
    platform: 'Open SPSS Web',
    exportedAt: new Date().toISOString(),
    dataset,
    outputs,
    syntax
  };

  const jsonStr = JSON.stringify(bundle, null, 2);
  downloadFile(jsonStr, `${dataset.name}.ospss`, 'application/json');
}

// Export formatted APA Output Document to HTML
export function exportOutputToHTML(outputs: OutputItem[], projectName: string): void {
  const bodyContent = outputs.map(item => {
    let html = `<div class="spss-output-item">
      <div class="spss-header">
        <h2>${item.procedure}</h2>
        <span class="spss-time">${item.timestamp}</span>
      </div>`;

    if (item.syntax) {
      html += `<pre class="spss-syntax"><code>${item.syntax}</code></pre>`;
    }

    for (const table of item.tables) {
      html += `<div class="spss-table-wrapper">
        <h3 class="spss-table-title">${table.title}</h3>
        <table class="spss-pivot-table">
          <thead>`;
      for (const hRow of table.headers) {
        html += `<tr>${hRow.map(h => `<th>${h}</th>`).join('')}</tr>`;
      }
      html += `</thead><tbody>`;
      for (const bRow of table.rows) {
        html += `<tr>${bRow.map(c => `<td>${c !== undefined ? c : ''}</td>`).join('')}</tr>`;
      }
      html += `</tbody></table>`;
      if (table.footnotes && table.footnotes.length > 0) {
        html += `<div class="spss-footnotes">${table.footnotes.map(f => `<p><i>${f}</i></p>`).join('')}</div>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
    return html;
  }).join('\n');

  const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Open SPSS Output - ${projectName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 40px; color: #1e293b; background: #fff; }
    .spss-output-item { margin-bottom: 40px; page-break-inside: avoid; }
    .spss-header { border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: baseline; }
    .spss-header h2 { margin: 0; font-size: 1.3rem; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
    .spss-time { font-size: 0.85rem; color: #64748b; }
    .spss-syntax { background: #f8fafc; border-left: 3px solid #3b82f6; padding: 10px; font-family: "Courier New", monospace; font-size: 0.85rem; margin-bottom: 16px; }
    .spss-table-title { font-size: 1rem; font-weight: 600; margin: 16px 0 6px 0; color: #1e293b; }
    .spss-pivot-table { border-collapse: collapse; width: 100%; font-size: 0.85rem; margin-bottom: 8px; }
    .spss-pivot-table th { border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; padding: 6px 10px; text-align: left; background: #f1f5f9; font-weight: 600; }
    .spss-pivot-table td { padding: 5px 10px; border-bottom: 1px solid #e2e8f0; }
    .spss-pivot-table tr:last-child td { border-bottom: 1.5px solid #000; font-weight: 500; }
    .spss-footnotes { font-size: 0.8rem; color: #475569; margin-top: 4px; }
    @media print { body { margin: 15mm; } }
  </style>
</head>
<body>
  <h1>Open SPSS Web - Analysis Output Document</h1>
  <p><b>Dataset:</b> ${projectName} | <b>Generated:</b> ${new Date().toLocaleString()}</p>
  <hr style="margin-bottom: 24px;">
  ${bodyContent}
</body>
</html>`;

  downloadFile(fullHTML, `SPSS_Output_${projectName}.html`, 'text/html;charset=utf-8;');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
