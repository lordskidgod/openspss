import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { Dataset, OutputItem, Variable } from '../types';

export type ProjectCategory = 
  | 'Market Research'
  | 'Consumer & Dating Surveys'
  | 'E-Commerce & Tech'
  | 'Academic & Psychology'
  | 'Finance & Business'
  | 'Healthcare & Bio'
  | 'General';

export interface CloudProjectSummary {
  id: string;
  user_id: string;
  name: string;
  category: ProjectCategory;
  description: string;
  row_count: number;
  col_count: number;
  can_mine_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminCloudProjectSummary extends CloudProjectSummary {
  user_email?: string;
  user_full_name?: string;
  user_avatar?: string;
}

export interface CloudProjectDetails extends CloudProjectSummary {
  variables_schema: Variable[];
  raw_data: Record<string, any>[];
  output_items: OutputItem[];
  syntax_code?: string;
  user_email?: string;
}

export interface SaveProjectPayload {
  name: string;
  category: ProjectCategory;
  description?: string;
  dataset: Dataset;
  outputItems?: OutputItem[];
  syntaxCode?: string;
  isPro?: boolean;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

export async function saveCloudProject(payload: SaveProjectPayload): Promise<{ data: CloudProjectSummary | null; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'You must be signed in to save projects to the cloud.' };
    }

    const rowCount = payload.dataset.data.length;
    const colCount = payload.dataset.variables.length;
    const canMine = !payload.isPro; // Free tier grants market research intelligence license; Pro has private isolation

    const record = {
      user_id: user.id,
      name: payload.name.trim(),
      category: payload.category || 'General',
      description: payload.description?.trim() || '',
      row_count: rowCount,
      col_count: colCount,
      variables_schema: payload.dataset.variables,
      raw_data: payload.dataset.data,
      output_items: payload.outputItems || [],
      syntax_code: payload.syntaxCode || '',
      can_mine_data: canMine,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('cloud_projects')
      .insert(record)
      .select('id, user_id, name, category, description, row_count, col_count, can_mine_data, created_at, updated_at')
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Optionally record market intelligence summary log for research models (non-blocking)
    if (canMine) {
      try {
        const detectedTopics = payload.dataset.variables.map(v => v.name);
        await supabase.from('market_intelligence_logs').insert({
          project_id: data.id,
          user_id: user.id,
          category: payload.category,
          detected_topics: detectedTopics,
          summary_metrics: {
            rows: rowCount,
            cols: colCount,
            variables: payload.dataset.variables.map(v => ({ name: v.name, type: v.type, measure: v.measure }))
          },
          can_mine: true
        });
      } catch (logErr) {
        console.warn('Telemetry log background error:', logErr);
      }
    }

    return { data: data as CloudProjectSummary, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to save project to cloud' };
  }
}

export async function listCloudProjects(): Promise<{ data: CloudProjectSummary[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('cloud_projects')
      .select('id, user_id, name, category, description, row_count, col_count, can_mine_data, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data || []) as CloudProjectSummary[], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || 'Failed to retrieve cloud projects' };
  }
}

export async function loadCloudProject(projectId: string): Promise<{ data: CloudProjectDetails | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('cloud_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as CloudProjectDetails, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to load project details' };
  }
}

export async function deleteCloudProject(projectId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('cloud_projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete project' };
  }
}

// ── ADMIN DATA INTELLIGENCE PORTAL FUNCTIONS ──────────────────────────────────

/**
 * Lists all projects across the platform for Admin analysis.
 * Uses service role key if provided to bypass RLS, or standard client if admin role is granted in DB.
 */
export async function listAllCommunityProjects(customKey?: string): Promise<{ data: AdminCloudProjectSummary[]; error: string | null }> {
  try {
    const client = customKey ? createClient(supabaseUrl, customKey.trim()) : supabase;

    // Fetch projects joined with profiles
    const { data, error } = await client
      .from('cloud_projects')
      .select(`
        id, 
        user_id, 
        name, 
        category, 
        description, 
        row_count, 
        col_count, 
        can_mine_data, 
        created_at, 
        updated_at,
        profiles (
          email,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    const formatted: AdminCloudProjectSummary[] = (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      category: row.category,
      description: row.description,
      row_count: row.row_count,
      col_count: row.col_count,
      can_mine_data: row.can_mine_data,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_email: row.profiles?.email || 'Anonymous Contributor',
      user_full_name: row.profiles?.full_name || '',
      user_avatar: row.profiles?.avatar_url || ''
    }));

    return { data: formatted, error: null };
  } catch (err: any) {
    return { data: [], error: err.message || 'Failed to query platform projects' };
  }
}

/**
 * Loads full details of a specific project for Admin inspection.
 */
export async function getAdminProjectDetails(projectId: string, customKey?: string): Promise<{ data: CloudProjectDetails | null; error: string | null }> {
  try {
    const client = customKey ? createClient(supabaseUrl, customKey.trim()) : supabase;

    const { data, error } = await client
      .from('cloud_projects')
      .select('*, profiles (email)')
      .eq('id', projectId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { 
      data: {
        ...data,
        user_email: data.profiles?.email || 'Unknown User'
      } as CloudProjectDetails, 
      error: null 
    };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to inspect project' };
  }
}

/**
 * Downloads a dataset's raw records as a CSV file in the browser.
 */
export function exportDatasetAsCSV(project: CloudProjectDetails) {
  if (!project.raw_data || project.raw_data.length === 0) {
    alert('This dataset has no rows to export.');
    return;
  }

  const variables = project.variables_schema || [];
  const colHeaders = variables.length > 0 ? variables.map(v => v.name) : Object.keys(project.raw_data[0]);

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [
    colHeaders.map(escapeCSV).join(','),
    ...project.raw_data.map(row => colHeaders.map(col => escapeCSV(row[col])).join(','))
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_dataset.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads all selected community projects as a single master JSON bundle for AI intelligence or model training.
 */
export function exportIntelligenceBundle(projects: CloudProjectDetails[]) {
  const bundle = {
    exported_at: new Date().toISOString(),
    platform: 'Open SPSS Web Platform Intelligence',
    total_datasets: projects.length,
    datasets: projects.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      contributor_email: p.user_email,
      created_at: p.created_at,
      row_count: p.row_count,
      col_count: p.col_count,
      can_mine: p.can_mine_data,
      variables_dictionary: p.variables_schema,
      raw_rows: p.raw_data
    }))
  };

  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `open_spss_intelligence_bundle_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
