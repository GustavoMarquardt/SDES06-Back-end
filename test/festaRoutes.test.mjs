import request from 'supertest';
import app from '../src/app.js';
import { expect } from 'chai';

describe('Festa API', function () {
    let server;

    before((done) => {
        server = app.listen(3000, done);  // Inicia o servidor antes dos testes
    });

    after((done) => {
        server.close(done);  // Fecha o servidor após os testes
    });

    it('deve cadastrar uma festa via API', async function () {
        const response = await request(server)
            .post('/api/festas/cadastrarFesta')
            .send({
                nome_da_festa: 'Festa Teste',
                data_e_hora: '2024-12-01T20:00:00',
                localizacao: 'Rua Teste',
                descricao: 'Festa de teste',
                capacidade: 100,
                categoria: 'Teste'
            });

        expect(response.status).to.equal(200);
        expect(response.body.message).to.equal('Festa cadastrada com sucesso');
    });
});
