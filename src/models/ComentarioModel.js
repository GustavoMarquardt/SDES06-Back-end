const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Definição do modelo Comentario
    const Comentario = sequelize.define('Comentario', {
        id_criador_comentario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',  // Nome da tabela com a qual está a relação
                key: 'id'           // Campo que é referenciado em Usuarios
            }
        },
        id_avaliacao: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'avaliacaos',  // Nome da tabela com a qual está a relação
                key: 'id'        // Campo que é referenciado em Avaliacao
            }
        },
        comentario: {
            type: DataTypes.STRING,
            allowNull: false
        },
            //timestamps: false,  // Desabilita os campos createdAt e updatedAt
        });

    // Definir a associação (relacionamento) entre Comentario e Festa e Usuario
    Comentario.associate = function (models) {
        // Comentario pertence a uma Avaliacao
        Comentario.belongsTo(models.Avaliacao, { foreignKey: 'id' });

        // Comentario pertence a um Usuario (criador)
        Comentario.belongsTo(models.Usuarios, { foreignKey: 'id_criador_comentario' });
    };

    // Funções para manipulação de comentários

    Comentario.cadastrar_comentario = async (comentario) => {
        try {
            const novoComentario = await Comentario.create(comentario);
            return { status: 200, mensagem: 'Comentário cadastrado com sucesso', comentario: novoComentario };
        } catch (error) {
            console.error('Erro ao cadastrar comentário:', error);
            return { status: 500, mensagem: 'Erro ao cadastrar comentário' };
        }
    };

    Comentario.listar_comentarios = async () => {
        try {
            const comentarios = await Comentario.findAll();
            return { status: 200, comentarios };  // Retorna todos os comentários
        } catch (error) {
            return { status: 500, message: error.message };  // Caso ocorra um erro
        }
    };

    Comentario.atualizar_comentario = async (comentario) => {
        try {
            const comentarioAtualizado = await Comentario.update(comentario, { where: { id: comentario.id } });
            return { status: 200, comentarioAtualizado };
        } catch (error) {
            return { status: 500, message: error.message };
        }
    };

    Comentario.excluir_comentario = async (id) => {
        try {
            await Comentario.destroy({ where: { id } });
            return { status: 200, message: 'Comentário excluído com sucesso!' };
        } catch (error) {
            return { status: 500, message: error.message };
        }
    };

    Comentario.listar_comentarios_por_festa = async (id_avaliacao) => {
        try {
            console.log('id avaliacao',id_avaliacao)
            const comentarios = await Comentario.findAll({
                where: {
                    id_avaliacao: id_avaliacao  // Filtro para o id da festa
                }
            });
            return { status: 200, comentarios };  // Retorna os comentários da festa
        } catch (error) {
            return { status: 500, message: error.message };  // Caso ocorra um erro
        }
    };

    Comentario.listar_comentarios_por_criador = async (id_criador) => {
        try {
            const comentarios = await Comentario.findAll({
                where: {
                    id_criador_comentario: id_criador  // Filtro para o id do criador
                }
            });
            return { status: 200, comentarios };  // Retorna os comentários do criador
        } catch (error) {
            return { status: 500, message: error.message };  // Caso ocorra um erro
        }
    };

    Comentario.listar_comentarios_por_criador = async (id_criador) => {
        try {
            const comentarios = await Comentario.findAll({
                where: {
                    id_criador_comentario: id_criador  // Filtro para o id do criador
                }
            });
            return { status: 200, comentarios };  // Retorna os comentários do criador
        } catch (error) {
            return { status: 500, message: error.message };  // Caso ocorra um erro
        }
    };

    Comentario.quantidade_likes_dislikes = async (id_festa) => {
        try {
            // Contagem de likes (where like = true)
            const quantidadeLikes = await Comentario.count({
                where: {
                    id_festa: id_festa,
                    like: true
                }
            });
    
            // Contagem de dislikes (where dislike = true)
            const quantidadeDislikes = await Comentario.count({
                where: {
                    id_festa: id_festa,
                    dislike: true
                }
            });
    
            return {
                status: 200,
                quantidadeLikes,
                quantidadeDislikes
            };
        } catch (error) {
            return { status: 500, message: error.message };
        }
    };
    

    return Comentario; // Retorna o modelo definido
};
