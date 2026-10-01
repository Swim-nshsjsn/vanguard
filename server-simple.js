const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Servir o arquivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor Vanguard rodando!' });
});

// Fallback para serve SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🎸 Servidor Vanguard Cabeleireiro rodando em http://localhost:${PORT}`);
  console.log(`\n✨ Demonstração de funcionalidades:`);
  console.log(`   - Login com: admin@vanguard.com / admin123`);
  console.log(`   - Ou crie uma nova conta`);
  console.log(`   - Todos os dados são salvos em LocalStorage\n`);
});
