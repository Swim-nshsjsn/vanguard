<?php include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = loadData();
    $nome = trim($_POST['nome'] ?? '');
    $cpf = trim($_POST['cpf'] ?? '');
    $whatsapp = trim($_POST['whatsapp'] ?? '');
    $senha = $_POST['senha'] ?? '';

    if ($nome && $cpf && $whatsapp && $senha) {
        $exists = array_filter($data['usuarios'], fn($u) => $u['whatsapp'] === $whatsapp);
        if (!empty($exists)) {
            $erro = 'Esse WhatsApp já está cadastrado.';
        } else {
            $data['usuarios'][] = [
                'id' => time(),
                'nome' => $nome,
                'cpf' => $cpf,
                'whatsapp' => $whatsapp,
                'senha' => $senha,
                'foto' => '',
                'admin' => false,
            ];
            saveData($data);
            $_SESSION['user'] = end($data['usuarios']);
            header('Location: cliente.php');
            exit;
        }
    } else {
        $erro = 'Preencha todos os campos obrigatórios.';
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vanguard | Cadastro</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <div class="auth-shell">
      <div class="auth-card">
        <h2>Cadastro</h2>
        <p>Crie sua conta e comece a agendar no seu estilo.</p>
        <?php if (!empty($erro)): ?><p class="hint"><?= htmlspecialchars($erro) ?></p><?php endif; ?>
        <form method="post">
          <input type="text" name="nome" placeholder="Nome completo" required />
          <input type="text" name="cpf" placeholder="CPF" required />
          <input type="text" name="whatsapp" placeholder="WhatsApp" required />
          <input type="password" name="senha" placeholder="Senha" required />
          <button type="submit" class="btn btn-primary">Cadastrar</button>
        </form>
        <p class="auth-link">Já tem conta? <a href="login.php">Entrar</a></p>
      </div>
    </div>
  </body>
</html>
