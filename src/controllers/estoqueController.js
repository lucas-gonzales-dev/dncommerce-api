const { Estoque, Produto } = require('../models');

// @desc    Listar todo estoque
// @route   GET /estoque
const listarEstoque = async (req, res) => {
  try {
    const estoque = await Estoque.find().populate('produto_id', 'nome_produto preco categoria');
    res.status(200).json({
      success: true,
      count: estoque.length,
      data: estoque
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Buscar estoque por produto
// @route   GET /estoque/:produtoId
const buscarEstoqueProduto = async (req, res) => {
  try {
    const estoque = await Estoque.findOne({ produto_id: req.params.produtoId })
      .populate('produto_id', 'nome_produto preco categoria');
    
    if (!estoque) {
      return res.status(404).json({
        success: false,
        message: 'Estoque não encontrado para este produto'
      });
    }
    res.status(200).json({
      success: true,
      data: estoque
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Atualizar quantidade do estoque
// @route   PUT /estoque/:produtoId
const atualizarEstoque = async (req, res) => {
  try {
    const { quantidade_disponivel, quantidade_minima, localizacao } = req.body;
    
    const estoque = await Estoque.findOneAndUpdate(
      { produto_id: req.params.produtoId },
      { 
        quantidade_disponivel,
        quantidade_minima,
        localizacao,
        ultima_atualizacao: Date.now()
      },
      { new: true, runValidators: true, upsert: true }
    ).populate('produto_id', 'nome_produto');

    res.status(200).json({
      success: true,
      message: 'Estoque atualizado com sucesso',
      data: estoque
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Adicionar ao estoque
// @route   POST /estoque/:produtoId/adicionar
const adicionarEstoque = async (req, res) => {
  try {
    const { quantidade } = req.body;
    
    if (!quantidade || quantidade <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantidade deve ser maior que zero'
      });
    }

    const estoque = await Estoque.findOneAndUpdate(
      { produto_id: req.params.produtoId },
      { 
        $inc: { quantidade_disponivel: quantidade },
        ultima_atualizacao: Date.now()
      },
      { new: true }
    ).populate('produto_id', 'nome_produto');

    if (!estoque) {
      return res.status(404).json({
        success: false,
        message: 'Estoque não encontrado para este produto'
      });
    }

    res.status(200).json({
      success: true,
      message: `${quantidade} unidades adicionadas ao estoque`,
      data: estoque
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Listar produtos com estoque baixo
// @route   GET /estoque/alertas/baixo
const listarEstoqueBaixo = async (req, res) => {
  try {
    const estoques = await Estoque.find().populate('produto_id', 'nome_produto preco categoria');
    
    const estoqueBaixo = estoques.filter(e => e.quantidade_disponivel <= e.quantidade_minima);
    
    res.status(200).json({
      success: true,
      count: estoqueBaixo.length,
      message: 'Produtos com estoque baixo ou zerado',
      data: estoqueBaixo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  listarEstoque,
  buscarEstoqueProduto,
  atualizarEstoque,
  adicionarEstoque,
  listarEstoqueBaixo
};
