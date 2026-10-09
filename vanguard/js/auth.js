document.addEventListener('DOMContentLoaded', () => {
  const cadastroForm = document.getElementById('formCadastro');
  const loginForm = document.getElementById('formLogin');

  function normalizarWhats(w) {
    return (w || '').replace(/[\s\-().+]/g, '').replace(/^55/, '');
  }

  const SUPABASE_URL = 'https://pjwrkecbcddnqfajjgjr.supabase.co/rest/v1';
  const SUPABASE_KEY = 'sb_publishable_oyWF1sCKBgjqQMic7acIUg_HZnXAiSP';
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  // -- CADASTRO --
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const btnSubmit = cadastroForm.querySelector('button[type="submit"]');
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Salvando...';

      try {
        const nome     = document.getElementById('nome').value.trim();
        const cpf      = document.getElementById('cpf').value.trim();
        const whatsapp = document.getElementById('whatsapp').value.trim();
        const email    = document.getElementById('email')?.value?.trim() || '';
        const senha    = document.getElementById('cadSenha') ? document.getElementById('cadSenha').value : document.getElementById('senha').value;

        const resGet   = await fetch(`${SUPABASE_URL}/usuarios?select=whatsapp`, { headers });
        const usuarios = await resGet.json();
        if (usuarios.some((u) => u.whatsapp === whatsapp)) {
          alert('Esse WhatsApp já está cadastrado.');
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Cadastrar';
          return;
        }

        const payload = { nome, cpf, whatsapp, senha, foto: '', admin: false };

        const resPost = await fetch(`${SUPABASE_URL}/usuarios`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=representation' },
          body: JSON.stringify(payload)
        });

        if (!resPost.ok) {
          const errBody = await resPost.json();
          throw new Error(errBody.message || `Erro HTTP ${resPost.status}`);
        }

        // Salva os dados na memoria rapida para preencher o login automaticamente
        sessionStorage.setItem('prefillWhats', whatsapp);
        sessionStorage.setItem('prefillSenha', senha);

        // Vai para a tela de login
        window.location.href = 'login.html';

      } catch (e) {
        console.error('[auth.js] Erro ao cadastrar:', e);
        alert('Erro ao cadastrar: ' + e.message);
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Cadastrar';
      }
    });
  }

  // -- LOGIN --
  if (loginForm) {
    // Preenche automaticamente se o usuario acabou de se cadastrar
    const prefillWhats = sessionStorage.getItem('prefillWhats');
    const prefillSenha = sessionStorage.getItem('prefillSenha');
    
    if (prefillWhats && document.getElementById('loginWhats')) {
      document.getElementById('loginWhats').value = prefillWhats;
      sessionStorage.removeItem('prefillWhats');
    }
    if (prefillSenha && document.getElementById('loginSenha')) {
      document.getElementById('loginSenha').value = prefillSenha;
      sessionStorage.removeItem('prefillSenha');
    }

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
          alert('WhatsApp ou senha inválidos. Verifique os dados e tente novamente.');
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
