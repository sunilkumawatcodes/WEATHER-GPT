import config from '../config/env.js';
import { getSettings, logAiConversation } from '../database/db.js';

export async function askGemini({ prompt, weatherContext, language = 'en', placeName = 'Local Area' }) {
  const settings = getSettings();
  const apiKey = (config.gemini.apiKey || settings.gemini_api_key || '').trim();

  // If Gemini API Key is configured, query Gemini 2.5 Flash
  if (apiKey && apiKey.length > 10) {
    try {
      const responseText = await callGeminiApi(apiKey, prompt, weatherContext, language, placeName);
      logAiConversation(prompt, responseText, language, weatherContext?.latitude, weatherContext?.longitude);
      return { answer: responseText, engine: 'gemini-2.5-flash', grounded: true };
    } catch (err) {
      console.warn('[ai] Gemini API call failed, falling back to heuristic engine:', err.message);
    }
  }

  // Multilingual Heuristic Fallback Engine
  const fallbackAnswer = generateMultilingualFallback(prompt, weatherContext, language, placeName);
  logAiConversation(prompt, fallbackAnswer, language, weatherContext?.latitude, weatherContext?.longitude);
  return { answer: fallbackAnswer, engine: 'local-expert', grounded: true };
}

async function callGeminiApi(apiKey, prompt, weather, language, placeName) {
  const systemInstruction = `You are WeatherGPT, an expert meteorologist and decision-support assistant.
Location: ${placeName}
Current Weather: Temp: ${weather?.current?.temperature_2m}°C, Humidity: ${weather?.current?.relative_humidity_2m}%, Wind: ${weather?.current?.wind_speed_10m} km/h, Risk Score: ${weather?.riskScore}/100.
Rule: Provide a concise, highly practical, and actionable answer in the user's requested language (${language}).`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }] }]
    })
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

function generateMultilingualFallback(prompt, weather, language, placeName) {
  const c = weather?.current || {};
  const temp = Math.round(c.temperature_2m ?? 26);
  const rain = weather?.daily?.precipitation_probability_max?.[0] ?? 10;
  const wind = Math.round(c.wind_speed_10m ?? 12);
  const risk = weather?.riskScore ?? 15;

  if (language === 'te') {
    return `🌦️ **${placeName} వాతావరణ విశ్లేషణ**:
- ప్రస్తుత ఉష్ణోగ్రత: **${temp}°C**, వర్ష సూచన: **${rain}%**, గాలి వేగం: **${wind} km/h**.
- ప్రమాద సూచిక: **${risk}/100** (${risk > 50 ? 'జాగ్రత్త అవసరం' : 'సాధారణం'}).
- సలహా: ${rain > 50 ? 'వర్షం పడే అవకాశం ఉన్నందున గొడుగు వెంట ఉంచుకోండి.' : 'వాతావరణం అనుకూలంగా ఉంది. పనులను నిరభ్యంతరంగా కొనసాగించవచ్చు.'}`;
  }
  
  if (language === 'hi') {
    return `🌦️ **${placeName} मौसम विश्लेषण**:
- वर्तमान तापमान: **${temp}°C**, बारिश की संभावना: **${rain}%**, हवा की गति: **${wind} किमी/घंटा**.
- आपदा जोखिम सूचकांक: **${risk}/100**.
- सलाह: ${rain > 50 ? 'बारिश के आसार हैं, छाता साथ रखें।' : 'मौसम सामान्य एवं अनुकूल है।'}`;
  }

  // Default English
  return `🌦️ **Weather Intelligence for ${placeName}**:
- Temperature: **${temp}°C**, Rain Probability: **${rain}%**, Wind: **${wind} km/h**.
- Disaster Risk Rating: **${risk}/100** (${risk > 50 ? 'High Caution' : 'Low Hazard'}).
- Recommendation: ${rain > 50 ? 'Carry an umbrella; wet conditions likely.' : 'Favorable atmospheric conditions for all outdoor activities.'}`;
}
