const form = document.getElementById('wish-form');
const wishIdInput = document.getElementById('wish-id');
const tenTruongInput = document.getElementById('ten_truong');
const nganhInput = document.getElementById('nganh');
const diemSanInput = document.getElementById('diem_san');
const hocPhiKyInput = document.getElementById('hoc_phi_ky');
const hocPhiNamInput = document.getElementById('hoc_phi_nam');
const diaChiInput = document.getElementById('dia_chi');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const formError = document.getElementById('form-error');
const wishList = document.getElementById('wish-list');
const emptyState = document.getElementById('empty-state');

const exportBtn = document.getElementById('export-btn');
const exportContainer = document.getElementById('export-container');

const currencyFormatter = new Intl.NumberFormat('vi-VN');
let cachedWishes = [];

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return 'Chưa có';
  return `${currencyFormatter.format(value)} đ`;
}

function formatScore(value) {
  if (value === null || value === undefined || value === '') return 'Chưa có';
  return value;
}

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function clearError() {
  formError.hidden = true;
  formError.textContent = '';
}

function resetForm() {
  form.reset();
  wishIdInput.value = '';
  formTitle.textContent = 'Thêm nguyện vọng mới';
  submitBtn.textContent = 'Lưu nguyện vọng';
  cancelEditBtn.hidden = true;
  clearError();
}

function fillForm(wish) {
  wishIdInput.value = wish.id;
  tenTruongInput.value = wish.ten_truong || '';
  nganhInput.value = wish.nganh || '';
  diemSanInput.value = wish.diem_san ?? '';
  hocPhiKyInput.value = wish.hoc_phi_ky ?? '';
  hocPhiNamInput.value = wish.hoc_phi_nam ?? '';
  diaChiInput.value = wish.dia_chi || '';
  formTitle.textContent = `Sửa nguyện vọng: ${wish.ten_truong}`;
  submitBtn.textContent = 'Cập nhật nguyện vọng';
  cancelEditBtn.hidden = false;
  clearError();
  form.scrollIntoView({ behavior: 'smooth' });
}

function renderWishes(wishes) {
  cachedWishes = wishes;
  wishList.innerHTML = '';
  emptyState.hidden = wishes.length !== 0;
  exportBtn.hidden = wishes.length === 0;

  wishes.forEach((wish) => {
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
      <h3>${escapeHtml(wish.ten_truong)}</h3>
      <div class="field"><span class="label">Ngành</span><span class="value">${escapeHtml(wish.nganh) || 'Chưa có'}</span></div>
      <div class="field"><span class="label">Điểm sàn</span><span class="value">${formatScore(wish.diem_san)}</span></div>
      <div class="field"><span class="label">Học phí / kỳ</span><span class="value">${formatMoney(wish.hoc_phi_ky)}</span></div>
      <div class="field"><span class="label">Học phí / năm</span><span class="value">${formatMoney(wish.hoc_phi_nam)}</span></div>
      <div class="field"><span class="label">Địa chỉ</span><span class="value">${escapeHtml(wish.dia_chi) || 'Chưa có'}</span></div>
      <div class="card-actions">
        <button type="button" class="btn-edit">Sửa</button>
        <button type="button" class="btn-delete">Xoá</button>
      </div>
    `;
    card.querySelector('.btn-edit').addEventListener('click', () => fillForm(wish));
    card.querySelector('.btn-delete').addEventListener('click', () => deleteWish(wish.id));
    wishList.appendChild(card);
  });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadWishes() {
  try {
    const res = await fetch('/api/wishes');
    if (!res.ok) throw new Error('Không tải được danh sách');
    const wishes = await res.json();
    renderWishes(wishes);
  } catch (err) {
    emptyState.hidden = false;
    emptyState.textContent = 'Không tải được dữ liệu. Vui lòng tải lại trang.';
  }
}

async function deleteWish(id) {
  if (!confirm('Bạn có chắc muốn xoá nguyện vọng này?')) return;
  try {
    const res = await fetch(`/api/wishes/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Xoá thất bại');
    await loadWishes();
  } catch (err) {
    alert('Không xoá được. Vui lòng thử lại.');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const payload = {
    ten_truong: tenTruongInput.value.trim(),
    nganh: nganhInput.value.trim(),
    diem_san: diemSanInput.value,
    hoc_phi_ky: hocPhiKyInput.value,
    hoc_phi_nam: hocPhiNamInput.value,
    dia_chi: diaChiInput.value.trim(),
  };

  if (!payload.ten_truong) {
    showError('Vui lòng nhập tên trường.');
    return;
  }

  const id = wishIdInput.value;
  const url = id ? `/api/wishes/${id}` : '/api/wishes';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Không lưu được, thử lại.');
    }
    resetForm();
    await loadWishes();
  } catch (err) {
    showError(err.message || 'Không lưu được, thử lại.');
  }
});

cancelEditBtn.addEventListener('click', resetForm);

function buildExportHtml(wishes) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  let cards = '';
  wishes.forEach((w, i) => {
    cards += `
      <div class="export-card">
        <h3 class="export-card-title">
          <span class="nv-badge">NV${i + 1}</span>${escapeHtml(w.ten_truong)}
        </h3>
        <div class="export-row"><span class="elabel">Ngành</span><span class="evalue">${escapeHtml(w.nganh) || '—'}</span></div>
        <div class="export-row"><span class="elabel">Điểm sàn</span><span class="evalue">${formatScore(w.diem_san)}</span></div>
        <div class="export-row"><span class="elabel">Học phí / kỳ</span><span class="evalue">${formatMoney(w.hoc_phi_ky)}</span></div>
        <div class="export-row"><span class="elabel">Học phí / năm</span><span class="evalue">${formatMoney(w.hoc_phi_nam)}</span></div>
        <div class="export-row"><span class="elabel">Địa chỉ</span><span class="evalue">${escapeHtml(w.dia_chi) || '—'}</span></div>
      </div>`;
  });
  return `
    <div class="export-frame">
      <div class="export-header">
        <h1>Nguyện vọng xét tuyển đại học</h1>
        <p>Tổng cộng ${wishes.length} nguyện vọng • Cập nhật ngày ${dateStr}</p>
      </div>
      <div class="export-cards">${cards}</div>
      <div class="export-footer">Xuất từ ứng dụng Nguyện vọng xét tuyển</div>
    </div>`;
}

exportBtn.addEventListener('click', async () => {
  if (cachedWishes.length === 0) return;
  exportBtn.disabled = true;
  exportBtn.textContent = 'Đang xuất...';

  exportContainer.innerHTML = buildExportHtml(cachedWishes);

  try {
    const frame = exportContainer.querySelector('.export-frame');
    const canvas = await html2canvas(frame, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    const link = document.createElement('a');
    link.download = `nguyen-vong-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    alert('Không xuất được hình ảnh. Vui lòng thử lại.');
  } finally {
    exportBtn.disabled = false;
    exportBtn.textContent = '📸 Xuất hình ảnh';
    exportContainer.innerHTML = '';
  }
});

loadWishes();
