<?php
include 'db.php';
requireLogin();
$user = currentUser();
if (!empty($user['admin'])) {
    header('Location: admin.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao']) && $_POST['acao'] === 'agendar') {
    $data = loadData();
    $dataAgendamento = $_POST['data'] ?? '';
    $hora = $_POST['hora'] ?? '';
    $servicoId = $_POST['servico_id'] ?? '';
    $barbeiroId = $_POST['barbeiro_id'] ?? '';

    $existe = array_filter($data['agendamentos'], fn($a) => $a['data'] === $dataAgendamento && $a['hora'] === $hora);
    if (!empty($existe)) {
        $erro = 'Horário indisponível.';
    } else {
        $data['agendamentos'][] = [
            'id' => time(),
            'cliente' => $user['nome'],
            'clienteId' => $user['whatsapp'],
            'data' => $dataAgendamento,
            'hora' => $hora,
            'servicoId' => $servicoId,
            'barbeiroId' => $barbeiroId,
        ];
        saveData($data);
        $sucesso = 'Agendamento realizado com sucesso.';
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao']) && $_POST['acao'] === 'upload_foto') {
    $file = $_FILES['foto'] ?? null;
    if ($file && $file['tmp_name']) {
        $folder = __DIR__ . '/uploads';
        if (!is_dir($folder)) mkdir($folder, 0777, true);
        $name = time() . '_' . basename($file['name']);
        move_uploaded_file($file['tmp_name'], $folder . '/' . $name);
        $data = loadData();
        foreach ($data['usuarios'] as &$u) {
            if ($u['whatsapp'] === $user['whatsapp']) {
                $u['foto'] = 'uploads/' . $name;
                break;
            }
        }
        saveData($data);
        $_SESSION['user']['foto'] = 'uploads/' . $name;
        $sucesso = 'Foto atualizada com sucesso.';
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao']) && $_POST['acao'] === 'feedback') {
    $data = loadData();
    $data['feedbacks'][] = [
        'cliente' => $user['nome'],
        'barbeiroId' => $_POST['barbeiro_id'] ?? '',
        'comentario' => trim($_POST['comentario'] ?? ''),
        'notaNumero' => (int) ($_POST['nota'] ?? 0),
    ];
    saveData($data);
    $sucesso = 'Feedback enviado com sucesso.';
}

$data = loadData();
$meusAgendamentos = array_values(array_filter($data['agendamentos'], fn($a) => $a['clienteId'] === $user['whatsapp']));
?>
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vanguard | Cliente</title>
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

      <main class="dashboard-grid">
        <section class="section-card profile-card">
          <div class="profile-head">
            <img class="avatar" src="<?= htmlspecialchars($user['foto'] ?: 'https://i.pravatar.cc/120?img=12') ?>" alt="Foto" />
            <div>
              <h2><?= htmlspecialchars($user['nome']) ?></h2>
              <p>Cliente Vanguard</p>
            </div>
          </div>
          <form method="post" enctype="multipart/form-data">
            <input type="hidden" name="acao" value="upload_foto" />
            <label class="upload-label" for="foto">Trocar foto</label>
            <input type="file" id="foto" name="foto" accept="image/*" />
            <button type="submit" class="btn btn-primary">Salvar foto</button>
          </form>
          <div class="profile-meta">
            <p><strong>CPF:</strong> <?= htmlspecialchars($user['cpf']) ?></p>
            <p><strong>WhatsApp:</strong> <?= htmlspecialchars($user['whatsapp']) ?></p>
          </div>
        </section>

        <section class="section-card">
          <div class="section-heading">
            <p class="eyebrow">Agendamento</p>
            <h3>Horários disponíveis</h3>
          </div>
          <?php if (!empty($erro)): ?><p class="hint"><?= htmlspecialchars($erro) ?></p><?php endif; ?>
          <?php if (!empty($sucesso)): ?><p class="hint"><?= htmlspecialchars($sucesso) ?></p><?php endif; ?>
          <form method="post">
            <input type="hidden" name="acao" value="agendar" />
            <input type="date" name="data" required />
            <input type="time" name="hora" required />
            <select name="servico_id" required>
              <?php foreach ($data['servicos'] as $servico): ?>
                <option value="<?= (int) $servico['id'] ?>"><?= htmlspecialchars($servico['nome']) ?> - R$ <?= (int) $servico['preco'] ?></option>
              <?php endforeach; ?>
            </select>
            <select name="barbeiro_id" required>
              <?php foreach ($data['barbeiros'] as $barbeiro): ?>
                <option value="<?= (int) $barbeiro['id'] ?>"><?= htmlspecialchars($barbeiro['nome']) ?> · <?= htmlspecialchars($barbeiro['especialidade']) ?></option>
              <?php endforeach; ?>
            </select>
            <button type="submit" class="btn btn-primary">Agendar</button>
          </form>
        </section>

        <section class="section-card">
          <div class="section-heading">
            <p class="eyebrow">Seus compromissos</p>
            <h3>Agendamentos feitos</h3>
          </div>
          <div class="list">
            <?php if (empty($meusAgendamentos)): ?>
              <p class="hint">Nenhum agendamento ainda.</p>
            <?php else: ?>
              <?php foreach ($meusAgendamentos as $ag): ?>
                <div class="card"><strong><?= htmlspecialchars($ag['data']) ?></strong> às <?= htmlspecialchars($ag['hora']) ?></div>
              <?php endforeach; ?>
            <?php endif; ?>
          </div>
        </section>

        <section class="section-card">
          <div class="section-heading">
            <p class="eyebrow">Feedback</p>
            <h3>Deixe sua avaliação</h3>
          </div>
          <form method="post">
            <input type="hidden" name="acao" value="feedback" />
            <select name="barbeiro_id" required>
              <?php foreach ($data['barbeiros'] as $barbeiro): ?>
                <option value="<?= (int) $barbeiro['id'] ?>"><?= htmlspecialchars($barbeiro['nome']) ?></option>
              <?php endforeach; ?>
            </select>
            <select name="nota" required>
              <option value="5">5 - Excelente</option>
              <option value="4">4 - Muito bom</option>
              <option value="3">3 - Bom</option>
              <option value="2">2 - Regular</option>
              <option value="1">1 - Ruim</option>
            </select>
            <textarea name="comentario" rows="4" placeholder="Conte como foi sua experiência" required></textarea>
            <button type="submit" class="btn btn-primary">Enviar feedback</button>
          </form>
        </section>
      </main>
    </div>
  </body>
</html>
