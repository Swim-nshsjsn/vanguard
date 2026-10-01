document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("logado") || "null");

  if (!usuario) { window.location.href = "login.html"; return; }
  if (usuario.admin) { window.location.href = "admin.html"; return; }

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("logado");
    window.location.href = "index.html";
  });

  // Helper API
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
      try { return await (await fetch(`${SUPABASE_URL}/${table}?select=*`, { headers })).json(); }
      catch (e) { console.error(e); return []; }
    },
    post: async (table, data) => {
      const res = await fetch(`${SUPABASE_URL}/${table}`, {
        method: "POST", headers, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json())[0];
    },
    put: async (table, id, data) => {
      const res = await fetch(`${SUPABASE_URL}/${table}?id=eq.${id}`, {
        method: 'PATCH', headers, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json())[0];
    }
  };

  // Perfil
  const renderProfile = () => {
    const foto = usuario.foto || "https://via.placeholder.com/72";
    const el = (id) => document.getElementById(id);
    if (el("perfilNome")) el("perfilNome").textContent = usuario.nome;
    if (el("perfilInfo")) el("perfilInfo").textContent = "Cliente VIP";
    if (el("perfilCpf")) el("perfilCpf").textContent = usuario.cpf;
    if (el("perfilWhatsapp")) el("perfilWhatsapp").textContent = usuario.whatsapp;
    if (el("perfilFoto")) el("perfilFoto").src = foto;
    if (el("topbarFoto")) el("topbarFoto").src = foto;
    if (el("topbarNome")) el("topbarNome").textContent = usuario.nome;
  };

  // Helper: gera HTML de imagem enquadrada
  const imageCardHtml = (item) => {
    if (!item.foto) return "";
    const fitClass = item.imageFit === "contain" ? "service-image--full" : "service-image--crop";
    const zoom = (item.zoom || 100) / 100;
    const posX = item.posX || 0;
    const posY = item.posY || 0;
    return `<div class="image-crop-preview">
      <img class="service-image-blur" src="${item.foto}" alt="" />
      <img class="service-image ${fitClass}" src="${item.foto}" alt="${item.nome}"
           style="transform: translate(${posX}px,${posY}px) scale(${zoom});" />
    </div>`;
  };

  // Produtos
  const renderProdutos = async () => {
    const el = document.getElementById("produtosList");
    if (!el) return;
    const produtos = await api.get("produtos");
    if (!produtos.length) { el.innerHTML = "<p class='hint'>Nenhum produto disponível ainda.</p>"; return; }
    el.innerHTML = produtos.map((p, i) => `
      <article class="card product-card ${i % 2 === 0 ? "neon-border-cyan" : "neon-border-pink"}">
        ${imageCardHtml(p)}
        <h3>${p.nome}</h3>
        <div class="card-price">R$ ${p.preco}</div>
      </article>`).join("");
  };

  // Serviços (vitrine)
  const renderServicosVitrine = async () => {
    const el = document.getElementById("servicosVitrine");
    if (!el) return;
    const servicos = await api.get("servicos");
    if (!servicos.length) { el.innerHTML = "<p class='hint'>Nenhum serviço disponível ainda.</p>"; return; }
    el.innerHTML = servicos.map((s, i) => `
      <article class="card service-card ${i % 2 === 0 ? "neon-border-pink" : "neon-border-cyan"}">
        ${imageCardHtml(s)}
        <h3>${s.nome}</h3>
        <p>${s.duracao || ""}</p>
        <div class="card-price">R$ ${s.preco}</div>
        <a class="btn btn-neon-magenta" href="#agendamento">AGENDAR</a>
      </article>`).join("");
  };

  // Select de serviços (agendamento)
  const renderServices = async () => {
    const el = document.getElementById("servicoSelect");
    if (!el) return;
    const servicos = await api.get("servicos");
    el.innerHTML = "<option value=''>Selecione um servico</option>" +
      servicos.map(s => `<option value="${s.id}">${s.nome} — R$ ${s.preco}</option>`).join("");
  };

  // Select de barbeiros
  const renderBarbeiros = async () => {
    const sel = document.getElementById("barbeiroSelect");
    const fb  = document.getElementById("feedbackBarbeiro");
    if (!sel) return;
    const barbeiros = await api.get("barbeiros");
    const opts = "<option value=''>Selecione um barbeiro</option>" +
      barbeiros.map(b => `<option value="${b.id}">${b.nome} · ${b.especialidade}</option>`).join("");
    sel.innerHTML = opts;
    if (fb) fb.innerHTML = opts;
  };

  // Meus agendamentos
  const renderAgendamentos = async () => {
    const el = document.getElementById("agendamentosList");
    if (!el) return;
    const todos = await api.get("agendamentos");
    const meus = todos.filter(ag => ag.whatsapp === usuario.whatsapp);

    if (!meus.length) {
      el.innerHTML = `<p class="hint">Você ainda não tem agendamentos.</p>`;
      return;
    }

    const diasSemana = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
    const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
    const now = new Date();

    // Ordena do mais recente para o mais antigo
    meus.sort((a, b) => {
      const da = new Date(`${a.data}T${a.hora}`);
      const db = new Date(`${b.data}T${b.hora}`);
      return da - db;
    });

    el.innerHTML = meus.map(ag => {
      const dt = new Date(`${ag.data}T${ag.hora}`);
      const isPast = dt < now;
      const diaSemana = diasSemana[dt.getDay()];
      const diaNum = dt.getDate();
      const mes = meses[dt.getMonth()];
      const ano = dt.getFullYear();
      const hora = ag.hora;

      return `
        <div class="agendamento-card ${isPast ? 'agendamento--passado' : 'agendamento--futuro'}">
          <div class="agendamento-icon">${isPast ? '✅' : '📅'}</div>
          <div class="agendamento-info">
            <div class="agendamento-data">
              <span class="agendamento-dia-semana">${diaSemana}</span>,
              <span class="agendamento-data-completa">${diaNum} de ${mes} de ${ano}</span>
            </div>
            <div class="agendamento-hora">🕐 ${hora}</div>
            ${ag.cliente ? `<div class="agendamento-cliente">👤 ${ag.cliente}</div>` : ''}
          </div>
          <div class="agendamento-badge ${isPast ? 'badge--concluido' : 'badge--agendado'}">
            ${isPast ? 'Concluído' : 'Agendado'}
          </div>
        </div>
      `;
    }).join("");
  };

  // Slots de horario
  const renderSlots = async () => {
    const el = document.getElementById("slots");
    if (!el) return;
    const agendamentos = await api.get("agendamentos");
    const now = new Date();
    el.innerHTML = "";

    const diasSemana = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
    const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

    for (let i = 1; i <= 7; i++) {  // começa do DIA SEGUINTE (i=1), nunca hoje
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const diaSemana = diasSemana[date.getDay()];
      const diaFormatado = `${date.getDate()} de ${meses[date.getMonth()]}`;

      const card = document.createElement("div");
      card.className = "slot-day-card";
      card.innerHTML = `
        <div class="slot-day-header">
          <span class="slot-dia-semana">${diaSemana}</span>
          <span class="slot-data">${diaFormatado}</span>
        </div>
        <div class="slot-horarios"></div>
      `;

      const slotsContainer = card.querySelector(".slot-horarios");

      ["09:00","10:00","11:00","14:00","15:00","16:00","17:00","18:00"].forEach(hora => {
        const slotDateTime = new Date(`${dateStr}T${hora}:00`);
        const jaPassou = slotDateTime <= now;  // bloqueia horários no passado
        const ocupado = agendamentos.some(ag => ag.data === dateStr && ag.hora === hora);
        const bloqueado = jaPassou || ocupado;

        const btn = document.createElement("button");
        if (jaPassou) {
          btn.className = "slot slot--passado";
          btn.innerHTML = `<span class="slot-hora">${hora}</span><span class="slot-status">Expirado</span>`;
          btn.title = "Este horário já passou";
        } else if (ocupado) {
          btn.className = "slot slot--ocupado";
          btn.innerHTML = `<span class="slot-hora">${hora}</span><span class="slot-status">Ocupado</span>`;
          btn.title = "Horário já reservado";
        } else {
          btn.className = "slot slot--livre";
          btn.innerHTML = `<span class="slot-hora">${hora}</span><span class="slot-status">Livre</span>`;
          btn.title = `Agendar às ${hora}`;
        }
        btn.disabled = bloqueado;

        btn.addEventListener("click", async () => {
          // 1. Verifica se o horário já passou (tempo real)
          const agora = new Date();
          const slotAgora = new Date(`${dateStr}T${hora}:00`);
          if (slotAgora <= agora) {
            alert(`⚠️ Este horário (${diaFormatado} às ${hora}) já passou.\nEscolha um horário futuro.`);
            await renderSlots();
            return;
          }

          // 2. Verifica no banco se o horário ainda está livre (evita conflito em tempo real)
          const agendamentosAtuais = await api.get("agendamentos");
          const jaOcupado = agendamentosAtuais.some(ag => ag.data === dateStr && ag.hora === hora);
          if (jaOcupado) {
            alert("⚠️ Este horário acabou de ser reservado por outra pessoa.\nEscolha outro horário.");
            await renderSlots();
            return;
          }

          // 3. Verifica se o próprio cliente já agendou neste mesmo dia e hora
          const jaAgendouMesmoHorario = agendamentosAtuais.some(
            ag => ag.data === dateStr && ag.hora === hora && ag.whatsapp === usuario.whatsapp
          );
          if (jaAgendouMesmoHorario) {
            alert("⚠️ Você já tem um agendamento neste mesmo horário.");
            return;
          }

          // 4. Verifica seleções obrigatórias
          const servicoId = document.getElementById("servicoSelect")?.value || "";
          const barbeiroId = document.getElementById("barbeiroSelect")?.value || "";
          if (!servicoId) { alert("⚠️ Selecione um serviço antes de agendar."); return; }
          if (!barbeiroId) { alert("⚠️ Selecione um barbeiro antes de agendar."); return; }

          // 5. Salva o agendamento
          try {
            await api.post("agendamentos", {
              cliente: usuario.nome, whatsapp: usuario.whatsapp,
              data: dateStr, hora, servicoId, barbeiroId
            });
            await renderSlots();
            await renderAgendamentos();
            alert(`✅ Agendado com sucesso!\n📅 ${diaFormatado} (${diaSemana}) às ${hora}`);
          } catch (e) { alert("Erro ao agendar: " + e.message); }
        });

        slotsContainer.appendChild(btn);
      });

      el.appendChild(card);
    }
  };

  // Trocar foto
  document.getElementById("fotoInput")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      usuario.foto = reader.result;
      localStorage.setItem("logado", JSON.stringify(usuario));
      if (usuario.id) {
        await api.put('usuarios', usuario.id, { foto: usuario.foto }).catch(console.error);
      }
      renderProfile();
      alert("Foto atualizada com sucesso!");
    };
    reader.readAsDataURL(file);
  });

  // Feedback
  document.getElementById("formFeedback")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api.post("feedbacks", {
        cliente: usuario.nome,
        barbeiroId: document.getElementById("feedbackBarbeiro")?.value || "",
        comentario: document.getElementById("feedbackComentario").value,
        nota: Number(document.getElementById("feedbackNota").value),
        data: new Date().toLocaleDateString("pt-BR")
      });
      alert("Feedback enviado com sucesso!");
      e.target.reset();
    } catch (err) { alert("Erro ao enviar: " + err.message); }
  });

  // Scroll para agendamento
  if (window.location.hash === "#agendamento") {
    setTimeout(() => {
      document.getElementById("agendamento")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }

  // Inicializar tudo
  renderProfile();
  await Promise.all([
    renderProdutos(),
    renderServicosVitrine(),
    renderServices(),
    renderBarbeiros()
  ]);
  await renderSlots();
  await renderAgendamentos();
});
