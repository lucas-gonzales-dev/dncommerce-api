const { Produto, Estoque } = require('../models');

// @desc    Criar novo produto
// @route   POST /produtos
const criarProduto = async (req, res) => {
  try {
    const produto = await Produto.create(req.body);
    
    // Criar registro de estoque automaticamente
    await Estoque.create({
      produto_id: produto._id,
      quantidade_disponivel: req.body.quantidade_inicial || 0
    });

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: produto
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Código de barras já cadastrado'
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Listar todos os produtos
// @route   GET /produtos
const listarProdutos = async (req, res) => {
  try {
    const { categoria, marca } = req.query;
    const filtro = { ativo: true };
    
    if (categoria) filtro.categoria = categoria;
    if (marca) filtro.marca = new RegExp(marca, 'i');

    const produtos = await Produto.find(filtro);
    res.status(200).json({
      success: true,
      count: produtos.length,
      data: produtos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Buscar produto por ID
// @route   GET /produtos/:id
const buscarProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    // Buscar informações do estoque
    const estoque = await Estoque.findOne({ produto_id: produto._id });
    
    res.status(200).json({
      success: true,
      data: {
        ...produto.toObject(),
        estoque: estoque ? estoque.quantidade_disponivel : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Atualizar produto
// @route   PUT /produtos/:id
const atualizarProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: produto
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Deletar produto (soft delete)
// @route   DELETE /produtos/:id
const deletarProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      { ativo: false },
      { new: true }
    );
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Produto removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  criarProduto,
  listarProdutos,
  buscarProduto,
  atualizarProduto,
  deletarProduto
};
