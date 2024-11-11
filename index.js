const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const FestaModel = require('./src/models/FestaModel');
const UsuarioModel = require('./src/models/UsuarioModel');
const app = express();
const router = express.Router();

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
    try {
        await createDatabaseIfNotExists();
        const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
            host: DB_HOST,
            dialect: 'mysql',
        });

        // Tenta autenticar a conexão
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados bem-sucedida!');

        const Festa = FestaModel(sequelize, Sequelize.DataTypes);
        const Usuario = UsuarioModel(sequelize, Sequelize.DataTypes);

        // Sincroniza as tabelas de acordo com os modelos, criando-as se não existirem
        await sequelize.sync({ alter: true });
        console.log('Banco de dados sincronizado!');

        return { Festa, Usuario, sequelize };
    } catch (error) {
        console.error('Erro ao conectar ou sincronizar o banco de dados:', error);
        process.exit(1); // Encerra o processo se houver erro de conexão
    }
}

// Rotas de Festa
router.post('/cadastrarFesta', async (req, res) => {
    try {
        const festa = req.body;
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

// Rotas de Usuario
router.post('/cadastrarUsuario', async (req, res) => {
    try {
        const usuario = req.body;
        const resultadoCadastro = await Usuario.cadastrar_usuario(usuario);
        res.status(resultadoCadastro.status).json({
            mensagem: resultadoCadastro.mensagem,
            usuario: resultadoCadastro.usuario || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensagem: 'Erro ao tentar cadastrar o usuário.' });
    }
});

router.put('/alterarUsuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioAtualizado = { id, ...req.body };
        const resultadoAlteracao = await Usuario.alterar_perfil(usuarioAtualizado);
        res.status(resultadoAlteracao.status).json({
            mensagem: resultadoAlteracao.mensagem,
            usuario: resultadoAlteracao.usuario || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensagem: 'Erro ao tentar alterar os dados do usuário.' });
    }
});

router.delete('/excluirUsuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultadoExclusao = await Usuario.excluir_usuario(id);
        res.status(resultadoExclusao.status).json({ mensagem: resultadoExclusao.mensagem });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensagem: 'Erro ao tentar excluir o usuário.' });
    }
});

router.get('/buscarUsuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.buscar_por_id(id);
        res.status(usuario.status).json({
            mensagem: usuario.mensagem,
            usuario: usuario.dados || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensagem: 'Erro ao tentar buscar os dados do usuário.' });
    }
});

// Inicializando o banco e iniciando o servidor
initializeDatabase().then(({ Festa, Usuario }) => {
    app.use('/api/festas', router);

    app.listen(3000, () => {
        console.log('Servidor rodando na porta 3000');
    });
});
