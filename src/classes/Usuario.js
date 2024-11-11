class Usuario {

        constructor(nome_completo,email,senha,rede_social,login_academico, id = null){
            this.id = id;
            this.nome_completo = nome_completo;
            this.email = email;
            this.senha = senha;
            this.rede_social = rede_social;
            this.login_academico = login_academico;
        }

}

module.exports = Usuario;