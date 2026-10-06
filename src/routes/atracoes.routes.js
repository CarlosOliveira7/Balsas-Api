import express from 'express';
import {
listar,
buscarPorId,
criar,
atualizar,
remover,
} from '../controllers/atracoes.controller.js';
const router = express.Router();
router.get('/', listar);
router.get('/:id', buscarPorId);
router.post('/', criar);
router.put('/:id', atualizar);
router.delete('/:id', remover);
export default router;