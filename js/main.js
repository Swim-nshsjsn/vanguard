document.addEventListener('DOMContentLoaded', () => {
  const servicosList = document.getElementById('servicosList');
  const feedbacksList = document.getElementById('feedbacksList');

  const SUPABASE_URL = 'https://pjwrkecbcddnqfajjgjr.supabase.co/rest/v1';
  const SUPABASE_KEY = 'sb_publishable_oyWF1sCKBgjqQMic7acIUg_HZnXAiSP';
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  const renderServicos = async () => {
    if (!servicosList) return;
    try {
      const res = await fetch(`${SUPABASE_URL}/servicos?select=*`, { headers });
      const servicos = await res.json();
      servicosList.innerHTML = servicos.map((servico) => `
        <article class="card">
          <h3>${servico.nome}</h3>
          <p>Preço a partir de R$ ${servico.preco}</p>
        </article>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  };

  const renderFeedbacks = async () => {
    if (!feedbacksList) return;
    try {
      const res = await fetch(`${SUPABASE_URL}/feedbacks?select=*`, { headers });
      const feedbacks = await res.json();
      feedbacksList.innerHTML = feedbacks.length
        ? feedbacks.map((feedback) => `
          <article class="card">
            <h3>${feedback.cliente}</h3>
            <p>${feedback.comentario}</p>
            <strong>Nota: ${feedback.nota || '—'}/5</strong>
          </article>
        `).join('')
        : '<p class="hint">Ainda não há feedbacks cadastrados.</p>';
    } catch (e) {
      console.error(e);
    }
  };

  renderServicos();
  renderFeedbacks();
});
