const express = require('express');
const router = express.Router();
const {
  criarProduto,
  listarProdutos,
  buscarProduto,
  atualizarProduto,
  deletarProduto
} = require('../controllers/produtoController');

// @route   /produtos
router.route('/')
  .get(listarProdutos)
  .post(criarProduto);

router.route('/:id')
  .get(buscarProduto)
  .put(atualizarProduto)
  .delete(deletarProduto);

module.exports = router;
