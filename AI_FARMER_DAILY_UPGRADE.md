# WeatherGPT SIH — AI Chat, Daily Ideas & Farmer Mode Upgrade

## Ask WeatherGPT
The standalone prototype now uses a broader deterministic weather query engine instead of four fixed answer branches. It interprets common natural-language weather requests for:
- current weather and location
- rain probability and forecast rain amount
- today/tomorrow/day-after-tomorrow
- hourly and exact-time temperature/rain/wind
- high/low temperature and feels-like temperature
- humidity
- wind
- UV/sun exposure
- AQI and PM2.5
- visibility and fog
- sunrise and sunset
- forecast/7-day summaries
- clothing and umbrella guidance
- outdoor activity, commute, driving, biking and travel safety
- best time to go outside
- farming, irrigation, spraying, sowing, harvesting and field work

Unknown questions return a helpful capability response instead of repeating the same generic weather summary.

## Anti-hallucination design
The chat never invents weather values. Numeric values are read from the retrieved Open-Meteo data object. The assistant is an explanation/decision layer, not the source of truth. This matches the SIH architecture guidance: weather source → structured data → validation → AI explanation → user.

## Daily Ideas
Daily Ideas are now generated from live conditions, including rain, wind, temperature, UV, AQI and risk. Cards adapt to the current day and include morning planning, rain watch, outdoor activity, hydration/sun, commute, evening planning, air quality and a farmer check.

## Farmer Mode
Farmer Mode now provides context-aware weather advisories for the selected crop, including:
- irrigation timing
- spray suitability using rain/wind conditions
- rain protection
- heat-stress planning
- field-work suitability
- harvest planning
- general crop/weather planning

All agricultural outputs are explicitly weather-based decision support, not official agricultural prescriptions. Judges should be shown the connected source and this distinction.

## SIH note
Do not claim live IMD warnings, official agricultural advisories, route traffic, radar or an external LLM unless those integrations are actually connected. Critical warnings should remain separate from free-form AI responses.
