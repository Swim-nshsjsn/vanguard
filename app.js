// ====== APP.JS - LÓGICA PRINCIPAL DO APLICATIVO ======

let currentUser = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;
let selectedTime = null;
let selectedBarbeiro = null;
let selectedService = null;
let selectedRating = 0;

// ====== INICIALIZAÇÃO ======
document.addEventListener('DOMContentLoaded', () => {
  loadUser();
  navigateTo('home');
  loadServices();
  loadCategorias();
  loadBarbeiros();
  loadFeedbacks();
  attachAuthForms();
});

// ====== AUTENTICAÇÃO ======
function loadUser() {
  const userJson = localStorage.getItem('currentUser');
  if (userJson) {
    currentUser = JSON.parse(userJson);
    updateAuthUI();
  }
}

function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  const headerActions = document.getElementById('headerActions');

  if (currentUser) {
    // Usuário logado
    if (currentUser.role === 'admin') {
      authBtn.textContent = '👨‍💼 ADMIN';
      authBtn.onclick = () => navigateTo('dashboard-admin');
    } else {
      authBtn.textContent = '👤 MEU PERFIL';
      authBtn.onclick = () => navigateTo('dashboard-client');
    }
    
    // Mostrar seção de feedback para clientes
    if (currentUser.role === 'client') {
      document.getElementById('addFeedbackForm').style.display = 'block';
    }
  } else {
    authBtn.textContent = 'LOGIN';
    authBtn.onclick = () => navigateTo('login');
  }
}

function attachAuthForms() {
  // LOGIN
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const senha = document.getElementById('loginPassword').value;
      
      const user = db.getUserByEmail(email);
      if (user && user.senha === senha) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateAuthUI();
        document.getElementById('loginMessage').textContent = '✅ Login realizado com sucesso!';
        setTimeout(() => navigateTo('home'), 1500);
      } else {
        document.getElementById('loginMessage').textContent = '❌ Email ou senha incorretos';
      }
    });
  }

  // REGISTER
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = document.getElementById('regNome').value;
      const email = document.getElementById('regEmail').value;
      const cpf = document.getElementById('regCPF').value;
      const whatsapp = document.getElementById('regWhatsapp').value;
      const senha = document.getElementById('regPassword').value;

      if (db.getUserByEmail(email)) {
        document.getElementById('registerMessage').textContent = '❌ Email já cadastrado';
        return;
      }

      const newUser = db.createUser({
        nome, email, cpf, whatsapp, senha, role: 'client'
      });

      document.getElementById('registerMessage').textContent = '✅ Cadastro realizado! Faça login agora.';
      setTimeout(() => navigateTo('login'), 1500);
    });
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateAuthUI();
  navigateTo('home');
}

