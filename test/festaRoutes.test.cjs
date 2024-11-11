import request from 'supertest';  // Também usando importação dinâmica
import app from '../src/app';  // Certifique-se de que o caminho está correto para o seu arquivo app.js

describe('Festa API', function() {
    it('deve cadastrar uma festa via API', async function() {
        const { expect } = await import('chai');  // Importação dinâmica do Chai

        const response = await request(app)
            .post('/festa')
            .send({
                nome_da_festa: 'Festa Teste',
                data_e_hora: '2024-12-01T20:00:00',
                localizacao: 'Rua Teste',
                descricao: 'Festa de teste',
                capacidade: 100,
                categoria: 'Teste'
            });

        expect(response.status).to.equal(200);  // Verifica se o status é 200
        expect(response.body.message).to.equal('Festa cadastrada com sucesso');  // Verifica a mensagem de sucesso
    });
});
