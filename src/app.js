const express = require('express');
const app = express();
const { router, initializeDatabase } = require('../index');

// Configura o roteador na rota desejada
app.use('/api', router);

// Inicializa o banco de dados e inicia o servidor
initializeDatabase().then(() => {
    app.listen(3000, () => {
        console.log('Servidor rodando na porta 3000');
    });
});

module.exports = app;
