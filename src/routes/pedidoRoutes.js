const express = require('express');
const router = express.Router();
const {
  criarPedido,
  listarPedidos,
  buscarPedido,
  atualizarStatusPedido,
  deletarPedido
} = require('../controllers/pedidoController');

// @route   /pedidos
router.route('/')
  .get(listarPedidos)
  .post(criarPedido);

router.route('/:id')
  .get(buscarPedido)
  .delete(deletarPedido);

router.put('/:id/status', atualizarStatusPedido);

module.exports = router;
