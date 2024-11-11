const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Usuario = sequelize.define('Usuario', {
        nome_completo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        senha: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rede_social: {
            type: DataTypes.STRING,
            allowNull: true
        },
        login_academico: {
            type: DataTypes.STRING,
            allowNull: false
        },
        idade: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false  // Desabilita os campos createdAt e updatedAt
    });

    // Função para cadastrar um novo usuário
    Usuario.cadastrar_usuario = async (usuario) => {
        try {
            // Verificação de e-mail já cadastrado
            const usuarioExistente = await Usuario.findOne({ where: { email: usuario.email } });
            if (usuarioExistente) {
                return { status: 409, mensagem: 'E-mail já cadastrado' };
            }

            // Verificação da senha
            if (!usuario.senha || usuario.senha.length < 8) {
                return { status: 400, mensagem: 'Senha deve ter no mínimo 8 caracteres.' };
            }

            // Verificação da idade
            if (usuario.idade < 18) {
                return { status: 400, mensagem: 'Deve ser maior de 18 anos.' };
            }

            const regex = /\.edu/;
            const email = usuario.email;

            if (regex.test(email)) {
                return { status: 400, mensagem: 'Nosso sistema atende somente e-mails institucionais.' };
            }

            // Criação do novo usuário no banco
            const novoUsuario = await Usuario.create(usuario);

            return { status: 200, mensagem: 'E-mail cadastrado com sucesso', usuario: novoUsuario };
        } catch (err) {
            console.log('Erro ao cadastrar usuário:', err);
            return { status: 500, mensagem: 'Erro ao cadastrar o usuário no banco de dados' };
        }
    };

    // Função para alterar os dados do usuário
    Usuario.alterar_perfil = async (usuario) => {
        try {
            const usuarioExistente = await Usuario.findByPk(usuario.id);
            if (!usuarioExistente) {
                return { status: 404, mensagem: 'Usuário não encontrado para atualização.' };
            }

            // Atualiza os dados do usuário
            usuarioExistente.nome_completo = usuario.nome_completo || usuarioExistente.nome_completo;
            usuarioExistente.senha = usuario.senha || usuarioExistente.senha;
            usuarioExistente.rede_social = usuario.rede_social || usuarioExistente.rede_social;

            await usuarioExistente.save();  // Salva as alterações no banco de dados

            return { status: 200, mensagem: 'Dados atualizados com sucesso', usuario: usuarioExistente };
        } catch (err) {
            console.log('Erro ao atualizar perfil:', err);
            return { status: 500, mensagem: 'Erro ao atualizar o perfil.' };
        }
    };

    // Função para excluir um usuário
    Usuario.excluir_usuario = async (id) => {
        try {
            const usuarioExistente = await Usuario.findByPk(id);
            if (!usuarioExistente) {
                return { status: 404, mensagem: 'Usuário não encontrado ou já excluído.' };
            }

            // Exclui o usuário
            await usuarioExistente.destroy();

            return { status: 200, mensagem: 'Usuário excluído com sucesso.' };
        } catch (err) {
            console.log('Erro ao excluir o usuário:', err);
            return { status: 500, mensagem: 'Erro ao excluir o usuário.' };
        }
    };

    // Função para buscar um usuário por ID
    Usuario.buscar_por_id = async (id) => {
        try {
            const usuario = await Usuario.findByPk(id, { attributes: ['nome_completo', 'email', 'rede_social'] });
            if (!usuario) {
                return { status: 404, mensagem: 'Usuário não encontrado.' };
            }

            return { status: 200, mensagem: 'Dados recebidos com sucesso.', dados: usuario };
        } catch (err) {
            console.log('Erro ao buscar usuário:', err);
            return { status: 500, mensagem: 'Erro ao buscar o usuário.' };
        }
    };

    return Usuario;
};
