const Database = require("better-sqlite3");

const db = new Database("requests.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS request_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT NOT NULL,
        country TEXT,
        method TEXT,
        endpoint TEXT,
        status_code INTEGER,
        response_time INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

module.exports = db;
