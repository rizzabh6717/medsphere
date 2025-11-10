// Simple Gemini (Google Generative Language) REST client
// Uses fetch against the public REST endpoint so we avoid adding new npm deps.
// Read API key from Vite env (VITE_GEMINI_API_KEY) or from sessionStorage('GEMINI_API_KEY').

export interface AIAnalysisInput {
  patientName?: string;
  patientPhone?: string;
  symptoms?: string;
  vitals?: Record<string, any>;
  history?: string[];
  prescriptions?: Array<{ medicine: string; dosage?: string; duration?: string; instructions?: string }>; 
}

export interface AIAnalysisResponse {
  text: string;
}

// Prefer v1beta which supports the newest Gemini 1.5 endpoints via REST
const GEMINI_URL = (model: string, version: 'v1' | 'v1beta' = 'v1beta') => {
  const name = model.startsWith('models/') ? model : `models/${model}`;
  return `https://generativelanguage.googleapis.com/${version}/${name}:generateContent`;
};

const getApiKey = (): string | null => {
  // Vite env at build time or runtime session/local storage for manual entry
  try {
    // @ts-ignore
    const fromEnv = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_GEMINI_API_KEY as string | undefined) : undefined;
    if (fromEnv) return String(fromEnv);
  } catch {}
  try {
    const ss = sessionStorage.getItem('GEMINI_API_KEY') || sessionStorage.getItem('VITE_GEMINI_API_KEY');
    if (ss) return ss;
  } catch {}
  try {
    const ls = localStorage.getItem('GEMINI_API_KEY') || localStorage.getItem('VITE_GEMINI_API_KEY');
    if (ls) return ls;
  } catch {}
  try {
    // As a last resort, allow a global variable if the app injected it somewhere
    // @ts-ignore
    const globalAny = (window as any)?.GEMINI_API_KEY || (window as any)?.VITE_GEMINI_API_KEY;
    if (globalAny) return String(globalAny);
  } catch {}
  return null;
};

async function listModels(apiKey: string): Promise<any[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const j = await r.json().catch(() => ({}));
  return j?.models || [];
}

function pickModelFromList(models: any[]): string | null {
  // Prefer flash, then pro, with generateContent support
  const supports = (m: any) => (m?.supportedGenerationMethods || []).includes('generateContent');
  const byName = (substr: string) => models.find((m: any) => supports(m) && String(m?.name || '').includes(substr))?.name || null;
  return byName('gemini-1.5-flash') || byName('gemini-1.5-pro') || byName('gemini-pro') || byName('gemini');
}

export async function generateAIAnalysis(input: AIAnalysisInput, opts?: { model?: string; apiKey?: string }): Promise<AIAnalysisResponse> {
  // Prefer Vite env; fallback to our helper to allow session/localStorage in dev
  let apiKey: string | null = undefined as any;
  try { // @ts-ignore
    apiKey = (import.meta?.env?.VITE_GEMINI_API_KEY as string | undefined) || null;
  } catch {}
  if (!apiKey) apiKey = opts?.apiKey || getApiKey();
  if (!apiKey) throw new Error('Missing Gemini API key. Set VITE_GEMINI_API_KEY or sessionStorage.GEMINI_API_KEY.');

  const symptoms = input.symptoms || '';
  // Discover an available model for this key
  const models = await listModels(apiKey);
  const discovered = pickModelFromList(models) || 'models/gemini-2.5-flash-exp-tts-2025-05-19';
  const url = `${GEMINI_URL(discovered, 'v1beta')}?key=${encodeURIComponent(apiKey)}`;
  const payload = {
    contents: [
      {
        parts: [
          { text: `Analyze the following patient details and provide a brief medical insight:\n${symptoms}` }
        ]
      }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const out = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n');
  return { text: out || 'No analysis returned.' };
}
