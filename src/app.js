import express from 'express';
import atracoesRoutes from './routes/atracoes.routes.js';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('eu quero ser um programador de sucesso');
});

app.use('/atracoes', atracoesRoutes);

app.listen(port,"0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});