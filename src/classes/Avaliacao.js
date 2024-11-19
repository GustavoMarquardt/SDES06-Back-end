class Avaliacao {
    constructor(
        id_usuario, // Referência ao autor da avaliação (Usuário)
        id_festa, // Referência à festa avaliada
        organizacao, // Nota entre 1 e 5
        qualidadeMusica, // Nota entre 1 e 5
        bar, // Nota entre 1 e 5
        atendimento, // Nota entre 1 e 5
        localizacao, // Nota entre 1 e 5
        preco, // Nota entre 1 e 5
        comentario = null, // Comentário opcional (máx. 500 caracteres)
        id = null // Identificador único da avaliação
    ) 
    {
        this.id = id;
        this.id_usuario = id_usuario;
        this.id_festa = id_festa;
        this.organizacao = organizacao;
        this.qualidadeMusica = qualidadeMusica;
        this.bar = bar;
        this.atendimento = atendimento;
        this.localizacao = localizacao;
        this.preco = preco;
        this.comentario = comentario;
    }

    // Método para calcular a nota média da avaliação
    calcularNotaMedia() {
        return (
            (this.organizacao +
                this.qualidadeMusica +
                this.bar +
                this.atendimento +
                this.localizacao +
                this.preco) / 6
        );
    }
}

module.exports = Avaliacao;
