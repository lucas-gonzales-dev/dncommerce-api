const { Pedido, Estoque, Cliente, Produto } = require('../models');

// @desc    Criar novo pedido
// @route   POST /pedidos
const criarPedido = async (req, res) => {
  try {
    const { cliente_id, itens, endereco_entrega, observacoes } = req.body;

    // Verificar se cliente existe
    const cliente = await Cliente.findById(cliente_id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Processar itens e calcular valores
    let valor_total = 0;
    const itensProcessados = [];

    for (const item of itens) {
      const produto = await Produto.findById(item.produto_id);
      if (!produto) {
        return res.status(404).json({
          success: false,
          message: `Produto ${item.produto_id} não encontrado`
        });
      }

      // Verificar estoque
      const estoque = await Estoque.findOne({ produto_id: item.produto_id });
      if (!estoque || estoque.quantidade_disponivel < item.quantidade) {
        return res.status(400).json({
          success: false,
          message: `Estoque insuficiente para o produto: ${produto.nome_produto}`
        });
      }

      const subtotal = produto.preco * item.quantidade;
      valor_total += subtotal;

      itensProcessados.push({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: produto.preco,
        subtotal
      });
    }

    // Criar pedido
    const pedido = await Pedido.create({
      cliente_id,
      itens: itensProcessados,
      valor_total,
      endereco_entrega: endereco_entrega || cliente.endereco,
      observacoes
    });

    // Atualizar estoque (reservar produtos)
    for (const item of itensProcessados) {
      await Estoque.findOneAndUpdate(
        { produto_id: item.produto_id },
        { 
          $inc: { quantidade_disponivel: -item.quantidade },
          ultima_atualizacao: Date.now()
        }
      );
    }

    // Populate para retornar dados completos
    const pedidoCompleto = await Pedido.findById(pedido._id)
      .populate('cliente_id', 'nome_cliente email')
      .populate('itens.produto_id', 'nome_produto');

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      data: pedidoCompleto
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Listar todos os pedidos
// @route   GET /pedidos
const listarPedidos = async (req, res) => {
  try {
    const { status, cliente_id } = req.query;
    const filtro = {};
    
    if (status) filtro.status_pedido = status;
    if (cliente_id) filtro.cliente_id = cliente_id;

    const pedidos = await Pedido.find(filtro)
      .populate('cliente_id', 'nome_cliente email')
      .populate('itens.produto_id', 'nome_produto')
      .sort({ data_pedido: -1 });

    res.status(200).json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Buscar pedido por ID
// @route   GET /pedidos/:id
const buscarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('cliente_id', 'nome_cliente email telefone')
      .populate('itens.produto_id', 'nome_produto categoria');

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: pedido
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Atualizar status do pedido
// @route   PUT /pedidos/:id/status
const atualizarStatusPedido = async (req, res) => {
  try {
    const { status_pedido } = req.body;
    
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    // Se cancelar, devolver ao estoque
    if (status_pedido === 'cancelado' && pedido.status_pedido !== 'cancelado') {
      for (const item of pedido.itens) {
        await Estoque.findOneAndUpdate(
          { produto_id: item.produto_id },
          { 
            $inc: { quantidade_disponivel: item.quantidade },
            ultima_atualizacao: Date.now()
          }
        );
      }
    }

    pedido.status_pedido = status_pedido;
    await pedido.save();

    res.status(200).json({
      success: true,
      message: 'Status do pedido atualizado',
      data: pedido
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Deletar pedido
// @route   DELETE /pedidos/:id
const deletarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    // Devolver ao estoque se não estava cancelado
    if (pedido.status_pedido !== 'cancelado') {
      for (const item of pedido.itens) {
        await Estoque.findOneAndUpdate(
          { produto_id: item.produto_id },
          { 
            $inc: { quantidade_disponivel: item.quantidade },
            ultima_atualizacao: Date.now()
          }
        );
      }
    }

    await Pedido.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Pedido removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  criarPedido,
  listarPedidos,
  buscarPedido,
  atualizarStatusPedido,
  deletarPedido
};
