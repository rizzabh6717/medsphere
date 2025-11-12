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

export async function generateChatReply(
  context: string,
  history: ChatMessage[],
  userText: string,
  opts?: { apiKey?: string; model?: string }
): Promise<AIAnalysisResponse> {
  let apiKey: string | null = undefined as any;
  try { // @ts-ignore
    apiKey = (import.meta?.env?.VITE_GEMINI_API_KEY as string | undefined) || null;
  } catch {}
  if (!apiKey) apiKey = opts?.apiKey || getApiKey();
  if (!apiKey) throw new Error('Missing Gemini API key. Set VITE_GEMINI_API_KEY or sessionStorage.GEMINI_API_KEY.');

  // Build contents: instruction + context, then short history, then latest user msg
  const instruction = `You are MedSphere Assistant. Reply briefly (<= 60 words) in friendly, simple medical terms. Use the provided context (diagnoses, medications, appointments, follow‑ups) to explain terms and give general self‑care tips. Include a short disclaimer only if the user asks for personalized medical decisions or reports red‑flag symptoms (e.g., chest pain, severe shortness of breath, fainting, heavy bleeding). Avoid deflecting to “ask your doctor” unless safety requires it.`;
  const contents: any[] = [
    { role: 'user', parts: [{ text: `${instruction}\n\nContext:\n${context}` }] }
  ];
  const recent = history.slice(-8);
  recent.forEach(m => contents.push({ role: m.role, parts: [{ text: m.text }] }));
  contents.push({ role: 'user', parts: [{ text: userText }] });

  // Discover an available model and build candidate list (override > discovered > defaults)
  const models = await listModels(apiKey);
  const discovered = pickModelFromList(models);
  const override = opts?.model || getModelOverride();
  const candidates = unique([
    override || '',
    discovered || '',
    ...DEFAULT_FALLBACKS,
  ]);
  const payload = { contents };

  let lastError: any = null;
  for (const model of candidates) {
    if (!model) continue;
    const url = `${GEMINI_URL(model, 'v1beta')}?key=${encodeURIComponent(apiKey)}`;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          const out = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n');
          return { text: out || 'Sorry, I could not generate a reply.' };
        } else {
          const body = await res.text().catch(() => '');
          lastError = new Error(`Gemini error ${res.status}: ${body}`);
          if (shouldRetryStatus(res.status)) {
            await sleep(300 * Math.pow(2, attempt) + Math.random() * 120);
            continue;
          }
          break; // non-retryable -> try next model
        }
      } catch (e: any) {
        lastError = e;
        await sleep(200 * Math.pow(2, attempt));
      }
    }
  }
  // If overloaded/unavailable, return a friendly response to UI instead of throwing
  const msg = String(lastError?.message || 'Gemini is unavailable.');
  if (/\b(503|UNAVAILABLE|overloaded)\b/i.test(msg)) {
    return { text: 'The AI is a bit busy right now. Please try again in a moment.' };
  }
  throw lastError || new Error('Failed to get a reply from Gemini.');
}

export interface AIAnalysisResponse {
  text: string;
}

export interface VisualAnalysisResponse {
  patient?: string;
  age?: number;
  gender?: string;
  symptoms?: string[];
  diagnosis: string;
  severity: 'Low' | 'Moderate' | 'High';
  affected_areas: string[]; // e.g., ['throat','lungs']
  recommendation?: string;
}

export interface ChartDiagnosisScore { label: string; score: number } // 0..100
export interface ChartAnalysisResponse {
  summary: string;
  diagnoses: ChartDiagnosisScore[]; // e.g., Viral/Bacterial/Allergy with scores 0..100
  symptomScores: Record<string, number>; // e.g., { cough: 80, fever: 60, sore_throat: 70, fatigue: 40, sore: 30 }
}

export interface ChatMessage {
  role: 'user' | 'model';
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

function getModelOverride(): string | null {
  // Allow pinning a model to avoid discovery issues or overloaded defaults
  try {
    // @ts-ignore
    const fromEnv = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) as string | undefined;
    if (fromEnv) return String(fromEnv);
  } catch {}
  try {
    const ss = sessionStorage.getItem('GEMINI_MODEL') || sessionStorage.getItem('VITE_GEMINI_MODEL');
    if (ss) return ss;
  } catch {}
  try {
    const ls = localStorage.getItem('GEMINI_MODEL') || localStorage.getItem('VITE_GEMINI_MODEL');
    if (ls) return ls;
  } catch {}
  return null;
}

const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
const DEFAULT_FALLBACKS = [
  'models/gemini-1.5-flash',
  'models/gemini-1.5-pro',
  'models/gemini-pro'
];

