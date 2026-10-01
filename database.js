// ====== SIMULAÇÃO DE BANCO DE DADOS COM LOCALSTORAGE ======

class VanguardDB {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    // Dados iniciais
    const defaultData = {
      users: [
        {
          id: 1,
          nome: 'Admin Vanguard',
          email: 'admin@vanguard.com',
          cpf: '123.456.789-00',
          whatsapp: '(11) 99999-0001',
          senha: 'admin123',
          role: 'admin',
          foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
        }
      ],
      categorias: [
        { id: 1, nome: 'Cortes', descricao: 'Cortes e fades modernos', icone: '✂️' },
        { id: 2, nome: 'Barba', descricao: 'Desenho e tratamento de barba', icone: '🧔' },
        { id: 3, nome: 'Coloração', descricao: 'Tingimento e coloração', icone: '🎨' },
        { id: 4, nome: 'Tratamentos', descricao: 'Hidratação e tratamentos premium', icone: '💎' }
      ],
      servicos: [
        {
          id: 1,
          nome: 'Corte Clássico',
          descricao: 'Corte tradicional com acabamento impecável',
          preco: 65,
          categoria_id: 1,
          foto: 'https://images.unsplash.com/photo-1599351431202-924373718620?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 2,
          nome: 'Corte Neon',
          descricao: 'Design moderno com fade e detalhes precisos',
          preco: 85,
          categoria_id: 1,
          foto: 'https://images.unsplash.com/photo-1585983922453-46070487dcc1?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 3,
          nome: 'Barba Design',
          descricao: 'Desenho de barba personalizado',
          preco: 45,
          categoria_id: 2,
          foto: 'https://images.unsplash.com/photo-1622286346206-7c68fba5b587?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 4,
          nome: 'Combo Completo',
          descricao: 'Corte + Barba + Limpeza facial',
          preco: 130,
          categoria_id: 1,
          foto: 'https://images.unsplash.com/photo-1589812433381-c3227a5f4302?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 5,
          nome: 'Coloração Premium',
          descricao: 'Tingimento profissional com produtos premium',
          preco: 150,
          categoria_id: 3,
          foto: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 6,
          nome: 'VIP Premium',
          descricao: 'Experiência completa com tratamentos premium',
          preco: 180,
          categoria_id: 4,
          foto: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'
        }
      ],
      barbeiros: [
        {
          id: 1,
          nome: 'Carlos (Expert)',
          foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          especialidades: 'Cortes, Fades, Desenhos',
          experiencia: '15 anos',
          horarios: [
            { dia_semana: 1, hora_inicio: '09:00', hora_fim: '17:00' },
            { dia_semana: 2, hora_inicio: '09:00', hora_fim: '17:00' },
            { dia_semana: 3, hora_inicio: '09:00', hora_fim: '17:00' }
          ]
        },
        {
          id: 2,
          nome: 'Rafael (Neon Specialist)',
          foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          especialidades: 'Design Moderno, Neon Style',
          experiencia: '10 anos',
          horarios: [
            { dia_semana: 2, hora_inicio: '10:00', hora_fim: '18:00' },
            { dia_semana: 3, hora_inicio: '10:00', hora_fim: '18:00' },
            { dia_semana: 4, hora_inicio: '10:00', hora_fim: '18:00' }
          ]
        },
        {
          id: 3,
          nome: 'Diego (Classic)',
          foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
          especialidades: 'Clássicos, Barbas',
          experiencia: '12 anos',
          horarios: [
            { dia_semana: 1, hora_inicio: '09:00', hora_fim: '17:00' },
            { dia_semana: 4, hora_inicio: '09:00', hora_fim: '17:00' },
            { dia_semana: 5, hora_inicio: '09:00', hora_fim: '17:00' }
          ]
        }
      ],
      agendamentos: [],
      feedbacks: [
        {
          id: 1,
          cliente_nome: 'João Silva',
          barbeiro_nome: 'Carlos (Expert)',
          barbeiro_foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          rating: 5,
          comentario: 'Excelente atendimento! Corte perfeito!',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          cliente_nome: 'Maria Santos',
          barbeiro_nome: 'Rafael (Neon Specialist)',
          barbeiro_foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          rating: 5,
          comentario: 'Adorei! Ficou exatamente como queria!',
          created_at: new Date().toISOString()
        }
      ]
    };

