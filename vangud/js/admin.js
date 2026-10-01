/* =====================================================
   VANGUARD — Admin JS (reescrito limpo)
   ===================================================== */

let activePrefix = null;

// ── Leitura de arquivo como Data URL ─────────────────
function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// ── Vincula input file → preview + hidden data ────────
function attachImagePicker(inputId, dataInputId, previewId) {
  const input     = document.getElementById(inputId);
  const dataInput = document.getElementById(dataInputId);
  const preview   = document.getElementById(previewId);
  if (!input || !dataInput || !preview) return;

  input.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    const wrapper = preview.closest('.image-crop-preview');

    if (!file) {
      dataInput.value   = '';
      preview.src       = '';
      preview.style.display = 'none';
      if (wrapper) wrapper.classList.add('is-hidden');
      return;
    }

    try {
      const dataUrl = await readImageFile(file);
      dataInput.value       = dataUrl;
      preview.src           = dataUrl;
      preview.style.display = 'block';
      if (wrapper) wrapper.classList.remove('is-hidden');
    } catch (err) {
      console.error('Erro ao ler imagem:', err);
    }
  });
}

// ── Resolve Data URL da imagem (null = sem nova imagem) ─
async function resolveImageData(inputId, dataInputId) {
  const input     = document.getElementById(inputId);
  const dataInput = document.getElementById(dataInputId);

  // Já existe dataURL armazenado (imagem existente ou recém-carregada)
  if (dataInput?.value) return dataInput.value;

  // Usuário selecionou novo arquivo
  const file = input?.files?.[0];
  if (file) {
    const dataUrl = await readImageFile(file);
    if (dataInput) dataInput.value = dataUrl;
    return dataUrl;
  }

  // Nenhuma imagem — retorna null para preservar foto existente ao editar
  return null;
}

// ── Atualiza a imagem de preview no formulário ────────
function setImagePreview(previewId, value, zoom = 100, posX = 0, posY = 0) {
  const preview = document.getElementById(previewId);
  if (!preview) return;

  const wrapper = preview.closest('.image-crop-preview');

  if (value) {
    preview.src           = value;
    preview.style.display = 'block';
    preview.style.transform = `translate(${posX}px, ${posY}px) scale(${zoom / 100})`;
    if (wrapper) wrapper.classList.remove('is-hidden');

    // Atualiza blur se existir
    const blurImg = wrapper?.querySelector('.service-image-blur');
    if (blurImg) blurImg.src = value;

    // Atualiza caption
    const caption = wrapper?.querySelector('.preview-caption');
    if (caption) caption.textContent = `Pré-visualização • Zoom ${Math.round(zoom)}% • X ${Math.round(posX)} • Y ${Math.round(posY)}`;

    // Aplica classe de fit — padrão é FOTO INTEIRA (--full)
    const prefix = previewId.replace('FotoPreview', '');
    const fitCheckbox = document.getElementById(`${prefix}ImagemCompleta`);
    if (fitCheckbox) {
      // checkbox marcado = recortar; desmarcado = foto inteira (padrão)
      if (fitCheckbox.checked) {
        preview.classList.remove('service-image--full');
        preview.classList.add('service-image--crop');
      } else {
        preview.classList.remove('service-image--crop');
        preview.classList.add('service-image--full');
      }
    } else {
      // Sem checkbox: sempre foto inteira
      preview.classList.remove('service-image--crop');
      preview.classList.add('service-image--full');
    }
  } else {
    preview.src           = '';
    preview.style.display = 'none';
    preview.style.transform = '';
    preview.classList.remove('service-image--full', 'service-image--crop');
    if (wrapper) wrapper.classList.add('is-hidden');

    const blurImg = wrapper?.querySelector('.service-image-blur');
    if (blurImg) blurImg.src = '';

    const caption = wrapper?.querySelector('.preview-caption');
    if (caption) caption.textContent = 'Pré-visualização';
  }
}

