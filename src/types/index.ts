export type VariableType = 'Numeric' | 'String' | 'Date' | 'Dollar';
export type Alignment = 'Left' | 'Right' | 'Center';
export type Measure = 'Scale' | 'Ordinal' | 'Nominal';
export type VariableRole = 'Input' | 'Target' | 'Both' | 'None' | 'Partition' | 'Split';

export interface ValueLabel {
  value: string | number;
  label: string;
}

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  width: number;
  decimals: number;
  label: string;
  values: ValueLabel[];
  missing: string;
  columns: number;
  align: Alignment;
  measure: Measure;
  role: VariableRole;
}

export type DataRow = Record<string, any>;

export interface Dataset {
  id: string;
  name: string;
  variables: Variable[];
  data: DataRow[];
  filterVar?: string;
  weightVar?: string;
  splitVar?: string;
}

export interface TableOutput {
  title: string;
  subtitle?: string;
  headers: string[][];
  rows: (string | number)[][];
  footnotes?: string[];
  cornerHeader?: string;
}

export interface ChartOutput {
  type: 'bar' | 'histogram' | 'box' | 'scatter' | 'pie' | 'line';
  title: string;
  labels?: string[];
  values?: number[];
  series?: { name: string; values: number[]; color?: string }[];
  xLabel?: string;
  yLabel?: string;
  dataPoints?: { x: number; y: number; label?: string }[];
  curvePoints?: { x: number; y: number }[];
}

export interface OutputItem {
  id: string;
  procedure: string;
  title: string;
  timestamp: string;
  syntax?: string;
  notes?: string[];
  tables: TableOutput[];
  charts: ChartOutput[];
}

export interface OutputOutlineNode {
  id: string;
  title: string;
  procedure: string;
  children?: { id: string; title: string; type: 'table' | 'chart' | 'notes' }[];
}
