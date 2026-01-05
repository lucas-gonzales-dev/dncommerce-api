const { Venda, Pedido, Cliente } = require('../models');

// @desc    Registrar nova venda
// @route   POST /vendas
const registrarVenda = async (req, res) => {
  try {
    const { pedido_id, forma_pagamento, desconto = 0 } = req.body;

    // Verificar se pedido existe e está confirmado
    const pedido = await Pedido.findById(pedido_id);
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    // Verificar se já existe venda para este pedido
    const vendaExistente = await Venda.findOne({ pedido_id });
    if (vendaExistente) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma venda registrada para este pedido'
      });
    }

    // Calcular valor final
    const valor_final = pedido.valor_total - desconto;

    // Criar venda
    const venda = await Venda.create({
      pedido_id,
      cliente_id: pedido.cliente_id,
      valor_total: pedido.valor_total,
      forma_pagamento,
      desconto,
      valor_final,
      status_pagamento: 'aprovado'
    });

    // Atualizar status do pedido para confirmado
    pedido.status_pedido = 'confirmado';
    await pedido.save();

    // Populate para retornar dados completos
    const vendaCompleta = await Venda.findById(venda._id)
      .populate('cliente_id', 'nome_cliente email')
      .populate({
        path: 'pedido_id',
        populate: {
          path: 'itens.produto_id',
          select: 'nome_produto'
        }
      });

    res.status(201).json({
      success: true,
      message: 'Venda registrada com sucesso',
      data: vendaCompleta
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Listar todas as vendas
// @route   GET /vendas
const listarVendas = async (req, res) => {
  try {
    const { status_pagamento, forma_pagamento, cliente_id } = req.query;
    const filtro = {};
    
    if (status_pagamento) filtro.status_pagamento = status_pagamento;
    if (forma_pagamento) filtro.forma_pagamento = forma_pagamento;
    if (cliente_id) filtro.cliente_id = cliente_id;

    const vendas = await Venda.find(filtro)
      .populate('cliente_id', 'nome_cliente email')
      .populate('pedido_id', 'itens status_pedido')
      .sort({ data_venda: -1 });

    // Calcular totais
    const totalVendas = vendas.reduce((acc, v) => acc + v.valor_final, 0);

    res.status(200).json({
      success: true,
      count: vendas.length,
      total_vendas: totalVendas,
      data: vendas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Buscar venda por ID
// @route   GET /vendas/:id
const buscarVenda = async (req, res) => {
  try {
    const venda = await Venda.findById(req.params.id)
      .populate('cliente_id', 'nome_cliente email telefone endereco')
      .populate({
        path: 'pedido_id',
        populate: {
          path: 'itens.produto_id',
          select: 'nome_produto categoria preco'
        }
      });

    if (!venda) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: venda
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Atualizar status do pagamento
// @route   PUT /vendas/:id/pagamento
const atualizarStatusPagamento = async (req, res) => {
  try {
    const { status_pagamento } = req.body;
    
    const venda = await Venda.findByIdAndUpdate(
      req.params.id,
      { status_pagamento },
      { new: true, runValidators: true }
    );

    if (!venda) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status do pagamento atualizado',
      data: venda
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Relatório de vendas por período
// @route   GET /vendas/relatorio
const relatorioVendas = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    
    const filtro = { status_pagamento: 'aprovado' };
    
    if (data_inicio || data_fim) {
      filtro.data_venda = {};
      if (data_inicio) filtro.data_venda.$gte = new Date(data_inicio);
      if (data_fim) filtro.data_venda.$lte = new Date(data_fim);
    }

    const vendas = await Venda.find(filtro);
    
    const totalVendas = vendas.length;
    const valorTotal = vendas.reduce((acc, v) => acc + v.valor_final, 0);
    const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;

    // Vendas por forma de pagamento
    const vendasPorPagamento = await Venda.aggregate([
      { $match: filtro },
      { 
        $group: { 
          _id: '$forma_pagamento', 
          total: { $sum: '$valor_final' },
          quantidade: { $sum: 1 }
        } 
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_vendas: totalVendas,
        valor_total: valorTotal,
        ticket_medio: ticketMedio.toFixed(2),
        vendas_por_pagamento: vendasPorPagamento
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registrarVenda,
  listarVendas,
  buscarVenda,
  atualizarStatusPagamento,
  relatorioVendas
};
