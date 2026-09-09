import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import config from '../config/env.js';

let dbInstance = null;

export function getDatabase() {
  if (dbInstance) return dbInstance;

  const dbDir = path.dirname(config.database.path);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log(`[db] Initializing SQLite database at: ${config.database.path}`);
  dbInstance = new DatabaseSync(config.database.path);

  // Performance & Concurrency Pragmas
  dbInstance.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
  `);

  // Run schema migration
  const schemaPath = path.join(config.rootDir, 'src/database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    dbInstance.exec(schemaSql);
  }

  return dbInstance;
}

// User Settings
export function getSettings() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM user_settings WHERE id = 1');
  return stmt.get() || { temperature_unit: 'c', language: 'en', auto_speak: 0, gemini_api_key: '' };
}

export function updateSettings(updates = {}) {
  const db = getDatabase();
  const current = getSettings();
  const unit = updates.temperature_unit ?? current.temperature_unit;
  const lang = updates.language ?? current.language;
  const speak = updates.auto_speak !== undefined ? (updates.auto_speak ? 1 : 0) : current.auto_speak;
  const key = updates.gemini_api_key !== undefined ? updates.gemini_api_key : current.gemini_api_key;

  const stmt = db.prepare(`
    UPDATE user_settings 
    SET temperature_unit = ?, language = ?, auto_speak = ?, gemini_api_key = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `);
  stmt.run(unit, lang, speak, key);
  return getSettings();
}

// Favorites Management
export function getFavoritePlaces() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM favorite_places ORDER BY id ASC');
  return stmt.all();
}

export function addFavoritePlace({ name, admin1, country, latitude, longitude, custom_label }) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO favorite_places (name, admin1, country, latitude, longitude, custom_label)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(name, admin1 || '', country || 'India', latitude, longitude, custom_label || '');
  return getFavoritePlaces();
}

export function removeFavoritePlace(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM favorite_places WHERE id = ?');
  stmt.run(id);
  return getFavoritePlaces();
}

// 15-Minute Weather Caching
export function getCachedWeather(latitude, longitude) {
  const db = getDatabase();
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const stmt = db.prepare('SELECT payload, expires_at FROM weather_cache WHERE cache_key = ?');
  const row = stmt.get(key);
  if (row && Date.now() < row.expires_at) {
    try {
      return JSON.parse(row.payload);
    } catch {
      return null;
    }
  }
  return null;
}

export function setCachedWeather(latitude, longitude, data, ttlSeconds = 900) {
  const db = getDatabase();
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const now = Date.now();
  const expiresAt = now + (ttlSeconds * 1000);
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO weather_cache (cache_key, latitude, longitude, payload, cached_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(key, latitude, longitude, JSON.stringify(data), now, expiresAt);
}

// Audit Logs
export function logAiConversation(prompt, response, language, latitude, longitude) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO ai_conversations (prompt, response, language, latitude, longitude)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(prompt, response, language, latitude || null, longitude || null);
}

export function logSearch(query, resolved_name, latitude, longitude) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO search_history (query, resolved_name, latitude, longitude)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(query, resolved_name, latitude, longitude);
}
