<?php
include 'db.php';
requireAdmin();
$data = loadData();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao'])) {
    if ($_POST['acao'] === 'servico') {
        $id = (int) ($_POST['id'] ?? 0);
        $nome = trim($_POST['nome'] ?? '');
        $preco = (int) ($_POST['preco'] ?? 0);
        if ($id) {
            foreach ($data['servicos'] as &$s) {
                if ($s['id'] === $id) {
                    $s['nome'] = $nome;
                    $s['preco'] = $preco;
                    break;
                }
            }
        } else {
            $data['servicos'][] = ['id' => time(), 'nome' => $nome, 'preco' => $preco];
        }
        saveData($data);
    }

    if ($_POST['acao'] === 'barbeiro') {
        $id = (int) ($_POST['id'] ?? 0);
        $nome = trim($_POST['nome'] ?? '');
        $especialidade = trim($_POST['especialidade'] ?? '');
        if ($id) {
            foreach ($data['barbeiros'] as &$b) {
                if ($b['id'] === $id) {
                    $b['nome'] = $nome;
                    $b['especialidade'] = $especialidade;
                    break;
                }
            }
        } else {
            $data['barbeiros'][] = ['id' => time(), 'nome' => $nome, 'especialidade' => $especialidade];
        }
        saveData($data);
    }

    if ($_POST['acao'] === 'produto') {
        $id = (int) ($_POST['id'] ?? 0);
        $nome = trim($_POST['nome'] ?? '');
        $preco = (int) ($_POST['preco'] ?? 0);
        if ($id) {
            foreach ($data['produtos'] as &$p) {
                if ($p['id'] === $id) {
                    $p['nome'] = $nome;
                    $p['preco'] = $preco;
                    break;
                }
            }
        } else {
            $data['produtos'][] = ['id' => time(), 'nome' => $nome, 'preco' => $preco];
        }
        saveData($data);
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vanguard | Admin</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="index.php">VANGUARD</a>
        <div class="topbar-actions">
          <a class="btn btn-secondary" href="logout.php">Sair</a>
        </div>
      </header>

      <main class="dashboard-grid admin-grid">
        <section class="section-card">
          <div class="section-heading">
            <p class="eyebrow">Clientes</p>
            <h3>Todos os clientes</h3>
          </div>
          <div class="list">
            <?php foreach (array_filter($data['usuarios'], fn($u) => empty($u['admin'])) as $cliente): ?>
              <div class="card"><?= htmlspecialchars($cliente['nome']) ?> · <?= htmlspecialchars($cliente['whatsapp']) ?></div>
            <?php endforeach; ?>
          </div>
        </section>

        <section class="section-card">
          <div class="section-heading">
            <p class="eyebrow">Agenda</p>
            <h3>Agendamentos</h3>
          </div>
          <div class="list">
            <?php foreach ($data['agendamentos'] as $ag): ?>
              <div class="card"><?= htmlspecialchars($ag['data']) ?> <?= htmlspecialchars($ag['hora']) ?> · <?= htmlspecialchars($ag['cliente']) ?></div>
            <?php endforeach; ?>
          </div>
        </section>

        <section class="section-card">
          <div class="section-heading">
            <p class="eyebrow">Gerenciar</p>
            <h3>Serviços</h3>
          </div>
          <form method="post">
            <input type="hidden" name="acao" value="servico" />
            <input name="nome" placeholder="Nome do serviço" required />
            <input name="preco" type="number" min="0" placeholder="Preço" required />
            <button type="submit" class="btn btn-primary">Salvar serviço</button>
          </form>
          <div class="list">
            <?php foreach ($data['servicos'] as $servico): ?>
              <div class="card"><?= htmlspecialchars($servico['nome']) ?> · R$ <?= (int) $servico['preco'] ?></div>
            <?php endforeach; ?>
          </div>
        </section>

        <section class="section-card">
          <div class="section-heading">
            <p class="eyebrow">Gerenciar</p>
            <h3>Barbeiros</h3>
          </div>
          <form method="post">
            <input type="hidden" name="acao" value="barbeiro" />
            <input name="nome" placeholder="Nome do barbeiro" required />
            <input name="especialidade" placeholder="Especialidade" required />
            <button type="submit" class="btn btn-primary">Salvar barbeiro</button>
          </form>
          <div class="list">
            <?php foreach ($data['barbeiros'] as $barbeiro): ?>
              <div class="card"><?= htmlspecialchars($barbeiro['nome']) ?> · <?= htmlspecialchars($barbeiro['especialidade']) ?></div>
            <?php endforeach; ?>
          </div>
        </section>

        <section class="section-card">
          <div class="section-heading">
            <p class="eyebrow">Gerenciar</p>
            <h3>Produtos</h3>
          </div>
          <form method="post">
            <input type="hidden" name="acao" value="produto" />
            <input name="nome" placeholder="Nome do produto" required />
            <input name="preco" type="number" min="0" placeholder="Preço" required />
            <button type="submit" class="btn btn-primary">Salvar produto</button>
          </form>
          <div class="list">
            <?php foreach ($data['produtos'] as $produto): ?>
              <div class="card"><?= htmlspecialchars($produto['nome']) ?> · R$ <?= (int) $produto['preco'] ?></div>
            <?php endforeach; ?>
          </div>
        </section>

        <section class="section-card">
          <div class="section-heading">
            <p class="eyebrow">Avaliações</p>
            <h3>Feedbacks</h3>
          </div>
          <div class="list">
            <?php foreach ($data['feedbacks'] as $feedback): ?>
              <div class="card"><?= htmlspecialchars($feedback['cliente']) ?> · Nota <?= (int) ($feedback['notaNumero'] ?? 0) ?><br/><?= htmlspecialchars($feedback['comentario']) ?></div>
            <?php endforeach; ?>
          </div>
        </section>
      </main>
    </div>
  </body>
</html>
