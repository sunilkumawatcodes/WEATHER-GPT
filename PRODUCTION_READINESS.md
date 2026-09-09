# Production-readiness checklist

1. Authoritative warning ingestion: IMD/approved source, signed/validated feed, affected-area matching, expiry and deduplication.
2. AI grounding: retrieve structured weather/warnings first; LLM only explains. Refuse to guess missing values.
3. Failure handling: loading states, API timeout/failure, stale-data timestamp, no-data response, cached app shell.
4. Accessibility: large controls, semantic labels, keyboard support, high contrast, voice fallback, simple language.
5. Privacy: minimize location storage, explain permissions, HTTPS, server-side secrets, retention policy.
6. Notifications: user opt-in, quiet hours, deduplication, severity thresholds, expiry, official-warning priority.
7. Observability: latency, API error rate, data freshness, answer grounding checks, alert delivery metrics.
8. Evaluation: test locations, time zones, ambiguous queries, multilingual speech, source disagreement and API outages.
9. Disaster safety: never present a derived score as an emergency clearance; link/route users to authoritative warnings.
10. Scalability: backend cache, rate limits, queue-based alerting, database/PostGIS, WebSocket/MQTT where required.
