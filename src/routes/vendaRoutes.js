const express = require('express');
const router = express.Router();
const {
  registrarVenda,
  listarVendas,
  buscarVenda,
  atualizarStatusPagamento,
  relatorioVendas
} = require('../controllers/vendaController');

// @route   /vendas
router.route('/')
  .get(listarVendas)
  .post(registrarVenda);

router.get('/relatorio', relatorioVendas);

router.route('/:id')
  .get(buscarVenda);

router.put('/:id/pagamento', atualizarStatusPagamento);

module.exports = router;
