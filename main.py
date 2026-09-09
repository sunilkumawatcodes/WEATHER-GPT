from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title="WeatherGPT Prototype API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/api/health")
def health():
    return {"status":"ok","service":"WeatherGPT"}

@app.get("/api/weather")
async def weather(lat: float, lon: float):
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m"
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
        "&timezone=auto&forecast_days=5"
    )
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()

@app.post("/api/chat")
async def chat(payload: dict):
    message = payload.get("message","").lower()
    if "rain" in message or "umbrella" in message:
        answer = "Check the hourly precipitation probability before leaving. If it is rising, carry an umbrella and allow extra travel time."
    elif "travel" in message:
        answer = "I would combine current weather, forecast, wind and alerts to calculate a travel-risk score and suggest a safer departure time."
    else:
        answer = "Tell me your activity and location. I can turn weather data into a practical recommendation instead of only showing numbers."
    return {"answer": answer}

@app.post("/api/travel")
async def travel(payload: dict):
    return {
        "score": 86,
        "recommendation": "Good to travel with a backup plan.",
        "ideas": ["Check alerts before departure", "Pack according to rain probability", "Use the best sightseeing window"]
    }