// ====== NAVEGAÇÃO SPA ======
function navigateTo(section) {
  // Verificar autenticação para dashboard
  if ((section === 'dashboard-client' || section === 'dashboard-admin') && !currentUser) {
    navigateTo('login');
    return;
  }

  if (section === 'dashboard-admin' && currentUser.role !== 'admin') {
    alert('Acesso restrito ao admin');
    return;
  }

  if (section === 'dashboard-client' && currentUser.role !== 'client') {
    alert('Acesso restrito a clientes');
    return;
  }

  // Ocultar todas as seções
  document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
  
  // Mostrar seção selecionada
  const targetSection = document.getElementById(section);
  if (targetSection) {
    targetSection.style.display = 'block';
  }

  // Atualizar nav links
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  const activeLink = document.querySelector(`[data-section="${section}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  window.scrollTo(0, 0);

  // Ações específicas de seções
  if (section === 'booking') {
    renderCalendar();
    loadBarbeiroCards();
    loadTimeSlots();
  } else if (section === 'services') {
    loadServices();
  } else if (section === 'gallery') {
    loadGallery();
  } else if (section === 'feedbacks') {
    loadFeedbacks();
  } else if (section === 'dashboard-client') {
    loadClientDashboard();
  } else if (section === 'dashboard-admin') {
    loadAdminDashboard();
  }
}

// ====== CATEGORIAS ======
function loadCategorias() {
  const categorias = db.getCategorias();
  const container = document.querySelector('.category-filters');
  
  categorias.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = cat.icone + ' ' + cat.nome;
    btn.onclick = () => filterServices(cat.id);
    container.appendChild(btn);
  });
}

function filterServices(categoriaId) {
  // Atualizar botões de filtro
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  loadServices(categoriaId);
}

// ====== SERVIÇOS ======
function loadServices(categoriaId = null) {
  const servicos = db.getServicos(categoriaId);
  const grid = document.getElementById('servicesGrid');
  
  if (!grid) return;
  
  grid.innerHTML = '';

  servicos.forEach(servico => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <img src="${servico.foto}" alt="${servico.nome}" class="service-image">
      <div class="service-icon">✂️</div>
      <h3 class="service-name">${servico.nome}</h3>
      <p class="service-description">${servico.descricao}</p>
      <div class="service-price">R$ ${servico.preco.toFixed(2)}</div>
      <a href="#" class="btn btn-outline" onclick="selectServiceForBooking(${servico.id}); navigateTo('booking'); return false;">AGENDAR</a>
    `;
    grid.appendChild(card);
  });

  // Também atualizar selects
  updateServiceSelects();
}

function updateServiceSelects() {
  const servicos = db.getServicos();
  const select = document.getElementById('service-select');
  
  if (select) {
    select.innerHTML = '<option value="">Escolha um serviço</option>';
    servicos.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.nome} - R$ ${s.preco.toFixed(2)}`;
      select.appendChild(opt);
    });
  }
}

function selectServiceForBooking(serviceId) {
  selectedService = serviceId;
  document.getElementById('service-select').value = serviceId;
}

// ====== GALERIA ======
function loadGallery() {
  const servicos = db.getServicos();
  const grid = document.getElementById('galleryGrid');
  
  if (!grid) return;
  
  grid.innerHTML = '';

  servicos.forEach(servico => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <img src="${servico.foto}" alt="${servico.nome}" />
      <div class="gallery-overlay">
        <p>${servico.nome}</p>
      </div>
    `;
    grid.appendChild(item);
  });
}

// ====== BARBEIROS ======
function loadBarbeiros() {
  const barbeiros = db.getBarbeiros();
  const select = document.getElementById('feedbackBarbeiro');
  
  if (select) {
    select.innerHTML = '<option value="">Escolha um barbeiro</option>';
    barbeiros.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.nome;
      select.appendChild(opt);
    });
  }
}

function loadBarbeiroCards() {
  const barbeiros = db.getBarbeiros();
  const container = document.getElementById('barbeiroCards');
  
  if (!container) return;
  
  container.innerHTML = '';

  barbeiros.forEach(b => {
    const card = document.createElement('div');
    card.className = 'barbeiro-card';
    card.onclick = () => selectBarbeiro(b.id);
    card.innerHTML = `
      <img src="${b.foto}" alt="${b.nome}">
      <div class="barbeiro-info">
        <p class="barbeiro-nome">${b.nome}</p>
        <small>${b.especialidades}</small>
      </div>
    `;
    container.appendChild(card);
  });
}

function selectBarbeiro(barbeiroId) {
  selectedBarbeiro = barbeiroId;
  
  // Marcar como selecionado
  document.querySelectorAll('.barbeiro-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');

  // Atualizar horários disponíveis
  loadTimeSlots(barbeiroId);
}

// ====== CALENDAR ======
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function renderCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;

  const calendarDays = document.getElementById('calendar-days');
  calendarDays.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    calendarDays.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayBtn = document.createElement('button');
    dayBtn.className = 'calendar-day';
    dayBtn.textContent = day;
    dayBtn.type = 'button';

    const dateObj = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateObj >= today) {
      dayBtn.onclick = () => selectDate(dayBtn, day);
    } else {
      dayBtn.disabled = true;
      dayBtn.style.opacity = '0.3';
    }

    calendarDays.appendChild(dayBtn);
  }
}