    // Carregar dados ou usar padrão
    if (!localStorage.getItem('vanguardDB')) {
      localStorage.setItem('vanguardDB', JSON.stringify(defaultData));
    }
  }

  getData() {
    return JSON.parse(localStorage.getItem('vanguardDB')) || {};
  }

  saveData(data) {
    localStorage.setItem('vanguardDB', JSON.stringify(data));
  }

  // ====== USUÁRIOS ======
  getUsers() {
    return this.getData().users || [];
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === parseInt(id));
  }

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email === email);
  }

  createUser(userData) {
    const data = this.getData();
    const newUser = {
      id: Math.max(...data.users.map(u => u.id), 0) + 1,
      ...userData
    };
    data.users.push(newUser);
    this.saveData(data);
    return newUser;
  }

  updateUser(id, userData) {
    const data = this.getData();
    const user = data.users.find(u => u.id === parseInt(id));
    if (user) {
      Object.assign(user, userData);
      this.saveData(data);
    }
    return user;
  }

  // ====== CATEGORIAS ======
  getCategorias() {
    return this.getData().categorias || [];
  }

  createCategoria(categoria) {
    const data = this.getData();
    const newCat = {
      id: Math.max(...data.categorias.map(c => c.id), 0) + 1,
      ...categoria
    };
    data.categorias.push(newCat);
    this.saveData(data);
    return newCat;
  }

  updateCategoria(id, categoria) {
    const data = this.getData();
    const cat = data.categorias.find(c => c.id === parseInt(id));
    if (cat) {
      Object.assign(cat, categoria);
      this.saveData(data);
    }
    return cat;
  }

  deleteCategoria(id) {
    const data = this.getData();
    data.categorias = data.categorias.filter(c => c.id !== parseInt(id));
    this.saveData(data);
  }

  // ====== SERVIÇOS ======
  getServicos(categoriaId = null) {
    let servicos = this.getData().servicos || [];
    if (categoriaId) {
      servicos = servicos.filter(s => s.categoria_id === parseInt(categoriaId));
    }
    return servicos;
  }

  getServicoById(id) {
    return this.getServicos().find(s => s.id === parseInt(id));
  }

  createServico(servico) {
    const data = this.getData();
    const newServico = {
      id: Math.max(...data.servicos.map(s => s.id), 0) + 1,
      ...servico
    };
    data.servicos.push(newServico);
    this.saveData(data);
    return newServico;
  }

  updateServico(id, servico) {
    const data = this.getData();
    const srv = data.servicos.find(s => s.id === parseInt(id));
    if (srv) {
      Object.assign(srv, servico);
      this.saveData(data);
    }
    return srv;
  }

  deleteServico(id) {
    const data = this.getData();
    data.servicos = data.servicos.filter(s => s.id !== parseInt(id));
    this.saveData(data);
  }

  // ====== BARBEIROS ======
  getBarbeiros() {
    return this.getData().barbeiros || [];
  }

  getBarbeiro(id) {
    return this.getBarbeiros().find(b => b.id === parseInt(id));
  }

  createBarbeiro(barbeiro) {
    const data = this.getData();
    const newBarbeiro = {
      id: Math.max(...data.barbeiros.map(b => b.id), 0) + 1,
      ...barbeiro,
      horarios: barbeiro.horarios || []
    };
    data.barbeiros.push(newBarbeiro);
    this.saveData(data);
    return newBarbeiro;
  }

  updateBarbeiro(id, barbeiro) {
    const data = this.getData();
    const barb = data.barbeiros.find(b => b.id === parseInt(id));
    if (barb) {
      Object.assign(barb, barbeiro);
      this.saveData(data);
    }
    return barb;
  }

  // ====== AGENDAMENTOS ======
  getAgendamentos(clientId = null) {
    let agendamentos = this.getData().agendamentos || [];
    if (clientId) {
      agendamentos = agendamentos.filter(a => a.client_id === parseInt(clientId));
    }
    return agendamentos;
  }

  createAgendamento(agendamento) {
    const data = this.getData();
    const newAgendamento = {
      id: Math.max(...(data.agendamentos || []).map(a => a.id), 0) + 1,
      ...agendamento,
      status: 'confirmado',
      created_at: new Date().toISOString()
    };
    if (!data.agendamentos) data.agendamentos = [];
    data.agendamentos.push(newAgendamento);
    this.saveData(data);
    return newAgendamento;
  }

  // ====== FEEDBACKS ======
  getFeedbacks() {
    return this.getData().feedbacks || [];
  }

  getFeedbacksByBarbeiro(barbeiroId) {
    return this.getFeedbacks().filter(f => f.barbeiro_id === parseInt(barbeiroId));
  }

  createFeedback(feedback) {
    const data = this.getData();
    const newFeedback = {
      id: Math.max(...data.feedbacks.map(f => f.id), 0) + 1,
      ...feedback,
      created_at: new Date().toISOString()
    };
    data.feedbacks.push(newFeedback);
    this.saveData(data);
    return newFeedback;
  }
}

// Instância global do banco de dados
const db = new VanguardDB();
