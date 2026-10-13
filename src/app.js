import express from 'express';
import cors from 'cors';
import atracoesRoutes from './routes/atracoes.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';

const app = express();
const PORTA = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    nome: 'Balsas Experience API',
    versao: '1.0.0',
    descricao: 'API de experiências turísticas em Balsas-MA',
  });
});

// Endpoint de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rotas do sistema
app.use('/atracoes', atracoesRoutes);
app.use('/categorias', categoriasRoutes);

// Trata rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

// Middleware global de erros (4 parâmetros)
app.use((erro, req, res, next) => {
  console.error(erro);
  const status = erro.status ?? 500;
  const mensagem = status === 500 ? 'Erro interno no servidor' : 'Corpo da requisição inválido';
  res.status(status).json({ erro: mensagem });
});

app.listen(PORTA, '0.0.0.0', () => {
  console.log(`Servidor executando na porta ${PORTA}`);
});