function prevMonth() {
  currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  if (currentMonth === 11) currentYear--;
  renderCalendar();
}

function nextMonth() {
  currentMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  if (currentMonth === 0) currentYear++;
  renderCalendar();
}

function selectDate(element, day) {
  document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
  selectedDate = new Date(currentYear, currentMonth, day);
}

// ====== TIME SLOTS ======
function loadTimeSlots(barbeiroId = null) {
  const container = document.getElementById('timesGrid');
  if (!container) return;

  container.innerHTML = '';
  const horarios = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

  horarios.forEach(hora => {
    const btn = document.createElement('button');
    btn.className = 'time-slot';
    btn.textContent = hora;
    btn.onclick = () => selectTime(btn, hora);
    container.appendChild(btn);
  });
}

function selectTime(element, hora) {
  document.querySelectorAll('.time-slot.active').forEach(slot => slot.classList.remove('active'));
  element.classList.add('active');
  selectedTime = hora;
}

// ====== AGENDAMENTO ======
function confirmBooking() {
  if (!currentUser) {
    alert('Por favor, faça login primeiro');
    navigateTo('login');
    return;
  }

  if (!selectedDate || !selectedTime || !selectedService || !selectedBarbeiro) {
    alert('Por favor, preencha todos os campos!');
    return;
  }

  const agendamento = db.createAgendamento({
    client_id: currentUser.id,
    barbeiro_id: selectedBarbeiro,
    servico_id: selectedService,
    data: selectedDate.toISOString().split('T')[0],
    hora: selectedTime
  });

  alert(`✅ Agendamento confirmado!\nData: ${selectedDate.toLocaleDateString('pt-BR')}\nHorário: ${selectedTime}`);
  selectedDate = null;
  selectedTime = null;
  selectedService = null;
  selectedBarbeiro = null;
}

