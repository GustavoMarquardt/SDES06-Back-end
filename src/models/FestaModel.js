const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Definição do modelo Festa
    const Festa = sequelize.define('Festa', {
        nome_da_festa: {
            type: DataTypes.STRING,
            allowNull: false
        },
        data_e_hora: {
            type: DataTypes.DATE,
            allowNull: false
        },
        localizacao: {
            type: DataTypes.STRING,
            allowNull: false
        },
        descricao: {
            type: DataTypes.STRING,
            allowNull: false
        },
        capacidade: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        categoria: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_criador: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',  // Nome da tabela com a qual está a relação
                key: 'id'           // Campo que é referenciado em Usuarios
            }
        }
    }, {
        timestamps: false,  // Desabilita os campos createdAt e updatedAt
    });

    // Definir a associação (relacionamento) entre Festa e Usuario
    Festa.associate = function(models) {
        // Chave estrangeira: Festa pertence a um Usuario (um criador)
        Festa.belongsTo(models.Usuarios, { foreignKey: 'id_criador' });
    };

    // Funções para manipulação de festas
    Festa.cadastrar_festa = async (festa) => {
        try {
            const novaFesta = await Festa.create(festa);
            return { status: 200, mensagem: 'Festa cadastrada com sucesso!', festa: novaFesta };
        } catch (error) {
            console.error('Erro ao cadastrar festa:', error);
            return { status: 500, mensagem: 'Erro ao cadastrar festa' };
        }
    };

    Festa.listar_festas = async () => {
        try {
            const festas = await Festa.findAll({
                where: {
                    data_e_hora: {
                        [Sequelize.Op.gte]: new Date()  // Filtra as festas futuras
                    }
                }
            });
            return { status: 200, festas };  // Está retornando as festas corretamente.
        } catch (error) {
            return { status: 500, message: error.message };  // Caso ocorra um erro
        }
    };

    Festa.atualizar_festa = async (festa) => {
        try {
            const updatedFesta = await Festa.update(festa, { where: { id: festa.id } });
            return { status: 200, updatedFesta };
        } catch (error) {
            return { status: 500, message: error.message };
        }
    };

    Festa.excluir_festa = async (id, usuario) => {
        try {
            const deletedFesta = await Festa.destroy({ where: { id } });
            return { status: 200, message: 'Festa excluída com sucesso!' };
        } catch (error) {
            return { status: 500, message: error.message };
        }
    };

    return Festa; // Retorna o modelo definido
};
