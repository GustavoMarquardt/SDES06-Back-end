const express = require('express');
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const FestaModel = require('./src/models/FestaModel');
const UsuarioModel = require('./src/models/UsuarioModel');
const app = express();
const router = express.Router();
const cors = require('cors'); // Importe o pacote corsconst cors = require('cors'); // Importe o pacote cors
const AvaliacaoModel = require('./src/models/AvaliacaoModel');
const ComentarioModel = require('./src/models/ComentarioModel');
const multer = require('multer');
const bodyParser = require('body-parser'); // Importa o middleware body-parser


// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage(); // Usando memória para armazenar os arquivos
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }  // Limite de 50MB para o arquivo
});

// Middleware para o body-parser (apenas após o multer)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
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
        const Avaliacao = AvaliacaoModel(sequelize);
        const Comentario = ComentarioModel(sequelize);
        // Sincroniza as tabelas de acordo com os modelos, criando-as se não existirem
        await sequelize.sync({ alter: true });
        console.log('Banco de dados sincronizado!');

        return { Festa, Usuario, Avaliacao, Comentario, sequelize };
    } catch (error) {
        console.error('Erro ao conectar ou sincronizar o banco de dados:', error);
        process.exit(1); // Encerra o processo se houver erro de conexão
    }
}

// Inicializando o banco e iniciando o servidor
initializeDatabase().then(({ Festa, Usuario, Avaliacao, Comentario, sequelize }) => {


    // Rotas de Festa
    router.post('/cadastrarFesta', async (req, res) => {
        try {
            const festa = req.body;  // Dados da festa (sem a imagem)
            console.log(festa);
            // A imagem é uma string base64, então você precisa processá-la
            const imagem_festa_base64 = festa.imagem_festa;  
            
            if (imagem_festa_base64) {
                // Remove a parte 'data:image/jpeg;base64,' do base64 se presente
                const matches = imagem_festa_base64.match(/^data:image\/([a-zA-Z0-9]+);base64,([^\s]+)/);
                if (matches && matches[2]) {
                    const buffer = Buffer.from(matches[2], 'base64'); // Converte o base64 para um Buffer
                    festa.imagem_festa = buffer;  // Armazenando a imagem como buffer para ser salva no banco
                }
            }
    
            console.log('OLA', req.body);  // Dados da festa
            console.log(festa.imagem_festa);  // Imagem recebida como buffer
    
            // Chamada para cadastrar a festa no banco
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


    // Rota para cadastrar uma avaliação
    router.post('/avaliacoes', async (req, res) => {
        try {
            const avaliacao = req.body; // Dados da avaliação enviados pelo cliente
            console.log(avaliacao);
            const resultado = await Avaliacao.cadastrar_avaliacao(avaliacao);
            res.status(resultado.status).json(resultado);
        } catch (error) {
            console.error('Erro ao cadastrar avaliação:', error);
            res.status(500).json({ mensagem: 'Erro interno do servidor' });
        }
    });

    // Rota para listar todas as avaliações
    router.get('/avaliacoes', async (req, res) => {
        try {
            const resultado = await Avaliacao.listar_avaliacao();
            res.status(resultado.status).json(resultado);
        } catch (error) {
            console.error('Erro ao listar avaliações:', error);
            res.status(500).json({ mensagem: 'Erro interno do servidor' });
        }
    });

    // Rota para atualizar uma avaliação
    router.put('/avaliacoes/:id', async (req, res) => {
        try {
            const avaliacao = req.body; // Dados atualizados
            avaliacao.id = req.params.id; // ID da avaliação a ser atualizada
            console.log('to entrando');
            const resultado = await Avaliacao.atualizar_avaliacao(avaliacao);
            res.status(resultado.status).json(resultado);
        } catch (error) {
            console.error('Erro ao atualizar avaliação:', error);
            res.status(500).json({ mensagem: 'Erro interno do servidor' });
        }
    });

    // Rota para excluir uma avaliação
    router.delete('/avaliacoes/:id', async (req, res) => {
        try {
            const id = req.params.id; // ID da avaliação a ser excluída
            const resultado = await Avaliacao.excluir_avaliacao(id);
            res.status(resultado.status).json(resultado);
        } catch (error) {
            console.error('Erro ao excluir avaliação:', error);
            res.status(500).json({ mensagem: 'Erro interno do servidor' });
        }
    });

    // Rota para listar avaliações por criador
    router.get('/avaliacoes/criador/:id_criador', async (req, res) => {
        try {
            const id_criador = req.params.id_criador; // ID do criador
            const resultado = await Avaliacao.listar_avaliacao_por_criador(id_criador);
            res.status(resultado.status).json(resultado);
        } catch (error) {
            console.error('Erro ao listar avaliações por criador:', error);
            res.status(500).json({ mensagem: 'Erro interno do servidor' });
        }
    });

    // Pega todas as avaliações por festa
    router.get('/avaliacoes/festa/:id_festa', async (req, res) => {
        try {
            const id_festa = req.params.id_festa; // ID do criador
            const resultado = await Avaliacao.listar_avaliacao_por_festa(id_festa);
            res.status(resultado.status).json(resultado);
        } catch (error) {
            console.error('Erro ao listar avaliações por criador:', error);
            res.status(500).json({ mensagem: 'Erro interno do servidor' });
        }
    });

    router.post('/comentarios', async (req, res) => {
        try {
            const novoComentario = await Comentario.cadastrar_comentario(req.body);
            return res.status(novoComentario.status).json(novoComentario);
        } catch (error) {
            console.error('Erro ao cadastrar comentário:', error);
            return res.status(500).json({ message: 'Erro ao cadastrar comentário' });
        }
    });

    // Rota para listar todos os comentários
    router.get('/comentarios', async (req, res) => {
        try {
            const comentarios = await Comentario.listar_comentarios();
            return res.status(comentarios.status).json(comentarios);
        } catch (error) {
            console.error('Erro ao listar comentários:', error);
            return res.status(500).json({ message: 'Erro ao listar comentários' });
        }
    });

    // Rota para listar comentários de uma festa específica
    router.get('/comentarios/festa/:id_festa', async (req, res) => {
        try {
            const comentarios = await Comentario.listar_comentarios_por_festa(req.params.id_festa);
            return res.status(comentarios.status).json(comentarios);
        } catch (error) {
            console.error('Erro ao listar comentários por festa:', error);
            return res.status(500).json({ message: 'Erro ao listar comentários por festa' });
        }
    });

    // Rota para listar comentários de um criador específico
    router.get('/comentarios/criador/:id_criador', async (req, res) => {
        try {
            const comentarios = await Comentario.listar_comentarios_por_criador(req.params.id_criador);
            return res.status(comentarios.status).json(comentarios);
        } catch (error) {
            console.error('Erro ao listar comentários por criador:', error);
            return res.status(500).json({ message: 'Erro ao listar comentários por criador' });
        }
    });

    // Rota para atualizar um comentário
    router.put('/comentarios/:id', async (req, res) => {
        try {
            const comentarioAtualizado = await Comentario.atualizar_comentario({ ...req.body, id: req.params.id });
            return res.status(comentarioAtualizado.status).json(comentarioAtualizado);
        } catch (error) {
            console.error('Erro ao atualizar comentário:', error);
            return res.status(500).json({ message: 'Erro ao atualizar comentário' });
        }
    });

    // Rota para excluir um comentário
    router.delete('/comentarios/:id', async (req, res) => {
        try {
            const comentarioExcluido = await Comentario.excluir_comentario(req.params.id);
            return res.status(comentarioExcluido.status).json(comentarioExcluido);
        } catch (error) {
            console.error('Erro ao excluir comentário:', error);
            return res.status(500).json({ message: 'Erro ao excluir comentário' });
        }
    });

    app.get('/comentarios/quantidade/:id_festa', async (req, res) => {
        const { id_festa } = req.params;

        try {
            const resultado = await Comentario.quantidade_likes_dislikes(id_festa);

            res.status(resultado.status).json({
                quantidadeLikes: resultado.quantidadeLikes,
                quantidadeDislikes: resultado.quantidadeDislikes
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
});

module.exports = router;