require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const {
  clienteRoutes,
  produtoRoutes,
  estoqueRoutes,
  pedidoRoutes,
  vendaRoutes
} = require('./routes');

const app = express();

// Conectar ao banco de dados
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🛍️ API DNCommerce - Sistema de Gerenciamento de Vendas',
    version: '1.0.0',
    endpoints: {
      clientes: '/clientes',
      produtos: '/produtos',
      estoque: '/estoque',
      pedidos: '/pedidos',
      vendas: '/vendas'
    }
  });
});

// Rotas da API
app.use('/clientes', clienteRoutes);
app.use('/produtos', produtoRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/vendas', vendaRoutes);

// Middleware de erro 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🛍️  DNCommerce API                                  ║
  ║   Sistema de Gerenciamento de Vendas                  ║
  ║                                                       ║
  ║   🚀 Servidor rodando na porta ${PORT}                   ║
  ║   📍 http://localhost:${PORT}                            ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
