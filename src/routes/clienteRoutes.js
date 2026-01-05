const express = require('express');
const router = express.Router();
const {
  criarCliente,
  listarClientes,
  buscarCliente,
  atualizarCliente,
  deletarCliente
} = require('../controllers/clienteController');

// @route   /clientes
router.route('/')
  .get(listarClientes)
  .post(criarCliente);

router.route('/:id')
  .get(buscarCliente)
  .put(atualizarCliente)
  .delete(deletarCliente);

module.exports = router;