// ── Vincula sliders de zoom/posição ao preview ────────
function bindCropControls(prefix, previewId) {
  const zoomInput = document.getElementById(`${prefix}Zoom`);
  const posXInput = document.getElementById(`${prefix}PosX`);
  const posYInput = document.getElementById(`${prefix}PosY`);
  const preview   = document.getElementById(previewId);
  if (!zoomInput || !posXInput || !posYInput || !preview) return;

  const updatePreview = () => {
    const zoom = Number(zoomInput.value || 100);
    const posX = Number(posXInput.value || 0);
    const posY = Number(posYInput.value || 0);
    preview.style.transform = `translate(${posX}px, ${posY}px) scale(${zoom / 100})`;

    const caption = preview.closest('.image-crop-preview')?.querySelector('.preview-caption');
    if (caption) caption.textContent = `Pré-visualização • Zoom ${Math.round(zoom)}% • X ${posX} • Y ${posY}`;

    // Sincroniza com modal se estiver aberto
    if (activePrefix === prefix) {
      const modalImg = document.getElementById('imagePreviewModalImage');
      if (modalImg) modalImg.style.transform = `translate(${posX}px, ${posY}px) scale(${zoom / 100})`;
    }
  };

  [zoomInput, posXInput, posYInput].forEach(inp => inp.addEventListener('input', updatePreview));
}

// ── Drag + scroll no preview do formulário ────────────
function makeImageInteractive(prefix, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  const wrapper = preview.closest('.image-crop-preview');
  if (!wrapper) return;

  const zoomInput = document.getElementById(`${prefix}Zoom`);
  const posXInput = document.getElementById(`${prefix}PosX`);
  const posYInput = document.getElementById(`${prefix}PosY`);
  if (!zoomInput || !posXInput || !posYInput) return;

  let isDragging = false;
  let startX = 0, startY = 0, startPosX = 0, startPosY = 0;

  const hasImage = () => preview.src && !preview.src.endsWith(window.location.href) && !wrapper.classList.contains('is-hidden');

  wrapper.addEventListener('mousedown', (e) => {
    if (!hasImage()) return;
    isDragging = true;
    startX    = e.clientX;
    startY    = e.clientY;
    startPosX = Number(posXInput.value || 0);
    startPosY = Number(posYInput.value || 0);
    wrapper.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const zoom = Number(zoomInput.value || 100);
    const sf   = 100 / zoom;
    let newX = startPosX + (e.clientX - startX) * sf;
    let newY = startPosY + (e.clientY - startY) * sf;
    newX = Math.max(Number(posXInput.min), Math.min(Number(posXInput.max), newX));
    newY = Math.max(Number(posYInput.min), Math.min(Number(posYInput.max), newY));
    posXInput.value = Math.round(newX);
    posYInput.value = Math.round(newY);
    posXInput.dispatchEvent(new Event('input'));
    posYInput.dispatchEvent(new Event('input'));
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) { isDragging = false; wrapper.style.cursor = 'grab'; }
  });

  wrapper.addEventListener('touchstart', (e) => {
    if (!hasImage()) return;
    const t = e.touches[0];
    isDragging = true;
    startX    = t.clientX;
    startY    = t.clientY;
    startPosX = Number(posXInput.value || 0);
    startPosY = Number(posYInput.value || 0);
  });

  wrapper.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const t  = e.touches[0];
    const zoom = Number(zoomInput.value || 100);
    const sf   = 100 / zoom;
    let newX = startPosX + (t.clientX - startX) * sf;
    let newY = startPosY + (t.clientY - startY) * sf;
    newX = Math.max(Number(posXInput.min), Math.min(Number(posXInput.max), newX));
    newY = Math.max(Number(posYInput.min), Math.min(Number(posYInput.max), newY));
    posXInput.value = Math.round(newX);
    posYInput.value = Math.round(newY);
    posXInput.dispatchEvent(new Event('input'));
    posYInput.dispatchEvent(new Event('input'));
    e.preventDefault();
  }, { passive: false });

  wrapper.addEventListener('touchend', () => { isDragging = false; });

  wrapper.addEventListener('wheel', (e) => {
    if (!hasImage()) return;
    e.preventDefault();
    const curr = Number(zoomInput.value || 100);
    const next = Math.max(Number(zoomInput.min), Math.min(Number(zoomInput.max), curr + (e.deltaY < 0 ? 5 : -5)));
    zoomInput.value = next;
    zoomInput.dispatchEvent(new Event('input'));
  }, { passive: false });
}

