const mongoose = require('mongoose');

const estoqueSchema = new mongoose.Schema({
  produto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produto',
    required: [true, 'Produto é obrigatório'],
    unique: true
  },
  quantidade_disponivel: {
    type: Number,
    required: [true, 'Quantidade disponível é obrigatória'],
    min: [0, 'Quantidade não pode ser negativa'],
    default: 0
  },
  quantidade_minima: {
    type: Number,
    default: 5,
    min: 0
  },
  localizacao: {
    type: String,
    trim: true
  },
  ultima_atualizacao: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Método virtual para verificar se está abaixo do estoque mínimo
estoqueSchema.virtual('estoque_baixo').get(function() {
  return this.quantidade_disponivel <= this.quantidade_minima;
});

// Garantir que virtuals sejam incluídos no JSON
estoqueSchema.set('toJSON', { virtuals: true });
estoqueSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Estoque', estoqueSchema);
