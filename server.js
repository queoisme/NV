const path = require('path');
const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const insertStmt = db.prepare(`
  INSERT INTO wishes (ten_truong, nganh, diem_san, hoc_phi_ky, hoc_phi_nam, dia_chi)
  VALUES (@ten_truong, @nganh, @diem_san, @hoc_phi_ky, @hoc_phi_nam, @dia_chi)
`);

const updateStmt = db.prepare(`
  UPDATE wishes SET
    ten_truong = @ten_truong,
    nganh = @nganh,
    diem_san = @diem_san,
    hoc_phi_ky = @hoc_phi_ky,
    hoc_phi_nam = @hoc_phi_nam,
    dia_chi = @dia_chi
  WHERE id = @id
`);

function normalizeBody(body) {
  return {
    ten_truong: (body.ten_truong || '').trim(),
    nganh: (body.nganh || '').trim(),
    diem_san: body.diem_san === '' || body.diem_san == null ? null : Number(body.diem_san),
    hoc_phi_ky: body.hoc_phi_ky === '' || body.hoc_phi_ky == null ? null : Number(body.hoc_phi_ky),
    hoc_phi_nam: body.hoc_phi_nam === '' || body.hoc_phi_nam == null ? null : Number(body.hoc_phi_nam),
    dia_chi: (body.dia_chi || '').trim(),
  };
}

app.get('/api/wishes', (req, res) => {
  const rows = db.prepare('SELECT * FROM wishes ORDER BY created_at ASC, id ASC').all();
  res.json(rows);
});

app.post('/api/wishes', (req, res) => {
  const data = normalizeBody(req.body);
  if (!data.ten_truong) {
    return res.status(400).json({ error: 'Tên trường không được để trống' });
  }
  const info = insertStmt.run(data);
  const row = db.prepare('SELECT * FROM wishes WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

app.put('/api/wishes/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM wishes WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Không tìm thấy nguyện vọng' });
  }
  const data = normalizeBody(req.body);
  if (!data.ten_truong) {
    return res.status(400).json({ error: 'Tên trường không được để trống' });
  }
  updateStmt.run({ ...data, id });
  const row = db.prepare('SELECT * FROM wishes WHERE id = ?').get(id);
  res.json(row);
});

app.delete('/api/wishes/:id', (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM wishes WHERE id = ?').run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Không tìm thấy nguyện vọng' });
  }
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
