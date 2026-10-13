import express from 'express';
import {
  listar,
  buscarPorId,
  criar,
  atualizar,
  atualizarParcial,
  remover,
} from '../controllers/atracoes.controller.js';

const router = express.Router();

router.get('/', listar);
router.get('/:id', buscarPorId);
router.post('/', criar);
router.put('/:id', atualizar);
router.patch('/:id', atualizarParcial);
router.delete('/:id', remover);

export default router;