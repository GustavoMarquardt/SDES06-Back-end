const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Definição do modelo Avaliacao
    const Avaliacao = sequelize.define('Avaliacao', {
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios', // Nome da tabela relacionada
                key: 'id'          // Chave primária de Usuario
            }
        },
        id_festa: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'festas', // Nome da tabela relacionada
                key: 'id'        // Chave primária de Festa
            }
        },
        organizacao: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        qualidadeMusica: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        bar: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        atendimento: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        localizacao: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        preco: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        comentario: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 500] // Máximo de 500 caracteres
            }
        }
    }, {
        timestamps: false // Desabilita os campos createdAt e updatedAt
    });

    // Definir associações (relacionamentos)
    Avaliacao.associate = function(models) {
        // Associação com o modelo Usuario
        Avaliacao.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
        // Associação com o modelo Festa
        Avaliacao.belongsTo(models.Festa, { foreignKey: 'id_festa' });
    };

    // Função para cadastrar uma avaliação
    Avaliacao.cadastrar_avaliacao = async (avaliacao) => {
        try {
            const novaAvaliacao = await Avaliacao.create(avaliacao);
            return { status: 200, mensagem: 'Avaliação cadastrada com sucesso!', avaliacao: novaAvaliacao };
        } catch (error) {
            console.error('Erro ao cadastrar avaliação:', error);
            return { status: 500, mensagem: 'Erro ao cadastrar avaliação.' };
        }
    };

    // Função para listar avaliações por festa
    Avaliacao.listar_avaliacoes_por_festa = async (id_festa) => {
        try {
            const avaliacoes = await Avaliacao.findAll({
                where: { id_festa },
                include: [{ model: sequelize.models.Usuario, attributes: ['nome_completo'] }]
            });
            return { status: 200, avaliacoes };
        } catch (error) {
            console.error('Erro ao listar avaliações:', error);
            return { status: 500, mensagem: 'Erro ao listar avaliações.' };
        }
    };

    // Função para alterar uma avaliação
    Avaliacao.alterar_avaliacao = async (id, dadosAtualizados) => {
        try {
            const avaliacao = await Avaliacao.findByPk(id);
            if (!avaliacao) {
                return { status: 404, mensagem: 'Avaliação não encontrada.' };
            }

            await avaliacao.update(dadosAtualizados);
            return { status: 200, mensagem: 'Avaliação atualizada com sucesso!', avaliacao };
        } catch (error) {
            console.error('Erro ao alterar avaliação:', error);
            return { status: 500, mensagem: 'Erro ao alterar avaliação.' };
        }
    };

    // Função para excluir uma avaliação
    Avaliacao.excluir_avaliacao = async (id) => {
        try {
            const avaliacaoExcluida = await Avaliacao.destroy({ where: { id } });
            if (!avaliacaoExcluida) {
                return { status: 404, mensagem: 'Avaliação não encontrada ou já excluída.' };
            }

            return { status: 200, mensagem: 'Avaliação excluída com sucesso!' };
        } catch (error) {
            console.error('Erro ao excluir avaliação:', error);
            return { status: 500, mensagem: 'Erro ao excluir avaliação.' };
        }
    };

    return Avaliacao; // Retorna o modelo definido
};
