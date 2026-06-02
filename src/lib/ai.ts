import { v4 as uuidv4 } from 'uuid';

export async function generateWithAI(prompt: string, aiConfig: any, systemInstruction?: string, isJson: boolean = false, history?: {role:string, content:string}[]): Promise<string> {
    const config = aiConfig || { provider: 'gemini' };
    let providers = [config.provider];
    
    if (config.autoFallback) {
       const fallbacks = ['gemini', 'openai', 'claude', 'custom'].filter(p => p !== config.provider);
       providers = [...providers, ...fallbacks];
    }

    let errors: string[] = [];

    for (const provider of providers) {
       try {
          if (provider === 'gemini') {
             const key = config.geminiKey;
             if (!key) throw new Error("API_KEY_MISSING");
             
             // Using direct REST fetch to avoid SDK browser limitations
             const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
             
             let contents: any[] = [];
             if (history && history.length > 0) {
                 contents = history.map(h => ({ role: h.role, parts: [{ text: h.content }] }));
                 contents.push({ role: 'user', parts: [{ text: prompt }]});
             } else {
                 contents = [{ role: 'user', parts: [{ text: prompt }] }];
             }

             const bodyPayload: any = { contents };
             if (systemInstruction) {
                 bodyPayload.systemInstruction = { parts: [{ text: systemInstruction }] };
             }
             if (isJson) {
                 bodyPayload.generationConfig = { responseMimeType: "application/json" };
             }

             const res = await fetch(url, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(bodyPayload)
             });

             if (!res.ok) {
                 const errData = await res.json().catch(()=>({}));
                 throw new Error(errData.error?.message || `HTTP ${res.status}`);
             }

             const data = await res.json();
             let txt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
             if (isJson && txt.startsWith('```json')) {
                 txt = txt.replace(/```json|```/g, '').trim();
             }
             return txt;

          } else if (provider === 'openai') {
             const key = config.openaiKey;
             if (!key) throw new Error("API_KEY_MISSING");
             
             const messages = [];
             if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
             if (history) {
                history.forEach(h => messages.push({ role: h.role === 'model' ? 'assistant' : 'user', content: h.content }));
             }
             messages.push({ role: 'user', content: prompt });
             
             const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
                body: JSON.stringify({ 
                   model: 'gpt-3.5-turbo', 
                   messages,
                   response_format: isJson ? { type: "json_object" } : undefined
                })
             });
             if (!res.ok) {
                const err: any = await res.json().catch(()=>({}));
                throw new Error(err.error?.message || `HTTP ${res.status}`);
             }
             const data: any = await res.json();
             return data.choices[0].message.content;
          } else if (provider === 'claude') {
             const key = config.claudeKey;
             if (!key) throw new Error("API_KEY_MISSING");
             throw new Error("Claude implementation simplified mock: Please use Gemini or OpenAI.");
          } else if (provider === 'custom') {
             const key = config.customKey;
             const url = config.customUrl || 'https://api.openai.com/v1/chat/completions';
             const modelName = config.customModel || 'gpt-3.5-turbo';
             
             const messages = [];
             if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
             if (history) {
                history.forEach((h: any) => messages.push({ role: h.role === 'model' ? 'assistant' : 'user', content: h.content }));
             }
             messages.push({ role: 'user', content: prompt });
             
             const headers: any = { 'Content-Type': 'application/json' };
             if (key) {
               headers['Authorization'] = `Bearer ${key}`;
             } else {
               throw new Error("API_KEY_MISSING");
             }

             const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({ 
                   model: modelName, 
                   messages,
                   response_format: isJson ? { type: "json_object" } : undefined
                })
             });
             if (!res.ok) {
                const err: any = await res.json().catch(()=>({}));
                throw new Error(err.error?.message || err.message || `HTTP ${res.status}`);
             }
             const data: any = await res.json();
             return data.choices[0].message.content;
          } else if (provider === 'ollama') {
             const url = config.ollamaUrl || 'http://localhost:11434';
             const res = await fetch(`${url}/api/generate`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ 
                    model: 'llama3', 
                    prompt: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt, 
                    stream: false,
                    format: isJson ? 'json' : undefined
                 })
             });
             if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
             const data: any = await res.json();
             return data.response;
          }
       } catch (e: any) {
          const msg = e.message || String(e);
          console.warn(`Provider ${provider} failed: ${msg}`);
          if (msg === "API_KEY_MISSING" && provider !== config.provider) continue;
          errors.push(`[${provider}]: ${msg}`);
       }
    }
    throw new Error(`AI Request Failed: ${errors.join(' | ')}`);
}

export function parseAIError(e: any): string {
  const str = e.message || String(e);
  if (str.includes('429') || str.includes('exceeded') || str.includes('RESOURCE_EXHAUSTED')) {
     return 'Rate Limit Exceeded: The AI service is currently busy or out of quota. Please configure your own API key in AI Settings or try again later.';
  }
  if (str.includes('503') || str.includes('UNAVAILABLE')) {
     return 'Service Unavailable: The AI model is temporarily overloaded. Please try again soon or switch models in AI Settings.';
  }
  if (str.includes('API key') || str.includes('API_KEY_MISSING') || str.includes('401')) {
     return 'Authentication Error: The provided AI API key is missing or invalid. Please update it in AI Settings.';
  }
  return `AI Error Failed to process request: ${str.substring(0, 150)}...`;
}
