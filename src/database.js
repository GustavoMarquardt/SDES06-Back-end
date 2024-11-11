const Sequelize = require('sequelize');

// Configuração da conexão com o banco de dados MySQL
const sequelize = new Sequelize(
    'SDES06',        // Nome do banco de dados
    'root',          // Nome de usuário
    '',              // Senha (vazia neste caso)
    {
        host: 'localhost',  // Altere para 'mysqldb' ou o nome do seu serviço Docker se estiver usando o Docker
        port: 3306,         // A porta padrão para MySQL é 3306
        dialect: 'mysql',
        logging: true,      // Ativar logs do Sequelize
        define: {
            timestamps: false,  // Desativa a criação de timestamps automáticos
            freezeTableName: true, // Impede que o Sequelize altere o nome das tabelas
        },
    }
);

const conectar = async function () {
    try {
        // Tenta autenticar a conexão
        await sequelize.authenticate();

        console.log(`\n--> Connection with 'mysqldb:3306/SDES06' established`);

        return sequelize;  // Retorna a instância do Sequelize
    } catch (error) {
        console.error(`\nUnable to establish connection with 'mysqldb:3306/SDES06' using user 'root' and empty password!`);
        console.error(error);

        throw error;  // Lança o erro novamente para que possa ser tratado externamente
    }
};

module.exports = {
  conectar: conectar,
};
