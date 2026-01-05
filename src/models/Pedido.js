const mongoose = require('mongoose');

const itemPedidoSchema = new mongoose.Schema({
  produto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produto',
    required: true
  },
  quantidade: {
    type: Number,
    required: true,
    min: [1, 'Quantidade mínima é 1']
  },
  preco_unitario: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  }
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: [true, 'Cliente é obrigatório']
  },
  itens: {
    type: [itemPedidoSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Pedido deve ter pelo menos um item'
    }
  },
  valor_total: {
    type: Number,
    required: true,
    min: 0
  },
  status_pedido: {
    type: String,
    enum: ['pendente', 'confirmado', 'em_preparacao', 'enviado', 'entregue', 'cancelado'],
    default: 'pendente'
  },
  data_pedido: {
    type: Date,
    default: Date.now
  },
  endereco_entrega: {
    rua: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String
  },
  observacoes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Pedido', pedidoSchema);
