const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  nome_produto: {
    type: String,
    required: [true, 'Nome do produto é obrigatório'],
    trim: true
  },
  descricao: {
    type: String,
    trim: true
  },
  preco: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço não pode ser negativo']
  },
  categoria: {
    type: String,
    enum: ['maquiagem', 'skincare', 'cabelos', 'perfumaria', 'unhas', 'corpo', 'outros'],
    default: 'outros'
  },
  marca: {
    type: String,
    trim: true
  },
  codigo_barras: {
    type: String,
    unique: true,
    sparse: true
  },
  imagem_url: {
    type: String
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Produto', produtoSchema);
