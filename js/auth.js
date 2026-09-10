document.addEventListener('DOMContentLoaded', () => {
  const cadastroForm = document.getElementById('formCadastro');
  const loginForm = document.getElementById('formLogin');

  const SUPABASE_URL = 'https://pjwrkecbcddnqfajjgjr.supabase.co/rest/v1';
  const SUPABASE_KEY = 'sb_publishable_oyWF1sCKBgjqQMic7acIUg_HZnXAiSP';
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  if (cadastroForm) {
    cadastroForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const resGet = await fetch(`${SUPABASE_URL}/usuarios?select=*`, { headers });
        const usuarios = await resGet.json();

        const novoUsuario = {
          nome: document.getElementById('nome').value.trim(),
          cpf: document.getElementById('cpf').value.trim(),
          whatsapp: document.getElementById('whatsapp').value.trim(),
          senha: document.getElementById('senha').value,
          foto: '',
          admin: false
        };

        if (usuarios.some((u) => u.whatsapp === novoUsuario.whatsapp)) {
          alert('Esse WhatsApp já está cadastrado.');
          return;
        }

        const resPost = await fetch(`${SUPABASE_URL}/usuarios`, {
          method: 'POST',
          headers,
          body: JSON.stringify(novoUsuario)
        });
        const usuarioCriado = (await resPost.json())[0];

        localStorage.setItem('logado', JSON.stringify(usuarioCriado));
        alert('Cadastro realizado com sucesso!');
        window.location.href = 'cliente.html';
      } catch (e) {
        console.error(e);
        alert('Erro ao cadastrar.');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const resGet = await fetch(`${SUPABASE_URL}/usuarios?select=*`, { headers });
        const usuarios = await resGet.json();

        const whats = document.getElementById('loginWhats').value.trim();
        const senha = document.getElementById('loginSenha').value;

        const usuario = usuarios.find(
          (u) => u.whatsapp === whats && u.senha === senha
        );

        if (!usuario) {
          alert('WhatsApp ou senha inválidos.');
          return;
        }

        localStorage.setItem('logado', JSON.stringify(usuario));
        if (usuario.admin) {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'cliente.html';
        }
      } catch (e) {
        console.error(e);
        alert('Erro ao fazer login.');
      }
    });
  }
});
