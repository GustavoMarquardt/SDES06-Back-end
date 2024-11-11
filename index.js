const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const FestaModel = require('./src/models/FestaModel'); // Importando o modelo corretamente
const UsuarioModel = require('./src/models/UsuarioModel'); // Importando o modelo corretamente
const app = express();
const router = express.Router();  // Definindo o router

app.use(bodyParser.json());
app.use(express.json());

// Inicializando o Sequelize
const sequelize = new Sequelize('SDES06', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

// Usando as rotas definidas
app.use('/api/festas', router);

sequelize.authenticate()
    .then(() => {
        console.log('Conexão com o banco de dados bem-sucedida!');
    })
    .catch((error) => {
        console.error('Erro ao conectar ao banco de dados:', error);
    });

// Definindo o modelo
const Festa = FestaModel(sequelize, Sequelize.DataTypes);  // Inicializando o modelo com Sequelize
const Usuario = UsuarioModel(sequelize, Sequelize.DataTypes);
sequelize.sync({ force: false })
    .then(() => {
        console.log('Banco de dados sincronizado!');
    })
    .catch((error) => {
        console.error('Erro ao sincronizar o banco de dados:', error);
    });

// Função para cadastrar a festa
// async function cadastrarFesta(festa) {
//     try {
//         const novaFesta = await Festa.create({
//             nome_da_festa: festa.nome_da_festa,
//             data_e_hora: festa.data_e_hora,
//             localizacao: festa.localizacao,
//             descricao: festa.descricao,
//             capacidade: festa.capacidade,
//             categoria: festa.categoria,
//         });
//         return novaFesta;
//     } catch (err) {
//         console.log('Erro ao cadastrar a festa:', err);
//         return err;
//     }
// }

// Rota para cadastrar a festa
router.post('/cadastrarFesta', async (req, res) => {
    try {
        const festa = req.body;
        const resultado = await Festa.cadastrar_festa(festa); // Chamando o método do modelo
        res.status(200).json(resultado);  // Retorna a festa criada
    } catch (err) {
        console.log('Erro ao cadastrar a festa:', err);
        res.status(500).json({ mensagem: 'Erro ao cadastrar a festa' });
    }
});
// Rota para listar todas as festas futuras
router.get('/listarFestas', async (req, res) => {
    try {
        const resultado = await Festa.listar_festas();
        return res.status(resultado.status).json(resultado);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: 'Erro ao listar festas.' });
    }
});

// Rota para listar uma festa específica por ID
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

// Rota para atualizar os dados de uma festa
router.put('/atualizarFesta/:id', async (req, res) => {
    const { nome_da_festa, data_e_hora, localizacao, descricao, capacidade, categoria } = req.body;
    const { id } = req.params;

    const festa = {
        id,
        nome_da_festa,
        data_e_hora,
        localizacao,
        descricao,
        capacidade,
        categoria
    };
    
    try {
        const resultado = await Festa.atualizar_festa(festa);
        return res.status(resultado.status).json(resultado);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mensagem: 'Erro ao atualizar a festa.' });
    }
});

// Rota para excluir uma festa
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

// Rota para alterar o perfil de um usuário
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

// Rota para excluir um usuário
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

// Rota para buscar um usuário pelo ID
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

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

module.exports = router ;