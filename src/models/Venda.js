const mongoose = require('mongoose');

const vendaSchema = new mongoose.Schema({
  pedido_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pedido',
    required: [true, 'Pedido é obrigatório'],
    unique: true
  },
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: [true, 'Cliente é obrigatório']
  },
  valor_total: {
    type: Number,
    required: true,
    min: 0
  },
  forma_pagamento: {
    type: String,
    enum: ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto'],
    required: [true, 'Forma de pagamento é obrigatória']
  },
  status_pagamento: {
    type: String,
    enum: ['pendente', 'aprovado', 'recusado', 'estornado'],
    default: 'pendente'
  },
  data_venda: {
    type: Date,
    default: Date.now
  },
  desconto: {
    type: Number,
    default: 0,
    min: 0
  },
  valor_final: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Venda', vendaSchema);
