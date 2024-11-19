const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const FestaModel = require('./src/models/FestaModel');
const UsuarioModel = require('./src/models/UsuarioModel');
const AvaliacaoModel = require('./src/models/AvaliacaoModel'); // Importar Avaliação
const app = express();
const router = express.Router();
const cors = require('cors');

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

        // Instanciando os modelos
        const Usuario = UsuarioModel(sequelize);
        const Festa = FestaModel(sequelize);
        const Avaliacao = AvaliacaoModel(sequelize);

        // Sincroniza as tabelas de acordo com os modelos
        await sequelize.sync({ alter: true });
        console.log('Banco de dados sincronizado!');

        return { Festa, Usuario, Avaliacao, sequelize };
    } catch (error) {
        console.error('Erro ao conectar ou sincronizar o banco de dados:', error);
        process.exit(1); // Encerra o processo se houver erro de conexão
    }
}

// Inicializando o banco e iniciando o servidor
initializeDatabase().then(({ Festa, Usuario, Avaliacao, sequelize }) => {
    // Rotas de Festa
    router.post('/cadastrarFesta', async (req, res) => {
        try {
            const festa = req.body;
            const resultado = await Festa.cadastrar_festa(festa);
            res.status(200).json(resultado);
        } catch (err) {
            console.error('Erro ao cadastrar a festa:', err);
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
        const { id } = req.params;
    
        try {
            const festas = await Festa.findAll({ where: { id_criador: id } });
            if (festas.length === 0) {
                return res.status(404).json({ mensagem: 'Nenhuma festa encontrada para este criador.' });
            }
            return res.status(200).json(festas);
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

    // Rotas de Usuário
    router.post('/usuario/cadastrarUsuario', async (req, res) => {
        try {
            const usuario = req.body;
            const resultado = await Usuario.cadastrar_usuario(usuario);
            return res.status(resultado.status).json(resultado);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário' });
        }
    });

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

    router.post('/usuario/loginUsuario', async (req, res) => {
        const { email, senha } = req.body;

        try {
            const resultado = await Usuario.autenticar_usuario(email, senha);
            return res.status(resultado.status).json(resultado);
        } catch (err) {
            console.error('Erro ao autenticar usuário:', err);
            return res.status(500).json({ mensagem: 'Erro interno ao autenticar usuário.' });
        }
    });

    // Rotas de Avaliação
    router.post('/avaliacao/cadastrar', async (req, res) => {
        try {
            const avaliacao = req.body;
            const resultado = await Avaliacao.cadastrar_avaliacao(avaliacao);
            return res.status(resultado.status).json(resultado);
        } catch (err) {
            console.error('Erro ao cadastrar avaliação:', err);
            return res.status(500).json({ mensagem: 'Erro ao cadastrar avaliação.' });
        }
    });

    router.get('/avaliacao/listarPorFesta/:id_festa', async (req, res) => {
        const { id_festa } = req.params;
        try {
            const resultado = await Avaliacao.listar_avaliacoes_por_festa(id_festa);
            return res.status(resultado.status).json(resultado);
        } catch (err) {
            console.error('Erro ao listar avaliações:', err);
            return res.status(500).json({ mensagem: 'Erro ao listar avaliações.' });
        }
    });

    router.put('/avaliacao/alterar/:id', async (req, res) => {
        const { id } = req.params;
        const avaliacaoAtualizada = { id, ...req.body };
        try {
            const resultado = await Avaliacao.alterar_avaliacao(id, avaliacaoAtualizada);
            return res.status(resultado.status).json(resultado);
        } catch (err) {
            console.error('Erro ao alterar avaliação:', err);
            return res.status(500).json({ mensagem: 'Erro ao alterar avaliação.' });
        }
    });

    router.delete('/avaliacao/excluir/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const resultado = await Avaliacao.excluir_avaliacao(id);
            return res.status(resultado.status).json(resultado);
        } catch (err) {
            console.error('Erro ao excluir avaliação:', err);
            return res.status(500).json({ mensagem: 'Erro ao excluir avaliação.' });
        }
    });

    // Inicializando as rotas no servidor
    app.use('/api', router);

    app.listen(3000, () => {
        console.log('Servidor rodando na porta 3000');
    });
});

module.exports = router;
