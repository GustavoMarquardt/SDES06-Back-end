const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const FestaModel = require('./src/models/FestaModel');
const UsuarioModel = require('./src/models/UsuarioModel');
const app = express();
const router = express.Router();
const cors = require('cors'); // Importe o pacote corsconst cors = require('cors'); // Importe o pacote cors

app.use(cors());

app.use(bodyParser.json());
app.use(express.json());

// Configuração do banco de dados
const DB_NAME = 'sdes06';
const DB_USER = 'root';
const DB_PASSWORD = '';
const DB_HOST = 'localhost';

// Função para criar o banco de dados, se necessário 
async function createDatabaseIfNotExists() {
    const connection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();
}

// Função de inicialização do banco de dados e sincronização
async function initializeDatabase() {
    let sequelize;
    try {
        await createDatabaseIfNotExists();
        sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
            host: DB_HOST,
            dialect: 'mysql',
        });

        // Tenta autenticar a conexão
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados bem-sucedida!');

        // Aqui instanciamos o modelo Festa e Usuario com a conexão
        
        const Usuario = UsuarioModel(sequelize);
        const Festa = FestaModel(sequelize);
        // Sincroniza as tabelas de acordo com os modelos, criando-as se não existirem
        await sequelize.sync({ alter: true });
        console.log('Banco de dados sincronizado!');

        return { Festa, Usuario, sequelize };
    } catch (error) {
        console.error('Erro ao conectar ou sincronizar o banco de dados:', error);
        process.exit(1); // Encerra o processo se houver erro de conexão
    }
}

// Inicializando o banco e iniciando o servidor
initializeDatabase().then(({ Festa, Usuario, sequelize }) => {
    // Agora que a conexão está estabelecida e o modelo Festa está disponível, podemos definir as rotas

    // Rotas de Festa
    router.post('/cadastrarFesta', async (req, res) => {
        try {
            const festa = req.body;
            // Chamando a função cadastrar_festa no modelo Festa
            const resultado = await Festa.cadastrar_festa(festa);
            res.status(200).json(resultado);
        } catch (err) {
            console.log('Erro ao cadastrar a festa:', err);
            res.status(500).json({ mensagem: 'Erro ao cadastrar a festa' });
        }
    });

    router.get('/listarFestas', async (req, res) => {
        try {
            const resultado = await Festa.listar_festas();
            return res.status(resultado.status).json(resultado);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ mensagem: 'Erro ao listar festas.' });
        }
    });

    router.get('/listarFesta/:id', async (req, res) => {
        const { id } = req.params;

        try {
            const festa = await Festa.findByPk(id);
            if (!festa) {
                return res.status(404).json({ mensagem: 'Festa não encontrada.' });
            }
            return res.status(200).json(festa);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ mensagem: 'Erro ao buscar a festa.' });
        }
    });

    router.get('/listarFestaCriador/:id', async (req, res) => {
        const { id } = req.params;  // Pega o ID do criador
    
        try {
            // Busca todas as festas associadas ao id_criador
            const festas = await Festa.findAll({
                where: {
                    id_criador: id  // Filtra as festas pelo id_criador
                }
            });
    
            // Verifica se não encontrou festas para o criador
            if (festas.length === 0) {
                return res.status(404).json({ mensagem: 'Nenhuma festa encontrada para este criador.' });
            }
    
            return res.status(200).json(festas);  // Retorna as festas encontradas
        } catch (err) {
            console.error(err);
            return res.status(500).json({ mensagem: 'Erro ao buscar as festas.' });
        }
    });

    router.put('/atualizarFesta/:id', async (req, res) => {
        const { id } = req.params;
        const festaAtualizada = { id, ...req.body };

        try {
            const resultado = await Festa.atualizar_festa(festaAtualizada);
            return res.status(resultado.status).json(resultado);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ mensagem: 'Erro ao atualizar a festa.' });
        }
    });

    router.delete('/excluirFesta/:id', async (req, res) => {
        const { id } = req.params;

        try {
            const resultado = await Festa.excluir_festa(id);
            return res.status(resultado.status).json(resultado);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ mensagem: 'Erro ao excluir a festa.' });
        }
    });


// Rota para cadastrar um usuário
router.post('/usuario/cadastrarUsuario', async (req, res) => {
    try {
        console.log('ODEIO ISSO');
        const usuario = req.body;
        const resultado = await Usuario.cadastrar_usuario(usuario);
        return res.status(resultado.status).json(resultado);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário' });
    }
});

// Rota para alterar o perfil de um usuário
router.put('/usuario/alterarPerfil/:id', async (req, res) => {
    const { id } = req.params;
    const usuarioAtualizado = { id, ...req.body };

    try {
        const resultado = await Usuario.alterar_perfil(usuarioAtualizado);
        return res.status(resultado.status).json(resultado);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: 'Erro ao alterar perfil' });
    }
});

// Rota para excluir um usuário
router.delete('/usuario/excluirUsuario/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await Usuario.excluir_usuario(id);
        return res.status(resultado.status).json(resultado);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: 'Erro ao excluir usuário' });
    }
});

// Rota para buscar um usuário por ID
router.get('/usuario/buscarUsuario/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await Usuario.buscar_por_id(id);
        return res.status(resultado.status).json(resultado);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: 'Erro ao buscar usuário' });
    }
});

// Rota para fazer login
router.post('/usuario/loginUsuario', async (req, res) => {
    const { email, senha } = req.body; // Obtém o email e a senha do corpo da requisição

    try {
        // Chama a função de autenticação no modelo Usuario
        const resultado = await Usuario.autenticar_usuario(email, senha);

        // Retorna o resultado da autenticação com o status e a mensagem
        return res.status(resultado.status).json(resultado);
    } catch (err) {
        console.error('Erro ao autenticar usuário:', err);
        return res.status(500).json({ mensagem: 'Erro interno ao autenticar usuário.' });
    }
});

    // Inicializando as rotas no servidor
    app.use('/api/festas', router);

    app.listen(3000, () => {
        console.log('Servidor rodando na porta 3000');
    });
});


module.exports = router;