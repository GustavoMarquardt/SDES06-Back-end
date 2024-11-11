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
        }
    }, {
        timestamps: false  // Desabilita os campos createdAt e updatedAt
    });
    Festa.cadastrar_festa = async (festa) => {
        try {
            const novaFesta = await Festa.create({
                nome_da_festa: festa.nome_da_festa,
                data_e_hora: festa.data_e_hora,
                localizacao: festa.localizacao,
                descricao: festa.descricao,
                capacidade: festa.capacidade,
                categoria: festa.categoria,
            });
            return {
                "status": 200,
                "message": "Festa cadastrada com sucesso"
            }
        } catch (err) {
            console.log('Erro ao cadastrar a festa:', err);
            throw new Error(err);  // Lançando um erro para captura
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
