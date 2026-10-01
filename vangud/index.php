<?php include 'db.php'; ?>
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vanguard | Barbearia Neon</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="index.php">VANGUARD</a>
        <nav class="nav-links">
          <a href="#servicos">Serviços</a>
          <a href="#feedbacks">Feedbacks</a>
          <a href="#galeria">Galeria</a>
        </nav>
        <div class="topbar-actions">
          <a class="btn btn-secondary" href="login.php">Login</a>
          <a class="btn btn-primary" href="cadastro.php">Cadastro</a>
        </div>
      </header>

      <main>
        <section class="hero">
          <div>
            <p class="eyebrow">Barbearia premium · cyberpunk</p>
            <h1>Cortes modernos com energia de neon.</h1>
            <p>Experiência exclusiva para quem quer estilo, precisão e presença.</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="cadastro.php">Criar conta</a>
              <a class="btn btn-secondary" href="#servicos">Ver serviços</a>
            </div>
          </div>
          <div class="hero-card">
            <h3>Mais de 500 clientes</h3>
            <p>Agendamento rápido, barbearia acolhedora e visual impecável.</p>
          </div>
        </section>

        <section id="servicos" class="section-card">
          <div class="section-heading">
            <p class="eyebrow">Cortes e serviços</p>
            <h2>O que oferecemos</h2>
          </div>
          <div class="grid">
            <?php $data = loadData(); foreach ($data['servicos'] as $servico): ?>
              <article class="card">
                <h3><?= htmlspecialchars($servico['nome']) ?></h3>
                <p>Preço a partir de R$ <?= (int) $servico['preco'] ?></p>
              </article>
            <?php endforeach; ?>
          </div>
        </section>

        <section id="feedbacks" class="section-card">
          <div class="section-heading">
            <p class="eyebrow">Avaliações</p>
            <h2>Feedbacks de clientes</h2>
          </div>
          <div class="grid feedback-grid">
            <?php foreach ($data['feedbacks'] as $feedback): ?>
              <article class="card">
                <h3><?= htmlspecialchars($feedback['cliente']) ?></h3>
                <p><?= htmlspecialchars($feedback['comentario']) ?></p>
                <strong>Nota: <?= (int) ($feedback['notaNumero'] ?? $feedback['nota'] ?? 0) ?>/5</strong>
              </article>
            <?php endforeach; ?>
          </div>
        </section>
      </main>
    </div>
  </body>
</html>