// ====== FEEDBACKS ======
function loadFeedbacks() {
  const feedbacks = db.getFeedbacks();
  const grid = document.getElementById('feedbacksGrid');

  if (!grid) return;

  grid.innerHTML = '';

  if (feedbacks.length === 0) {
    grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Nenhum feedback ainda. Seja o primeiro!</p>';
    return;
  }

  feedbacks.forEach(fb => {
    const card = document.createElement('div');
    card.className = 'feedback-card';
    card.innerHTML = `
      <img src="${fb.barbeiro_foto}" alt="${fb.barbeiro_nome}" class="feedback-avatar">
      <div class="feedback-content">
        <p class="feedback-cliente"><strong>${fb.cliente_nome}</strong></p>
        <p class="feedback-barbeiro">→ ${fb.barbeiro_nome}</p>
        <div class="feedback-rating">
          ${'⭐'.repeat(fb.rating)}
        </div>
        <p class="feedback-comment">"${fb.comentario}"</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (!currentUser || selectedRating === 0) {
        alert('Por favor, selecione uma avaliação');
        return;
      }

      const feedback = db.createFeedback({
        cliente_id: currentUser.id,
        cliente_nome: currentUser.nome,
        barbeiro_id: parseInt(document.getElementById('feedbackBarbeiro').value),
        barbeiro_nome: db.getBarbeiro(parseInt(document.getElementById('feedbackBarbeiro').value)).nome,
        barbeiro_foto: db.getBarbeiro(parseInt(document.getElementById('feedbackBarbeiro').value)).foto,
        rating: selectedRating,
        comentario: document.getElementById('feedbackComentario').value
      });

      alert('✅ Feedback enviado com sucesso!');
      feedbackForm.reset();
      selectedRating = 0;
      loadFeedbacks();
    });
  }
});

function setRating(rating) {
  selectedRating = rating;
  const spans = document.querySelectorAll('.rating-input span');
  spans.forEach((span, i) => {
    if (i < rating) {
      span.style.color = 'var(--neon-pink)';
    } else {
      span.style.color = 'var(--text-secondary)';
    }
  });
  document.getElementById('feedbackRating').value = rating;
}

// ====== DASHBOARD CLIENT ======
function loadClientDashboard() {
  if (!currentUser) return;

  // Perfil
  const profileDiv = document.getElementById('clientProfile');
  if (profileDiv) {
    profileDiv.innerHTML = `
      <p><strong>Nome:</strong> ${currentUser.nome}</p>
      <p><strong>Email:</strong> ${currentUser.email}</p>
      <p><strong>CPF:</strong> ${currentUser.cpf}</p>
      <p><strong>WhatsApp:</strong> ${currentUser.whatsapp}</p>
    `;
  }

  // Agendamentos
  const agendamentos = db.getAgendamentos(currentUser.id);
  const agendDiv = document.getElementById('clientAgendamentos');
  
  if (agendDiv) {
    if (agendamentos.length === 0) {
      agendDiv.innerHTML = '<p>Você não tem agendamentos</p>';
    } else {
      agendDiv.innerHTML = agendamentos.map(a => {
        const servico = db.getServicoById(a.servico_id);
        const barbeiro = db.getBarbeiro(a.barbeiro_id);
        return `
          <div class="agendamento-item">
            <p><strong>Data:</strong> ${new Date(a.data).toLocaleDateString('pt-BR')}</p>
            <p><strong>Horário:</strong> ${a.hora}</p>
            <p><strong>Serviço:</strong> ${servico?.nome}</p>
            <p><strong>Barbeiro:</strong> ${barbeiro?.nome}</p>
            <p><strong>Status:</strong> ${a.status}</p>
          </div>
        `;
      }).join('');
    }
  }
}

function showEditProfile() {
  const nome = prompt('Novo nome:', currentUser.nome);
  if (nome) {
    db.updateUser(currentUser.id, { nome });
    currentUser.nome = nome;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loadClientDashboard();
    alert('✅ Perfil atualizado!');
  }
}

// ====== DASHBOARD ADMIN ======
function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).style.display = 'block';
  
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  if (tab === 'servicos') loadAdminServicos();
  else if (tab === 'categorias') loadAdminCategorias();
  else if (tab === 'barbeiros') loadAdminBarbeiros();
  else if (tab === 'agendamentos') loadAdminAgendamentos();
}

function loadAdminDashboard() {
  loadAdminServicos();
}

function loadAdminServicos() {
  const servicos = db.getServicos();
  const table = document.getElementById('servicosTable');

  if (!table) return;

  table.innerHTML = '<div class="admin-table-header"><span>Nome</span><span>Preço</span><span>Categoria</span><span>Ações</span></div>';

  servicos.forEach(s => {
    const cat = db.getCategorias().find(c => c.id === s.categoria_id);
    const row = document.createElement('div');
    row.className = 'admin-table-row';
    row.innerHTML = `
      <span>${s.nome}</span>
      <span>R$ ${s.preco}</span>
      <span>${cat?.nome}</span>
      <span>
        <button class="btn-small" onclick="editServico(${s.id})">Editar</button>
        <button class="btn-small btn-danger" onclick="deleteServico(${s.id})">Deletar</button>
      </span>
    `;
    table.appendChild(row);
  });
}

function loadAdminCategorias() {
  const categorias = db.getCategorias();
  const table = document.getElementById('categoriasTable');

  if (!table) return;

  table.innerHTML = '<div class="admin-table-header"><span>Nome</span><span>Descrição</span><span>Ações</span></div>';

  categorias.forEach(c => {
    const row = document.createElement('div');
    row.className = 'admin-table-row';
    row.innerHTML = `
      <span>${c.icone} ${c.nome}</span>
      <span>${c.descricao}</span>
      <span>
        <button class="btn-small" onclick="editCategoria(${c.id})">Editar</button>
        <button class="btn-small btn-danger" onclick="deleteCategoria(${c.id})">Deletar</button>
      </span>
    `;
    table.appendChild(row);
  });
}

function loadAdminBarbeiros() {
  const barbeiros = db.getBarbeiros();
  const table = document.getElementById('barbeirosTable');

  if (!table) return;

  table.innerHTML = '<div class="admin-table-header"><span>Nome</span><span>Especialidades</span><span>Experiência</span><span>Ações</span></div>';

  barbeiros.forEach(b => {
    const row = document.createElement('div');
    row.className = 'admin-table-row';
    row.innerHTML = `
      <span>${b.nome}</span>
      <span>${b.especialidades}</span>
      <span>${b.experiencia}</span>
      <span>
        <button class="btn-small" onclick="editBarbeiro(${b.id})">Editar</button>
      </span>
    `;
    table.appendChild(row);
  });
}

function loadAdminAgendamentos() {
  const agendamentos = db.getAgendamentos();
  const table = document.getElementById('agendamentosTable');

  if (!table) return;

  table.innerHTML = '<div class="admin-table-header"><span>Cliente</span><span>Barbeiro</span><span>Data</span><span>Horário</span><span>Status</span></div>';

  agendamentos.forEach(a => {
    const cliente = db.getUserById(a.client_id);
    const barbeiro = db.getBarbeiro(a.barbeiro_id);
    const row = document.createElement('div');
    row.className = 'admin-table-row';
    row.innerHTML = `
      <span>${cliente?.nome}</span>
      <span>${barbeiro?.nome}</span>
      <span>${new Date(a.data).toLocaleDateString('pt-BR')}</span>
      <span>${a.hora}</span>
      <span>${a.status}</span>
    `;
    table.appendChild(row);
  });
}

function showAddServico() {
  const nome = prompt('Nome do serviço:');
  if (!nome) return;
  const preco = parseFloat(prompt('Preço:'));
  if (!preco) return;
  const descricao = prompt('Descrição:');
  
  db.createServico({
    nome, preco, descricao,
    categoria_id: 1,
    foto: 'https://images.unsplash.com/photo-1599351431202-924373718620?auto=format&fit=crop&w=600&q=80'
  });
  
  alert('✅ Serviço criado!');
  loadAdminServicos();
  loadServices();
}

function editServico(id) {
  const servico = db.getServicoById(id);
  const nome = prompt('Novo nome:', servico.nome);
  if (nome) {
    db.updateServico(id, { nome });
    alert('✅ Serviço atualizado!');
    loadAdminServicos();
    loadServices();
  }
}

function deleteServico(id) {
  if (confirm('Tem certeza?')) {
    db.deleteServico(id);
    alert('✅ Serviço deletado!');
    loadAdminServicos();
    loadServices();
  }
}

function showAddCategoria() {
  const nome = prompt('Nome da categoria:');
  if (!nome) return;
  db.createCategoria({ nome, descricao: '', icone: '✂️' });
  alert('✅ Categoria criada!');
  loadAdminCategorias();
  loadCategorias();
}

function editCategoria(id) {
  const cat = db.getCategorias().find(c => c.id === id);
  const nome = prompt('Novo nome:', cat.nome);
  if (nome) {
    db.updateCategoria(id, { nome });
    alert('✅ Categoria atualizada!');
    loadAdminCategorias();
  }
}

function deleteCategoria(id) {
  if (confirm('Tem certeza?')) {
    db.deleteCategoria(id);
    alert('✅ Categoria deletada!');
    loadAdminCategorias();
  }
}

function showAddBarbeiro() {
  const nome = prompt('Nome do barbeiro:');
  if (!nome) return;
  const especialidades = prompt('Especialidades:');
  
  db.createBarbeiro({
    nome, especialidades,
    experiencia: '5 anos',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  });
  
  alert('✅ Barbeiro criado!');
  loadAdminBarbeiros();
  loadBarbeiros();
}

function editBarbeiro(id) {
  const barbeiro = db.getBarbeiro(id);
  const nome = prompt('Novo nome:', barbeiro.nome);
  if (nome) {
    db.updateBarbeiro(id, { nome });
    alert('✅ Barbeiro atualizado!');
    loadAdminBarbeiros();
  }
}
