const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'wishes.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS wishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_truong TEXT NOT NULL,
    nganh TEXT,
    diem_san REAL,
    hoc_phi_ky REAL,
    hoc_phi_nam REAL,
    dia_chi TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

module.exports = db;
