document.addEventListener('DOMContentLoaded', () => {
  const cadastroForm = document.getElementById('formCadastro');
  const loginForm = document.getElementById('formLogin');

  // Remove espaços, traços, parênteses para comparar WhatsApp sem diferença de formato
  function normalizarWhats(w) {
    return (w || '').replace(/[\s\-().+]/g, '').replace(/^55/, '');
  }

  const SUPABASE_URL = 'https://pjwrkecbcddnqfajjgjr.supabase.co/rest/v1';
  const SUPABASE_KEY = 'sb_publishable_oyWF1sCKBgjqQMic7acIUg_HZnXAiSP';
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  // ── CADASTRO ─────────────────────────────────────────
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const btnSubmit = cadastroForm.querySelector('button[type="submit"]');
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Salvando...';

      try {
        // Coleta os dados do formulário
        const nome     = document.getElementById('nome').value.trim();
        const cpf      = document.getElementById('cpf').value.trim();
        const whatsapp = document.getElementById('whatsapp').value.trim();
        const email    = document.getElementById('email')?.value?.trim() || '';
        const senha    = document.getElementById('senha').value;

        // Verifica se WhatsApp já existe
        const resGet   = await fetch(`${SUPABASE_URL}/usuarios?select=whatsapp`, { headers });
        const usuarios = await resGet.json();
        if (usuarios.some((u) => u.whatsapp === whatsapp)) {
          alert('Esse WhatsApp já está cadastrado.');
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Cadastrar';
          return;
        }

        // Payload para o banco (sem email pois a coluna ainda não existe)
        const payload = { nome, cpf, whatsapp, senha, foto: '', admin: false };

        const resPost = await fetch(`${SUPABASE_URL}/usuarios`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        // Verifica se o cadastro realmente funcionou
        if (!resPost.ok) {
          const errBody = await resPost.json();
          throw new Error(errBody.message || `Erro HTTP ${resPost.status}`);
        }

        const usuarioCriado = (await resPost.json())[0];
        localStorage.setItem('logado', JSON.stringify(usuarioCriado));

        // Mostra tela de sucesso com todos os dados preenchidos
        const formContainer = document.querySelector('.auth-card');
        formContainer.innerHTML = `
          <p class="eyebrow" style="color: #00ffff;">Sucesso!</p>
          <h2>Cadastro Realizado</h2>
          <p style="margin-bottom: 24px;">Sua conta foi criada! Anote seus dados de acesso:</p>
          <div style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: left; font-size: 0.95rem; line-height: 2;">
            <p>&#128100; <strong>Nome:</strong> ${nome}</p>
            <p>&#128231; <strong>E-mail:</strong> ${email || '&mdash;'}</p>
            <p>&#128241; <strong>WhatsApp:</strong> ${whatsapp}</p>
            <p>&#128219; <strong>CPF:</strong> ${cpf}</p>
            <p>&#128273; <strong>Senha:</strong> ${senha}</p>
          </div>
          <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 20px;">
            Guarde esses dados! Voce vai precisar do <strong>WhatsApp</strong> e da <strong>senha</strong> para entrar.
          </p>
          <a href="login.html" class="btn btn-neon-magenta" style="width: 100%; display: block; text-align: center;">
            IR PARA O LOGIN
          </a>
        `;

      } catch (e) {
        console.error('[auth.js] Erro ao cadastrar:', e);
        alert('Erro ao cadastrar: ' + e.message);
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Cadastrar';
      }
    });
  }

  // ── LOGIN ─────────────────────────────────────────────
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const btnSubmit = loginForm.querySelector('button[type="submit"]');
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Entrando...';

      try {
        const whats = document.getElementById('loginWhats').value.trim();
        const senha = document.getElementById('loginSenha').value;

        const resGet   = await fetch(`${SUPABASE_URL}/usuarios?select=*`, { headers });
        const usuarios = await resGet.json();

        const usuario = usuarios.find(
          (u) => normalizarWhats(u.whatsapp) === normalizarWhats(whats) && u.senha === senha
        );

        if (!usuario) {
          alert('WhatsApp ou senha invalidos. Verifique os dados e tente novamente.');
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Entrar';
          return;
        }

        localStorage.setItem('logado', JSON.stringify(usuario));

        if (usuario.admin) {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'cliente.html';
        }

      } catch (e) {
        console.error('[auth.js] Erro ao fazer login:', e);
        alert('Erro ao fazer login: ' + e.message);
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Entrar';
      }
    });
  }
});
