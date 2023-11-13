const express = require('express');
const mysql = require('mysql');
const dbLogin = require('../../settings').dbLogin;

const router = express.Router();

// Cria a conexão SQL
// OBS: crie um arquivo no topo chamado settings.js
// exportando um dictionary dbLogin para isto funcionar
const pool = mysql.createPool({
  host: dbLogin.host,
  user: dbLogin.user,
  password: dbLogin.password,
  database: dbLogin.database,
});

// GET request para database
router.get('/api/data', (req, res) => {
    
    // parametros suportadas pela API
    // valores abaixo são os valores-padrão
    const {
        page = 1, // Pagina atual
        pageSize = 50, // Quantidade de jogos por página
        name = "", // Nome do jogo (ou aproximado)
        categories = [], // Categorias (Multiplayer, Steam Achievements, etc)
        genres = [] // Generos (Action, Adventure, etc)
    } = req.query;

    // Calculo de onde começar a paginação
    const offset = (page - 1) * pageSize;

    // Query atual
    // OBS: WHERE 1=1 é usado para poder inserir mais facilmente
    // outras condições depois, sem precisar se preocupar se vai precisar
    // ou não colocar AND, pois já há uma condição base verdadeira
    let currentRequest = `
    SELECT DISTINCT
     idJogo, nomeJogo, dataLancamento, faixaEtaria, preco, descricao,
     metacritic, quantReviews, quantRecomendacoes, 
     Windows, Linux, macOS,
     numProprietariosSteam, aproxJogadoresTotais, 
     quantDLCs, quantDemos, quantConquistas
    FROM steamdb.jogo
    INNER JOIN avaliacao ON jogo.Avaliacao_idAvaliacao = avaliacao.idAvaliacao
    INNER JOIN plataforma ON jogo.Plataforma_idPlataforma = plataforma.idPlataforma
    INNER JOIN distribuicao ON jogo.Distribuicao_idDistribuicao = distribuicao.idDistribuicao
    INNER JOIN recurso ON jogo.Recurso_idRecurso = recurso.idRecurso
    LEFT JOIN jogo_has_categoria ON jogo.idJogo = jogo_has_categoria.Jogo_idJogo
    LEFT JOIN categoria ON jogo_has_categoria.Categoria_idCategoria = categoria.idCategoria
    LEFT JOIN jogo_has_genero ON jogo.idJogo = jogo_has_genero.Jogo_idJogo
    LEFT JOIN genero ON jogo_has_genero.Genero_idGenero = genero.idGenero
    WHERE 1=1
    `

    // Se há categorias, verifica se é um array ou um único valor
    // Se for array, junta tudo com OR conditions
    // Se for string única, busca por aquela em especifico
    if (categories && categories.length > 0){
        let condicoesCategoria = Array.isArray(categories)
        ? categories.map(category => `categoria.nomeCategoria = '${category}'`).join(' OR ')
        : `categoria.nomeCategoria = '${categories}'`;

        currentRequest += `AND (${condicoesCategoria})`
    }

    // Mesmo comportamento anterior, só que para genero
    if (genres && genres.length > 0){
        let condicoesGenero = Array.isArray(genres)
        ? genres.map(genre => `genero.nomeGenero = '${genre}'`).join(' OR ')
        : `genero.nomeGenero = '${genres}'`;

        currentRequest += `AND (${condicoesGenero})`
    }

    // Busca por nome similar de jogo e aplica paginação
    currentRequest += (name !== "" ? " AND nomeJogo LIKE '%" + name + "%'" : "")
    currentRequest += `LIMIT ${pageSize} OFFSET ${offset};`

    // Realiza a query, retornando o resultado ou erro 500
    pool.query(
        currentRequest, 
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            } else {
                res.json(results);
            }
        }
    );
});

// Define a route to add data to the database
router.post('/api/data', (req, res) => {
  // Assuming you have data in the request body
  const newData = req.body;

  pool.query('INSERT INTO your_table_name SET ?', newData, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(201).send('Data added successfully');
    }
  });
});

module.exports = {
    router
};