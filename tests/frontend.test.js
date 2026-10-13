const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('GameHub Frontend — Validação Estrutural do HTML e Requisitos', () => {
  const htmlContent = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

  it('deve conter a tag de título com o nome GameHub', () => {
    assert.match(htmlContent, /<title>.*GameHub.*<\/title>/i);
  });

  it('deve conter os nomes completos dos três integrantes no rodapé', () => {
    assert.ok(
      htmlContent.includes('Arthur Nunes de Souza Possato'),
      'Falta o integrante Arthur Nunes de Souza Possato'
    );
    assert.ok(
      htmlContent.includes('Enzo Marques Cardona'),
      'Falta o integrante Enzo Marques Cardona'
    );
    assert.ok(
      htmlContent.includes('Pedro Sante Maria Bueno Silva'),
      'Falta o integrante Pedro Sante Maria Bueno Silva'
    );
  });

  it('deve conter todos os campos obrigatórios no formulário de cadastro/edição', () => {
    assert.ok(htmlContent.includes('id="inputNome"'), 'Falta inputNome');
    assert.ok(htmlContent.includes('id="inputDesenvolvedora"'), 'Falta inputDesenvolvedora');
    assert.ok(htmlContent.includes('id="inputGenero"'), 'Falta inputGenero');
    assert.ok(htmlContent.includes('id="inputPlataforma"'), 'Falta inputPlataforma');
    assert.ok(htmlContent.includes('id="inputPreco"'), 'Falta inputPreco');
    assert.ok(htmlContent.includes('id="inputAno"'), 'Falta inputAno');
    assert.ok(htmlContent.includes('id="inputImagem"'), 'Falta inputImagem');
    assert.ok(htmlContent.includes('id="inputDescricao"'), 'Falta inputDescricao');
  });

  it('deve conter as 8 opções obrigatórias de gêneros no select de cadastro', () => {
    const generos = [
      'Ação',
      'Aventura',
      'RPG',
      'Corrida',
      'Estratégia',
      'Terror',
      'Esportes',
      'Outros',
    ];

    generos.forEach((genero) => {
      assert.ok(
        htmlContent.includes(`<option value="${genero}">${genero}</option>`),
        `Gênero obrigatório ausente: ${genero}`
      );
    });
  });

  it('deve conter as 5 opções obrigatórias de plataformas no select de cadastro', () => {
    const plataformas = [
      'PC',
      'PlayStation',
      'Xbox',
      'Nintendo Switch',
      'Multiplataforma',
    ];

    plataformas.forEach((plataforma) => {
      assert.ok(
        htmlContent.includes(`<option value="${plataforma}">${plataforma}</option>`),
        `Plataforma obrigatória ausente: ${plataforma}`
      );
    });
  });

  it('deve conter a barra de busca e todos os filtros exigidos', () => {
    assert.ok(htmlContent.includes('id="searchInput"'), 'Falta campo de busca');
    assert.ok(htmlContent.includes('id="genreFilter"'), 'Falta filtro de gênero');
    assert.ok(htmlContent.includes('id="platformFilter"'), 'Falta filtro de plataforma');
    assert.ok(htmlContent.includes('id="sortOrder"'), 'Falta controle de ordenação');
  });

  it('deve conter os modais essenciais (Cadastro/Edição, Detalhes, Exclusão)', () => {
    assert.ok(htmlContent.includes('id="gameModal"'), 'Falta modal de cadastro/edição');
    assert.ok(htmlContent.includes('id="detailsModal"'), 'Falta modal de detalhes');
    assert.ok(htmlContent.includes('id="deleteModal"'), 'Falta modal de confirmação de exclusão');
  });

  it('deve conter o container de toasts para feedback de sucesso e erro', () => {
    assert.ok(htmlContent.includes('id="toastContainer"'), 'Falta toastContainer');
  });

  it('deve carregar a folha de estilos style.css e o script.js', () => {
    assert.ok(htmlContent.includes('rel="stylesheet" href="style.css"'));
    assert.ok(htmlContent.includes('<script src="script.js"></script>'));
  });
});
