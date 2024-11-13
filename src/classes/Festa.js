class Festa {

    constructor(nome_da_festa,data_e_hora,localizacao,descricao,capacidade,categoria, id = null,id_criador){
        this.id = id;
        this.nome_da_festa = nome_da_festa;
        this.data_e_hora = data_e_hora;
        this.localizacao = localizacao;
        this.descricao = descricao;
        this.capacidade = capacidade;
        this.categoria = categoria;
        this.id_criador = id_criador;
    }

}

module.exports = Festa;