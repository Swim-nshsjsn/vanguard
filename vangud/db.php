<?php
session_start();

$DATA_FILE = __DIR__ . '/data/app.json';

if (!is_dir(__DIR__ . '/data')) {
    mkdir(__DIR__ . '/data', 0777, true);
}

function ensureSeed(): void {
    global $DATA_FILE;

    if (!file_exists($DATA_FILE)) {
        $seed = [
            'usuarios' => [],
            'agendamentos' => [],
            'servicos' => [
                ['id' => 1, 'nome' => 'Corte', 'preco' => 60],
                ['id' => 2, 'nome' => 'Barba', 'preco' => 50],
                ['id' => 3, 'nome' => 'Combo', 'preco' => 100],
            ],
            'barbeiros' => [
                ['id' => 1, 'nome' => 'Rafael', 'especialidade' => 'Cortes modernos'],
                ['id' => 2, 'nome' => 'Mika', 'especialidade' => 'Barbas precisas'],
            ],
            'produtos' => [
                ['id' => 1, 'nome' => 'Pomada', 'preco' => 35],
                ['id' => 2, 'nome' => 'Shampoo', 'preco' => 45],
            ],
            'feedbacks' => [],
        ];
        file_put_contents($DATA_FILE, json_encode($seed, JSON_PRETTY_PRINT));
    }

    $data = loadData();
    if (!isset($data['usuarios'])) {
        $data['usuarios'] = [];
    }
    if (!isset($data['agendamentos'])) {
        $data['agendamentos'] = [];
    }
    if (!isset($data['servicos'])) {
        $data['servicos'] = [];
    }
    if (!isset($data['barbeiros'])) {
        $data['barbeiros'] = [];
    }
    if (!isset($data['produtos'])) {
        $data['produtos'] = [];
    }
    if (!isset($data['feedbacks'])) {
        $data['feedbacks'] = [];
    }

    $hasAdmin = false;
    foreach ($data['usuarios'] as $u) {
        if (!empty($u['admin'])) {
            $hasAdmin = true;
            break;
        }
    }

    if (!$hasAdmin) {
        $data['usuarios'][] = [
            'id' => 1,
            'nome' => 'Admin',
            'cpf' => '00000000000',
            'whatsapp' => 'admin',
            'senha' => 'admin123',
            'foto' => '',
            'admin' => true,
        ];
    }

    saveData($data);
}

function loadData(): array {
    global $DATA_FILE;
    $content = file_get_contents($DATA_FILE);
    return json_decode($content, true) ?: [];
}

function saveData(array $data): void {
    global $DATA_FILE;
    file_put_contents($DATA_FILE, json_encode($data, JSON_PRETTY_PRINT));
}

function currentUser(): ?array {
    return $_SESSION['user'] ?? null;
}

function requireLogin(string $redirect = 'login.php'): void {
    if (!currentUser()) {
        header('Location: ' . $redirect);
        exit;
    }
}

function requireAdmin(): void {
    $user = currentUser();
    if (!$user || empty($user['admin'])) {
        header('Location: login.php');
        exit;
    }
}

ensureSeed();