// ── Drag + scroll no modal de pré-visualização ────────
function makeModalInteractive() {
  const frame      = document.querySelector('.preview-modal__frame');
  const modalImage = document.getElementById('imagePreviewModalImage');
  if (!frame || !modalImage) return;

  let isDragging = false;
  let startX = 0, startY = 0, startPosX = 0, startPosY = 0;

  const isOpen = () => activePrefix && !document.getElementById('imagePreviewModal')?.hidden;

  frame.style.cursor = 'grab';

  frame.addEventListener('mousedown', (e) => {
    if (!isOpen()) return;
    isDragging = true;
    startX    = e.clientX;
    startY    = e.clientY;
    startPosX = Number(document.getElementById(`${activePrefix}PosX`)?.value || 0);
    startPosY = Number(document.getElementById(`${activePrefix}PosY`)?.value || 0);
    frame.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging || !activePrefix) return;
    const zoomInput = document.getElementById(`${activePrefix}Zoom`);
    const posXInput = document.getElementById(`${activePrefix}PosX`);
    const posYInput = document.getElementById(`${activePrefix}PosY`);
    if (!zoomInput || !posXInput || !posYInput) return;
    const zoom = Number(zoomInput.value || 100);
    const sf   = (100 / zoom) * (220 / 400);
    let newX = startPosX + (e.clientX - startX) * sf;
    let newY = startPosY + (e.clientY - startY) * sf;
    newX = Math.max(Number(posXInput.min), Math.min(Number(posXInput.max), newX));
    newY = Math.max(Number(posYInput.min), Math.min(Number(posYInput.max), newY));
    posXInput.value = Math.round(newX);
    posYInput.value = Math.round(newY);
    posXInput.dispatchEvent(new Event('input'));
    posYInput.dispatchEvent(new Event('input'));
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) { isDragging = false; frame.style.cursor = 'grab'; }
  });

  frame.addEventListener('touchstart', (e) => {
    if (!isOpen()) return;
    const t = e.touches[0];
    isDragging = true;
    startX    = t.clientX;
    startY    = t.clientY;
    startPosX = Number(document.getElementById(`${activePrefix}PosX`)?.value || 0);
    startPosY = Number(document.getElementById(`${activePrefix}PosY`)?.value || 0);
  });

  frame.addEventListener('touchmove', (e) => {
    if (!isDragging || !activePrefix) return;
    const t  = e.touches[0];
    const zoomInput = document.getElementById(`${activePrefix}Zoom`);
    const posXInput = document.getElementById(`${activePrefix}PosX`);
    const posYInput = document.getElementById(`${activePrefix}PosY`);
    if (!zoomInput || !posXInput || !posYInput) return;
    const zoom = Number(zoomInput.value || 100);
    const sf   = (100 / zoom) * (220 / 400);
    let newX = startPosX + (t.clientX - startX) * sf;
    let newY = startPosY + (t.clientY - startY) * sf;
    newX = Math.max(Number(posXInput.min), Math.min(Number(posXInput.max), newX));
    newY = Math.max(Number(posYInput.min), Math.min(Number(posYInput.max), newY));
    posXInput.value = Math.round(newX);
    posYInput.value = Math.round(newY);
    posXInput.dispatchEvent(new Event('input'));
    posYInput.dispatchEvent(new Event('input'));
    e.preventDefault();
  }, { passive: false });

  frame.addEventListener('touchend', () => { isDragging = false; });

  frame.addEventListener('wheel', (e) => {
    if (!isOpen()) return;
    e.preventDefault();
    const zoomInput = document.getElementById(`${activePrefix}Zoom`);
    if (!zoomInput) return;
    const curr = Number(zoomInput.value || 100);
    const next = Math.max(Number(zoomInput.min), Math.min(Number(zoomInput.max), curr + (e.deltaY < 0 ? 5 : -5)));
    zoomInput.value = next;
    zoomInput.dispatchEvent(new Event('input'));
  }, { passive: false });
}

// ── Helper para limpar o formulário completamente ─────
function resetForm(formEl, idField, dataField, previewId) {
  formEl.reset();
  document.getElementById(idField).value   = '';
  document.getElementById(dataField).value = '';
  setImagePreview(previewId, '');
}