const shouldRetryStatus = (s: number) => [408, 425, 429, 500, 502, 503, 504].includes(s);
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function generateAIAnalysis(input: AIAnalysisInput, opts?: { model?: string; apiKey?: string }): Promise<AIAnalysisResponse> {
  // Prefer Vite env; fallback to our helper to allow session/localStorage in dev
  let apiKey: string | null = undefined as any;
  try { // @ts-ignore
    apiKey = (import.meta?.env?.VITE_GEMINI_API_KEY as string | undefined) || null;
  } catch {}
  if (!apiKey) apiKey = opts?.apiKey || getApiKey();
  if (!apiKey) throw new Error('Missing Gemini API key. Set VITE_GEMINI_API_KEY or sessionStorage.GEMINI_API_KEY.');

  const symptoms = input.symptoms || '';
  // Discover an available model for this key and build candidate list
  const models = await listModels(apiKey);
  const discovered = pickModelFromList(models);
  const override = opts?.model || getModelOverride();
  const candidates = unique([
    override || '',
    discovered || '',
    ...DEFAULT_FALLBACKS,
  ]);
  const payload = {
    contents: [
      {
        parts: [
          { text: `You are an AI medical assistant helping a doctor interpret patient data.
Summarize only key findings relevant to diagnosis and treatment and Output the analysis in this exact format:
- Summary (1 or 2 sentences)
- Possible Conditions (top 3 concise)
- Suggested Tests (if needed)
- Remarks for Doctor (short):\n${symptoms}` }
        ]
      }
    ]
  };

  let lastError: any = null;
  for (const model of candidates) {
    if (!model) continue;
    const url = `${GEMINI_URL(model, 'v1beta')}?key=${encodeURIComponent(apiKey)}`;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          const out = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n');
          return { text: out || 'No analysis returned.' };
        } else {
          const body = await res.text().catch(() => '');
          lastError = new Error(`Gemini error ${res.status}: ${body}`);
          if (shouldRetryStatus(res.status)) {
            await sleep(300 * Math.pow(2, attempt) + Math.random() * 120);
            continue;
          }
          break;
        }
      } catch (e: any) {
        lastError = e;
        await sleep(200 * Math.pow(2, attempt));
      }
    }
  }
  const msg = String(lastError?.message || 'Gemini is unavailable.');
  if (/\b(503|UNAVAILABLE|overloaded)\b/i.test(msg)) {
    return { text: 'AI analysis is temporarily unavailable (model is busy). Please try again shortly.' };
  }
  throw lastError || new Error('Failed to generate analysis from Gemini.');
}

// Heuristic local analyzer as a fallback if Gemini fails
function localVisualAnalysis(symptomsText: string): VisualAnalysisResponse {
  const s = (symptomsText || '').toLowerCase();
  const affected = new Set<string>();
  let severity: 'Low' | 'Moderate' | 'High' = 'Low';
  let diagnosis = 'Undetermined';
  const recs: string[] = [];

  if (/cough|phlegm|wheeze|breath/i.test(s)) { affected.add('lungs'); }
  if (/throat|sore throat|swallow/i.test(s)) { affected.add('throat'); }
  if (/fever|temperature/i.test(s)) { affected.add('systemic'); }
  if (/chest pain|tightness/i.test(s)) { affected.add('chest'); severity = 'High'; recs.push('Urgent evaluation if chest pain is severe or worsening.'); }

  // simple rules
  if (affected.has('throat') && affected.has('lungs')) {
    diagnosis = 'Upper Respiratory Infection';
    severity = severity === 'High' ? 'High' : /fever/.test(s) ? 'Moderate' : 'Low';
    recs.push('Consider strep and COVID-19 testing if symptoms persist.');
  } else if (affected.has('throat')) {
    diagnosis = 'Pharyngitis (likely viral)';
    severity = /fever/.test(s) ? 'Moderate' : 'Low';
  } else if (affected.has('lungs')) {
    diagnosis = 'Lower respiratory involvement';
    severity = /breath|wheeze/.test(s) ? 'Moderate' : 'Low';
  }

  return {
    diagnosis,
    severity,
    affected_areas: Array.from(affected.size ? affected : ['throat']),
    recommendation: recs[0] || 'Symptomatic care and monitoring; test if symptoms persist.'
  };
}

