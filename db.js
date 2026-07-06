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
    to_hop_mon TEXT,
    diem_san REAL,
    hoc_phi_ky REAL,
    hoc_phi_nam REAL,
    dia_chi TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const columns = db.pragma('table_info(wishes)').map(c => c.name);
if (!columns.includes('to_hop_mon')) {
  db.exec(`ALTER TABLE wishes ADD COLUMN to_hop_mon TEXT`);
}

module.exports = db;
