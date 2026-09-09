// WeatherGPT Client API Layer
const API_BASE = '/api';

export async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export default {
  checkHealth: () => fetchJson('/health'),
  getWeather: (lat, lon, refresh = false) => fetchJson(`/weather?lat=${lat}&lon=${lon}&refresh=${refresh}`),
  getRadarFrames: () => fetchJson('/weather/radar'),
  searchGeocode: (query) => fetchJson(`/geocode?q=${encodeURIComponent(query)}`),
  askAi: (prompt, weatherContext, language, placeName) => fetchJson('/ai/ask', {
    method: 'POST',
    body: JSON.stringify({ prompt, weatherContext, language, placeName })
  }),
  getAiBrief: (weatherContext, language, placeName) => fetchJson('/ai/brief', {
    method: 'POST',
    body: JSON.stringify({ weatherContext, language, placeName })
  }),
  getFavorites: () => fetchJson('/favorites'),
  addFavorite: (place) => fetchJson('/favorites', { method: 'POST', body: JSON.stringify(place) }),
  removeFavorite: (id) => fetchJson(`/favorites/${id}`, { method: 'DELETE' }),
  getSettings: () => fetchJson('/settings'),
  updateSettings: (settings) => fetchJson('/settings', { method: 'POST', body: JSON.stringify(settings) })
};
