const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Definição do modelo Festa
    const Avaliacao = sequelize.define('Avaliacao', {
        id_criador_avaliacao: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',  // Nome da tabela com a qual está a relação
                key: 'id'           // Campo que é referenciado em Usuarios
            }
        },
        id_festa: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'festa',  // Nome da tabela com a qual está a relação
                key: 'id'           // Campo que é referenciado em Usuarios
            }
        },
        organizacao: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        qualidade_musica: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        bar: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        atendimento: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        localizcao: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        preco: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        comentario: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,  // Desabilita os campos createdAt e updatedAt
    });

    // Definir a associação (relacionamento) entre Festa e Usuario
    Avaliacao.associate = function (models) {
        // Chave estrangeira: Festa pertence a um Usuario (um criador)
        Festa.belongsTo(models.Usuarios, { foreignKey: 'id_criador' });
    };

    // Funções para manipulação de festas
    Avaliacao.cadastrar_avaliacao = async (avaliacao) => {
        try {
            const novaAvaliacao = await Avaliacao.create(avaliacao);
            return { status: 200, mensagem: 'Avaliacão cadastrada com sucesso', avaliacao: novaAvaliacao };
        } catch (error) {
            console.error('Erro ao cadastrar avaliação:', error);
            return { status: 500, mensagem: 'Erro ao cadastrar avaliação' };
        }
    };

    Avaliacao.listar_avaliacao = async () => {
        try {
            const avaliacao = await Avaliacao.findAll();
            return { status: 200, avaliacao };  // Está retornando as festas corretamente.
        } catch (error) {
            return { status: 500, message: error.message };  // Caso ocorra um erro
        }
    };

    Avaliacao.atualizar_avaliacao = async (avaliacao) => {
        try {
            console.log('OI');
            const updateAvaliacao = await Avaliacao.update(avaliacao, { where: { id: avaliacao.id } });
            return { status: 200, updateAvaliacao };
        } catch (error) {
            return { status: 500, message: error.message };
        }
    };

    Avaliacao.excluir_avaliacao = async (id) => {
        try {
            await Avaliacao.destroy({ where: { id } });
            return { status: 200, message: 'Avaliação excluída com sucesso!' };
        } catch (error) {
            return { status: 500, message: error.message };
        }
    };

    Avaliacao.listar_avaliacao_por_criador = async (id_criador) => {
        try {
            const avaliacoes = await Avaliacao.findAll({
                where: {
                    id_criador_avaliacao: id_criador_avaliacao  // Filtro para o id_criador
                }
            });
            return { status: 200, avaliacoes };  // Retorna as festas do criador
        } catch (error) {
            return { status: 500, message: error.message };  // Caso ocorra um erro
        }
    };

    Avaliacao.listar_avaliacao_por_festa = async (id_festa) => {
        try {
            const avaliacoes = await Avaliacao.findAll({
                where: {
                    id_festa: id_festa  // Filtro para o id_criador
                }
            });
            return { status: 200, avaliacoes };  // Retorna as festas do criador
        } catch (error) {
            return { status: 500, message: error.message };  // Caso ocorra um erro
        }
    }

    return Avaliacao; // Retorna o modelo definido
};