export async function analyzeSymptomsVisual(symptomsText: string, opts?: { model?: string; apiKey?: string; patient?: { name?: string; age?: number; gender?: string } }): Promise<VisualAnalysisResponse> {
  const apiKey = opts?.apiKey || getApiKey();
  const override = opts?.model || getModelOverride();
  const models = apiKey ? await listModels(apiKey).catch(() => []) : [];
  const discovered = pickModelFromList(models);
  const candidates = unique([override || '', discovered || '', ...DEFAULT_FALLBACKS]);

  const prompt = `You are a medical triage assistant. Based ONLY on the provided symptom text, return STRICT JSON with keys:
{
  "diagnosis": string,
  "severity": "Low"|"Moderate"|"High",
  "affected_areas": string[],
  "recommendation": string
}
No extra text. Symptoms: ${symptomsText}`;

  const payload = { contents: [{ role: 'user', parts: [{ text: prompt }] }] } as any;

  if (apiKey) {
    for (const model of candidates) {
      if (!model) continue;
      const url = `${GEMINI_URL(model, 'v1beta')}?key=${encodeURIComponent(apiKey)}`;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') || '';
            const match = text.match(/[\{\[][\s\S]*[\}\]]/);
            if (match) {
              try {
                const parsed = JSON.parse(match[0]);
                return {
                  patient: opts?.patient?.name,
                  age: opts?.patient?.age,
                  gender: opts?.patient?.gender,
                  symptoms: [],
                  diagnosis: String(parsed.diagnosis || 'Undetermined'),
                  severity: (['Low','Moderate','High'].includes(parsed.severity) ? parsed.severity : 'Low') as any,
                  affected_areas: Array.isArray(parsed.affected_areas) ? parsed.affected_areas : [],
                  recommendation: parsed.recommendation || undefined,
                };
              } catch {}
            }
          } else if (!shouldRetryStatus(res.status)) {
            break;
          }
          await sleep(200 * Math.pow(2, attempt));
        } catch {}
      }
    }
  }
  // Fallback to local heuristic
  const h = localVisualAnalysis(symptomsText);
  return { patient: opts?.patient?.name, age: opts?.patient?.age, gender: opts?.patient?.gender, symptoms: [], ...h };
}

// Radar/Bar charts analysis strictly from symptoms
export async function analyzeSymptomsCharts(symptomsText: string, opts?: { model?: string; apiKey?: string }): Promise<ChartAnalysisResponse> {
  const apiKey = opts?.apiKey || getApiKey();
  const override = opts?.model || getModelOverride();
  const models = apiKey ? await listModels(apiKey).catch(() => []) : [];
  const discovered = pickModelFromList(models);
  const candidates = unique([override || '', discovered || '', ...DEFAULT_FALLBACKS]);
  const prompt = `Given only this symptom text, output STRICT JSON with keys:
{
  "summary": string,
  "diagnoses": [{"label": string, "score": number(0-100)}],
  "symptomScores": {"cough": number, "fever": number, "sore_throat": number, "fatigue": number, "sore": number}
}
No extra commentary. Symptoms: ${symptomsText}`;
  const payload = { contents: [{ role: 'user', parts: [{ text: prompt }] }] } as any;
  if (apiKey) {
    for (const model of candidates) {
      if (!model) continue;
      const url = `${GEMINI_URL(model, 'v1beta')}?key=${encodeURIComponent(apiKey)}`;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') || '';
            const match = text.match(/[\{\[][\s\S]*[\}\]]/);
            if (match) {
              try {
                const j = JSON.parse(match[0]);
                const diagnoses = Array.isArray(j.diagnoses) ? j.diagnoses.map((d:any)=>({label:String(d.label||''), score: Math.max(0, Math.min(100, Number(d.score)||0))})) : [];
                const symptomScores = j.symptomScores || {};
                return { summary: String(j.summary || ''), diagnoses, symptomScores };
              } catch {}
            }
          } else if (!shouldRetryStatus(res.status)) { break; }
          await sleep(200 * Math.pow(2, attempt));
        } catch {}
      }
    }
  }
  // Heuristic fallback
  const s = (symptomsText||'').toLowerCase();
  const score = (re: RegExp, base=30) => (re.test(s) ? base+50 : base);
  const symptomScores = {
    cough: score(/cough|phlegm/),
    fever: score(/fever|temperature/),
    sore_throat: score(/sore throat|throat/),
    fatigue: score(/fatigue|tired/),
    sore: score(/body ache|soreness|sore/)
  } as Record<string, number>;
  const viral = Math.round((symptomScores.cough + symptomScores.fever + symptomScores.sore_throat)/3);
  const bacterial = Math.round((symptomScores.fever + (/(pus|exudate|high fever)/.test(s)?80:40))/2);
  const allergy = Math.round((/(sneeze|itch|watery eyes|runny nose)/.test(s)?80:30));
  const diagnoses: ChartDiagnosisScore[] = [
    { label: 'Viral Infection', score: Math.min(100, viral) },
    { label: 'Bacterial', score: Math.min(100, bacterial) },
    { label: 'Allergy', score: Math.min(100, allergy) },
  ];
  const summary = 'Symptoms suggest mild viral respiratory involvement; recommend hydration and rest; monitor fever.';
  return { summary, diagnoses, symptomScores };
}
