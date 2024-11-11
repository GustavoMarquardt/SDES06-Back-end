// tests/usuario.test.js
const request = require('supertest');
const app = require('../src/app'); 
const { Sequelize } = require('sequelize'); // Importando a classe Sequelize

let sequelize; // Variável para armazenar a instância do Sequelize


beforeAll(async () => {
  // Conectando ao banco de dados
  sequelize = new Sequelize(
    'SDES06',        // Nome do banco de dados
    'root',          // Nome de usuário
    '',              // Senha (vazia neste caso)
    {
        host: 'localhost',
        port: 3306,
        dialect: 'mysql',
        logging: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        define: {
            timestamps: false,
            freezeTableName: true,
        },
    }
  );
  
  await sequelize.authenticate();  // Autentica a conexão com o banco
  console.log("Banco de dados conectado e pronto para os testes.");
});

afterAll(async () => {
  try {
    // Verifique se a conexão está definida antes de fechar
    if (sequelize) {
      await sequelize.close();
      console.log("Conexão com o banco de dados fechada após os testes.");
    } else {
      console.error("A conexão com o banco de dados não foi inicializada.");
    }
  } catch (error) {
    console.error("Erro ao fechar a conexão com o banco de dados:", error);
  }
});

const request = require('supertest');
const app = require('../src/app'); // Certifique-se de que app está exportado corretamente

describe('Teste das rotas de usuário', () => {
  test('POST /api/festas/cadastrarFesta - deve cadastrar uma nova festa', async () => {
    const nova_festa = {
      nome_da_festa: "Festa de Aniversário",
      data_e_hora: "2024-12-01T20:00:00",
      localizacao: "Rua 123, Bairro",
      descricao: "Festa incrível!",
      capacidade: 100,
      categoria: "Aniversário"
    };

    const response = await request(app)  // 'app' já é a instância do servidor, não precisa de listen()
      .post('/api/festas/cadastrarFesta')
      .send(nova_festa);

    expect(response.statusCode).toBe(200);  // Verifica se o código de status é 200
    expect(response.body).toHaveProperty('mensagem', 'Festa cadastrada com sucesso');
    expect(response.body).toHaveProperty('nome_da_festa', nova_festa.nome_da_festa);
  });
});



// describe('Teste das rotas de usuário', () => {

//   test('POST /api/festas/usuario/cadastrarUsuario - deve cadastrar um novo usuário', async () => {
//     const novoUsuario = {
//       nome_completo: "João da Silva",
//       email: "silva@example.edu.com",
//       senha: "senha123",
//       data_nascimento: "1990-01-01",
//       idade: 20,
//       endereco: "Rua Exemplo, 123, Cidade, Estado",
//       login_academico: "sei la",
//       rede_social: "FACEBOOK"
//     };

//     const response = await request(app)
//       .post('/api/festas/usuario/cadastrarUsuario')
//       .send(novoUsuario);

//     expect(response.statusCode).toBe(200); // Checa se o código de status HTTP é 200
//     expect(response.body).toHaveProperty('mensagem', 'E-mail cadastrado com sucesso');
//     expect(response.body.usuario).toHaveProperty('nome_completo', novoUsuario.nome_completo);
//   });

  // test('POST /usuario/cadastrarUsuario - deve retornar erro se e-mail já existe', async () => {
  //   const usuarioDuplicado = {
  //     nome_completo: "Usuário Existente",
  //     email: "teste@exemplo.edu", // E-mail duplicado
  //     senha: "senhaSegura123",
  //     login_academico: "usuarioexistente",
  //     idade: 25,
  //   };

  //   const response = await request(app)
  //     .post('/api/festas/usuario/cadastrarUsuario')
  //     .send(usuarioDuplicado);

  //   expect(response.statusCode).toBe(409); // Verifica se o código de status é de conflito
  //   expect(response.body).toHaveProperty('mensagem', 'E-mail já cadastrado');
  // });

  // test('POST /usuario/cadastrarUsuario - deve retornar erro se a idade é menor que 18', async () => {
  //   const usuarioMenorDeIdade = {
  //     nome_completo: "Usuário Jovem",
  //     email: "jovem@exemplo.edu",
  //     senha: "senhaSegura123",
  //     login_academico: "usuariojovem",
  //     idade: 17,
  //   };

  //   const response = await request(app)
  //     .post('/api/festas/usuario/cadastrarUsuario')
  //     .send(usuarioMenorDeIdade);

  //   expect(response.statusCode).toBe(400); // Verifica se o código de status é 400 para erro de validação
  //   expect(response.body).toHaveProperty('mensagem', 'Deve ser maior de 18 anos.');
  // });

