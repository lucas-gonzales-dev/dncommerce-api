const express = require('express');
const router = express.Router();
const {
  listarEstoque,
  buscarEstoqueProduto,
  atualizarEstoque,
  adicionarEstoque,
  listarEstoqueBaixo
} = require('../controllers/estoqueController');

// @route   /estoque
router.get('/', listarEstoque);
router.get('/alertas/baixo', listarEstoqueBaixo);

router.route('/:produtoId')
  .get(buscarEstoqueProduto)
  .put(atualizarEstoque);

router.post('/:produtoId/adicionar', adicionarEstoque);

module.exports = router;