// ══════════════════════════════════════════════════════
// DOMContentLoaded — inicialização principal
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  console.log('[admin.js] Script carregado com sucesso');

  // ── Verificação de autenticação ─────────────────────
  const usuario = JSON.parse(localStorage.getItem('logado') || 'null');
  if (!usuario || !usuario.admin) {
    window.location.href = 'login.html';
    return;
  }
  console.log('[admin.js] Usuário admin autenticado');

  // ── Referências DOM ─────────────────────────────────
  const previewModal      = document.getElementById('imagePreviewModal');
  const previewModalImage = document.getElementById('imagePreviewModalImage');
  const closePreviewBtn   = document.getElementById('closeImagePreviewModal');
  const logoutBtn         = document.getElementById('logoutBtn');
  const clientesList      = document.getElementById('clientesList');
  const agendaList        = document.getElementById('agendaList');
  const servicosAdminList = document.getElementById('servicosAdminList');
  const barbeirosAdminList = document.getElementById('barbeirosAdminList');
  const produtosAdminList  = document.getElementById('produtosAdminList');
  const feedbacksAdminList = document.getElementById('feedbacksAdminList');
  const formServico  = document.getElementById('formServico');
  const formBarbeiro = document.getElementById('formBarbeiro');
  const formProduto  = document.getElementById('formProduto');

  // ── Logout ──────────────────────────────────────────
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('logado');
    window.location.href = 'login.html';
  });

  // ── Modal de pré-visualização ────────────────────────
  function closeImagePreviewModal() {
    if (!previewModal) return;
    previewModal.hidden = true;
    document.body.style.overflow = '';
    activePrefix = null;
  }

  function openImagePreview(prefix) {
    const preview   = document.getElementById(`${prefix}FotoPreview`);
    const zoomInput = document.getElementById(`${prefix}Zoom`);
    const posXInput = document.getElementById(`${prefix}PosX`);
    const posYInput = document.getElementById(`${prefix}PosY`);
    if (!previewModal || !previewModalImage || !preview?.src) return;

    activePrefix = prefix;
    const zoom = Number(zoomInput?.value || 100);
    const posX = Number(posXInput?.value || 0);
    const posY = Number(posYInput?.value || 0);

    previewModalImage.src = preview.src;
    previewModalImage.style.transform = `translate(${posX}px, ${posY}px) scale(${zoom / 100})`;

    const modalBlur = document.getElementById('imagePreviewModalImageBlur');
    if (modalBlur) modalBlur.src = preview.src;

    if (preview.classList.contains('service-image--full')) {
      previewModalImage.classList.remove('service-image--crop');
      previewModalImage.classList.add('service-image--full');
    } else {
      previewModalImage.classList.remove('service-image--full');
      previewModalImage.classList.add('service-image--crop');
    }

    previewModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  document.querySelectorAll('[data-preview-target]').forEach(btn => {
    btn.addEventListener('click', () => openImagePreview(btn.dataset.previewTarget));
  });

  closePreviewBtn?.addEventListener('click', closeImagePreviewModal);
  previewModal?.querySelector('[data-close-preview-modal]')?.addEventListener('click', closeImagePreviewModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeImagePreviewModal(); });

  // ── Inicializa pickers, controles e interatividade ──
  attachImagePicker('servicoFoto',  'servicoFotoData',  'servicoFotoPreview');
  attachImagePicker('barbeiroFoto', 'barbeiroFotoData', 'barbeiroFotoPreview');
  attachImagePicker('produtoFoto',  'produtoFotoData',  'produtoFotoPreview');

  bindCropControls('servico', 'servicoFotoPreview');
  bindCropControls('produto', 'produtoFotoPreview');

  makeImageInteractive('servico', 'servicoFotoPreview');
  makeImageInteractive('produto', 'produtoFotoPreview');
  makeModalInteractive();

  // Checkbox "recortar imagem" para serviço — DESMARCADO = foto inteira (padrão)
  document.getElementById('servicoImagemCompleta')?.addEventListener('change', (e) => {
    const preview = document.getElementById('servicoFotoPreview');
    if (!preview?.src) return;
    // checkbox MARCADO = recortar; DESMARCADO = foto inteira
    preview.classList.toggle('service-image--crop', e.target.checked);
    preview.classList.toggle('service-image--full', !e.target.checked);
  });

  // Garante que ao carregar nova imagem o padrão seja foto inteira
  document.getElementById('servicoFoto')?.addEventListener('change', () => {
    const preview = document.getElementById('servicoFotoPreview');
    const checkbox = document.getElementById('servicoImagemCompleta');
    if (preview && checkbox) {
      checkbox.checked = false;
      preview.classList.remove('service-image--crop');
      preview.classList.add('service-image--full');
    }
  });

  // Checkbox para produto — DESMARCADO = foto inteira (padrão)
  document.getElementById('produtoImagemCompleta')?.addEventListener('change', (e) => {
    const preview = document.getElementById('produtoFotoPreview');
    if (!preview?.src) return;
    preview.classList.toggle('service-image--crop', e.target.checked);
    preview.classList.toggle('service-image--full', !e.target.checked);
  });

  // Garante que ao carregar nova imagem de produto o padrão seja foto inteira
  document.getElementById('produtoFoto')?.addEventListener('change', () => {
    const preview = document.getElementById('produtoFotoPreview');
    const checkbox = document.getElementById('produtoImagemCompleta');
    if (preview && checkbox) {
      checkbox.checked = false;
      preview.classList.remove('service-image--crop');
      preview.classList.add('service-image--full');
    }
  });

  // ── Helper API (Supabase) ────────────────────────────
  const SUPABASE_URL = 'https://pjwrkecbcddnqfajjgjr.supabase.co/rest/v1';
  const SUPABASE_KEY = 'sb_publishable_oyWF1sCKBgjqQMic7acIUg_HZnXAiSP';
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const api = {
    get: async (table) => {
      try {
        const res = await fetch(`${SUPABASE_URL}/${table}?select=*`, { headers });
        return await res.json();
      } catch (err) {
        console.error(`Erro ao buscar ${table}:`, err);
        return [];
      }
    },
    post: async (table, data) => {
      const res = await fetch(`${SUPABASE_URL}/${table}`, {
        method: 'POST', headers, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      return json[0];
    },
    put: async (table, id, data) => {
      const res = await fetch(`${SUPABASE_URL}/${table}?id=eq.${id}`, {
        method: 'PATCH', headers, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      return json[0];
    },
    delete: async (table, id) => {
      const res = await fetch(`${SUPABASE_URL}/${table}?id=eq.${id}`, {
        method: 'DELETE', headers
      });
      if (!res.ok) throw new Error(await res.text());
    }
  };

  // ── Render functions ─────────────────────────────────
  async function renderClientes() {
    const usuarios = await api.get('usuarios');
    clientesList.innerHTML = usuarios
      .filter(u => !u.admin)
      .map(u => `<article class="card"><h3>${u.nome}</h3><p>${u.whatsapp}</p><p>${u.cpf}</p></article>`)
      .join('');
  }

  async function renderAgenda() {
    const agendamentos = await api.get('agendamentos');
    agendaList.innerHTML = agendamentos.length
      ? agendamentos.map(a => `<article class="card"><h3>${a.data}</h3><p>${a.hora}</p><p>${a.cliente}</p></article>`).join('')
      : '<p class="hint">Nenhum agendamento ainda.</p>';
  }

  async function renderServicos() {
    const servicos = await api.get('servicos');
    servicosAdminList.innerHTML = servicos.map(s => `
      <article class="card service-card">
        ${s.foto ? `
          <div class="image-crop-preview">
            <img class="service-image-blur" src="${s.foto}" alt="" />
            <img class="service-image ${s.imageFit === 'contain' ? 'service-image--full' : 'service-image--crop'}"
                 src="${s.foto}" alt="${s.nome}"
                 style="transform: translate(${s.posX || 0}px, ${s.posY || 0}px) scale(${(s.zoom || 100) / 100});" />
          </div>
        ` : ''}
        <h3>${s.nome}</h3>
        <p>R$ ${s.preco}</p>
        <p>${s.duracao || ''}</p>
        <div class="topbar-actions">
          <button class="btn btn-outline-magenta" data-action="edit-servico"   data-id="${s.id}">Editar</button>
          <button class="btn btn-secondary"       data-action="delete-servico" data-id="${s.id}">Excluir</button>
        </div>
      </article>
    `).join('');
  }

  async function renderBarbeiros() {
    const barbeiros = await api.get('barbeiros');
    barbeirosAdminList.innerHTML = barbeiros.map(b => `
      <article class="card">
        ${b.foto ? `<img class="service-image" src="${b.foto}" alt="${b.nome}" />` : ''}
        <h3>${b.nome}</h3>
        <p>${b.especialidade}</p>
        <button class="btn btn-outline-magenta" data-action="edit-barbeiro" data-id="${b.id}">Editar</button>
      </article>
    `).join('');
  }

  async function renderProdutos() {
    const produtos = await api.get('produtos');
    produtosAdminList.innerHTML = produtos.map(p => `
      <article class="card product-card">
        ${p.foto ? `
          <div class="image-crop-preview">
            <img class="service-image-blur" src="${p.foto}" alt="" />
            <img class="service-image ${p.imageFit === 'contain' ? 'service-image--full' : 'service-image--crop'}"
                 src="${p.foto}" alt="${p.nome}"
                 style="transform: translate(${p.posX || 0}px, ${p.posY || 0}px) scale(${(p.zoom || 100) / 100});" />
          </div>
        ` : ''}
        <h3>${p.nome}</h3>
        <p>R$ ${p.preco}</p>
        <div class="topbar-actions">
          <button class="btn btn-outline-magenta" data-action="edit-produto"   data-id="${p.id}">Editar</button>
          <button class="btn btn-secondary"       data-action="delete-produto" data-id="${p.id}">Excluir</button>
        </div>
      </article>
    `).join('');
  }

  async function renderFeedbacks() {
    const feedbacks = await api.get('feedbacks');
    feedbacksAdminList.innerHTML = feedbacks.length
      ? feedbacks.map(f => `<article class="card"><h3>${f.cliente}</h3><p>${f.comentario}</p><p>Nota: ${f.notaNumero || f.nota || '—'}</p></article>`).join('')
      : '<p class="hint">Nenhum feedback ainda.</p>';
  }

  async function renderMetrics() {
    try {
      const hoje = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

      const [usuarios, agendamentos, feedbacks, servicos, barbeiros] = await Promise.all([
        api.get('usuarios'),
        api.get('agendamentos'),
        api.get('feedbacks'),
        api.get('servicos'),
        api.get('barbeiros')
      ]);

      const clientes        = usuarios.filter(u => !u.admin);
      const agendamentosHoje = agendamentos.filter(ag => ag.data === hoje);

      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      set('metricAgendamentos', agendamentosHoje.length);
      set('metricClientes',     clientes.length);
      set('metricFeedbacks',    feedbacks.length);
      set('metricServicos',     servicos.length);
      set('metricBarbeiros',    barbeiros.length);
    } catch (err) {
      console.error('[admin.js] Erro ao carregar métricas:', err);
    }
  }

  async function renderGaleria() {
    const galeriaAdminList = document.getElementById('galeriaAdminList');
    if (!galeriaAdminList) return;
    const itens = await api.get('galeria');
    if (!itens.length) {
      galeriaAdminList.innerHTML = '<p class="hint">Nenhuma foto na galeria ainda.</p>';
      return;
    }
    galeriaAdminList.innerHTML = itens.map(g => `
      <article class="gallery-admin-card">
        <div class="image-crop-preview">
          <img class="service-image-blur" src="${g.foto}" alt="" />
          <img class="service-image ${g.imageFit === 'cover' ? 'service-image--crop' : 'service-image--full'}"
               src="${g.foto}" alt="Galeria"
               style="transform: translate(${g.posX || 0}px, ${g.posY || 0}px) scale(${(g.zoom || 100) / 100});" />
        </div>
        <div class="gallery-admin-info">
          <p class="gallery-descricao">${g.descricao}</p>
          <div class="topbar-actions">
            <button class="btn btn-outline-magenta" data-action="edit-galeria"   data-id="${g.id}">Editar</button>
            <button class="btn btn-secondary"       data-action="delete-galeria" data-id="${g.id}">Excluir</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // ── Submit: Salvar serviço ───────────────────────────
  console.log('[admin.js] formServico encontrado:', !!formServico);
  formServico?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const id       = document.getElementById('servicoId').value.trim();
      const nome     = document.getElementById('servicoNome').value.trim();
      const preco    = Number(document.getElementById('servicoPreco').value);
      const duracao  = document.getElementById('servicoDuracao').value.trim();
      const imageFit = document.getElementById('servicoImagemCompleta').checked ? 'contain' : 'cover';
      const zoom     = Number(document.getElementById('servicoZoom').value || 100);
      const posX     = Number(document.getElementById('servicoPosX').value || 0);
      const posY     = Number(document.getElementById('servicoPosY').value || 0);
      const fotoResolvida = await resolveImageData('servicoFoto', 'servicoFotoData');
      
      const payload = { nome, preco, duracao, imageFit, zoom, posX, posY };
      if (fotoResolvida !== null) {
        payload.foto = fotoResolvida;
      }

      if (id) {
        await api.put('servicos', id, payload);
      } else {
        payload.foto = fotoResolvida || '';
        await api.post('servicos', payload);
      }

      resetForm(formServico, 'servicoId', 'servicoFotoData', 'servicoFotoPreview');
      await renderServicos();
    } catch (err) {
      console.error('[admin.js] ❌ Erro ao salvar serviço:', err);
      alert('Erro ao salvar serviço: ' + err.message);
    }
  });

  // ── Submit: Salvar barbeiro ──────────────────────────
  formBarbeiro?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const id           = document.getElementById('barbeiroId').value.trim();
      const nome         = document.getElementById('barbeiroNome').value.trim();
      const especialidade = document.getElementById('barbeiroEspecialidade').value.trim();
      const fotoResolvida = await resolveImageData('barbeiroFoto', 'barbeiroFotoData');

      const payload = { nome, especialidade };
      if (fotoResolvida !== null) {
        payload.foto = fotoResolvida;
      }

      if (id) {
        await api.put('barbeiros', id, payload);
      } else {
        payload.foto = fotoResolvida || '';
        await api.post('barbeiros', payload);
      }

      resetForm(formBarbeiro, 'barbeiroId', 'barbeiroFotoData', 'barbeiroFotoPreview');
      await renderBarbeiros();
    } catch (err) {
      console.error('[admin.js] ❌ Erro ao salvar barbeiro:', err);
      alert('Erro ao salvar barbeiro: ' + err.message);
    }
  });

  // ── Submit: Salvar produto ───────────────────────────
  formProduto?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const id        = document.getElementById('produtoId').value.trim();
      const nome      = document.getElementById('produtoNome').value.trim();
      const preco     = Number(document.getElementById('produtoPreco').value);
      const imageFit  = document.getElementById('produtoImagemCompleta').checked ? 'contain' : 'cover';
      const zoom      = Number(document.getElementById('produtoZoom').value || 100);
      const posX      = Number(document.getElementById('produtoPosX').value || 0);
      const posY      = Number(document.getElementById('produtoPosY').value || 0);
      const fotoResolvida = await resolveImageData('produtoFoto', 'produtoFotoData');

      const payload = { nome, preco, imageFit, zoom, posX, posY };
      if (fotoResolvida !== null) {
        payload.foto = fotoResolvida;
      }

      if (id) {
        await api.put('produtos', id, payload);
      } else {
        payload.foto = fotoResolvida || '';
        await api.post('produtos', payload);
      }

      resetForm(formProduto, 'produtoId', 'produtoFotoData', 'produtoFotoPreview');
      await renderProdutos();
    } catch (err) {
      console.error('[admin.js] ❌ Erro ao salvar produto:', err);
      alert('Erro ao salvar produto: ' + err.message);
    }
  });

  // ── Submit: Salvar Galeria ───────────────────────────
  const formGaleria = document.getElementById('formGaleria');
  formGaleria?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const id        = document.getElementById('galeriaId').value.trim();
      const descricao = document.getElementById('galeriaDescricao').value.trim();
      const imageFit  = document.getElementById('galeriaImagemCompleta').checked ? 'cover' : 'contain';
      const zoom      = Number(document.getElementById('galeriaZoom').value || 100);
      const posX      = Number(document.getElementById('galeriaPosX').value || 0);
      const posY      = Number(document.getElementById('galeriaPosY').value || 0);
      const fotoResolvida = await resolveImageData('galeriaFoto', 'galeriaFotoData');

      const payload = { descricao, imageFit, zoom, posX, posY };
      if (fotoResolvida !== null) {
        payload.foto = fotoResolvida;
      }

      if (id) {
        await api.put('galeria', id, payload);
      } else {
        if (!fotoResolvida) {
          alert('Por favor, selecione uma imagem para a galeria.');
          return;
        }
        payload.foto = fotoResolvida;
        await api.post('galeria', payload);
      }

      resetForm(formGaleria, 'galeriaId', 'galeriaFotoData', 'galeriaFotoPreview');
      await renderGaleria();
    } catch (err) {
      console.error('[admin.js] ❌ Erro ao salvar na galeria:', err);
      alert('Erro ao salvar na galeria: ' + err.message);
    }
  });

  // Checkbox da galeria
  document.getElementById('galeriaImagemCompleta')?.addEventListener('change', (e) => {
    const preview = document.getElementById('galeriaFotoPreview');
    if (!preview?.src) return;
    preview.classList.toggle('service-image--crop', e.target.checked);
    preview.classList.toggle('service-image--full', !e.target.checked);
  });
  document.getElementById('galeriaFoto')?.addEventListener('change', () => {
    const preview = document.getElementById('galeriaFotoPreview');
    const checkbox = document.getElementById('galeriaImagemCompleta');
    if (preview && checkbox) {
      checkbox.checked = false;
      preview.classList.remove('service-image--crop');
      preview.classList.add('service-image--full');
    }
  });

  // Iniciar binds da galeria
  attachImagePicker('galeriaFoto', 'galeriaFotoData', 'galeriaFotoPreview');
  bindCropControls('galeria', 'galeriaFotoPreview');
  makeImageInteractive('galeria', 'galeriaFotoPreview');

  // ── Editar / Excluir por delegação de evento ─────────
  document.addEventListener('click', async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;
    const id     = target.dataset.id;

    // --- Editar Serviço ---
    if (action === 'edit-servico') {
      const servicos = await api.get('servicos');
      const s = servicos.find(s => String(s.id) === String(id));
      if (!s) return;
      document.getElementById('servicoId').value             = s.id;
      document.getElementById('servicoNome').value           = s.nome;
      document.getElementById('servicoPreco').value          = s.preco;
      document.getElementById('servicoDuracao').value        = s.duracao || '';
      document.getElementById('servicoFotoData').value       = s.foto || '';
      document.getElementById('servicoImagemCompleta').checked = s.imageFit === 'contain';
      document.getElementById('servicoZoom').value           = s.zoom || 100;
      document.getElementById('servicoPosX').value           = s.posX || 0;
      document.getElementById('servicoPosY').value           = s.posY || 0;
      setImagePreview('servicoFotoPreview', s.foto || '', s.zoom || 100, s.posX || 0, s.posY || 0);
      document.getElementById('formServico')?.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Excluir Serviço ---
    if (action === 'delete-servico') {
      if (confirm('Deseja realmente excluir este serviço?')) {
        await api.delete('servicos', id);
        await renderServicos();
      }
    }

    // --- Editar Barbeiro ---
    if (action === 'edit-barbeiro') {
      const barbeiros = await api.get('barbeiros');
      const b = barbeiros.find(b => String(b.id) === String(id));
      if (!b) return;
      document.getElementById('barbeiroId').value           = b.id;
      document.getElementById('barbeiroNome').value         = b.nome;
      document.getElementById('barbeiroEspecialidade').value = b.especialidade;
      document.getElementById('barbeiroFotoData').value     = b.foto || '';
      setImagePreview('barbeiroFotoPreview', b.foto || '');
      document.getElementById('formBarbeiro')?.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Editar Produto ---
    if (action === 'edit-produto') {
      const produtos = await api.get('produtos');
      const p = produtos.find(p => String(p.id) === String(id));
      if (!p) return;
      document.getElementById('produtoId').value              = p.id;
      document.getElementById('produtoNome').value            = p.nome;
      document.getElementById('produtoPreco').value           = p.preco;
      document.getElementById('produtoFotoData').value        = p.foto || '';
      document.getElementById('produtoImagemCompleta').checked = p.imageFit === 'contain';
      document.getElementById('produtoZoom').value            = p.zoom || 100;
      document.getElementById('produtoPosX').value            = p.posX || 0;
      document.getElementById('produtoPosY').value            = p.posY || 0;
      setImagePreview('produtoFotoPreview', p.foto || '', p.zoom || 100, p.posX || 0, p.posY || 0);
      document.getElementById('formProduto')?.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Excluir Produto ---
    if (action === 'delete-produto') {
      if (confirm('Deseja realmente excluir este produto?')) {
        await api.delete('produtos', id);
        await renderProdutos();
      }
    }

    // --- Editar item da Galeria ---
    if (action === 'edit-galeria') {
      const itens = await api.get('galeria');
      const g = itens.find(g => String(g.id) === String(id));
      if (!g) return;
      document.getElementById('galeriaId').value          = g.id;
      document.getElementById('galeriaDescricao').value   = g.descricao || '';
      document.getElementById('galeriaFotoData').value    = g.foto || '';
      document.getElementById('galeriaImagemCompleta').checked = g.imageFit === 'cover';
      document.getElementById('galeriaZoom').value        = g.zoom || 100;
      document.getElementById('galeriaPosX').value        = g.posX || 0;
      document.getElementById('galeriaPosY').value        = g.posY || 0;
      setImagePreview('galeriaFotoPreview', g.foto || '', g.zoom || 100, g.posX || 0, g.posY || 0);
      document.getElementById('formGaleria')?.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Excluir item da Galeria ---
    if (action === 'delete-galeria') {
      if (confirm('Deseja realmente excluir esta foto da galeria?')) {
        await api.delete('galeria', id);
        await renderGaleria();
      }
    }
  });

  // ── Renderização inicial ─────────────────────────────
  renderClientes();
  renderAgenda();
  renderServicos();
  renderBarbeiros();
  renderProdutos();
  renderFeedbacks();
  renderGaleria();
  renderMetrics();
});
