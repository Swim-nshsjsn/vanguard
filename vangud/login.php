<?php include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = loadData();
    $whatsapp = trim($_POST['whatsapp'] ?? '');
    $senha = $_POST['senha'] ?? '';

    foreach ($data['usuarios'] as $usuario) {
        if ($usuario['whatsapp'] === $whatsapp && $usuario['senha'] === $senha) {
            $_SESSION['user'] = $usuario;
            if (!empty($usuario['admin'])) {
                header('Location: admin.php');
            } else {
                header('Location: cliente.php');
            }
            exit;
        }
    }

    $erro = 'WhatsApp ou senha inválidos.';
}
?>
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vanguard | Login</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <div class="auth-shell">
      <div class="auth-card">
        <h2>Entrar</h2>
        <p>Use seu WhatsApp e senha para acessar o painel do cliente.</p>
        <?php if (!empty($erro)): ?><p class="hint"><?= htmlspecialchars($erro) ?></p><?php endif; ?>
        <form method="post">
          <input type="text" name="whatsapp" placeholder="WhatsApp" required />
          <input type="password" name="senha" placeholder="Senha" required />
          <button type="submit" class="btn btn-primary">Entrar</button>
        </form>
        <p class="auth-link">Ainda não tem conta? <a href="cadastro.php">Cadastre-se</a></p>
        <p class="hint">Admin: WhatsApp <strong>admin</strong> · senha <strong>admin123</strong></p>
      </div>
    </div>
  </body>
</html>
