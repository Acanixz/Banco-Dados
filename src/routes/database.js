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
        id = "", // ID do jogo
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

    if (id != ""){
      currentRequest += `AND (idJogo = ${id})`;
    }
    // Se há categorias, verifica se é um array ou um único valor
    // Se for array, junta tudo com OR conditions
    // Se for string única, busca por aquela em especifico
    if (categories && categories.length > 0){
        let condicoesCategoria = Array.isArray(categories)
        ? categories.map(category => `categoria.nomeCategoria = '${category}'`).join(' AND ')
        : `categoria.nomeCategoria = '${categories}'`;

        currentRequest += `AND (${condicoesCategoria})`
    }

    // Mesmo comportamento anterior, só que para genero
    if (genres && genres.length > 0){
        let condicoesGenero = Array.isArray(genres)
        ? genres.map(genre => `genero.nomeGenero = '${genre}'`).join(' AND ')
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

router.get('/api/data/:id', (req, res) => {
  const appID = req.params.id;

  pool.query(`SELECT 
  idJogo,
  nomeJogo,
  dataLancamento,
  faixaEtaria,
  preco,
  descricao,
  metacritic,
  quantReviews,
  quantRecomendacoes,
  Windows,
  Linux,
  macOS,
  numProprietariosSteam,
  aproxJogadoresTotais,
  quantDLCs,
  quantDemos,
  quantConquistas
FROM
  steamdb.jogo
      INNER JOIN
  avaliacao ON (jogo.Avaliacao_idAvaliacao = avaliacao.idAvaliacao)
      INNER JOIN
  plataforma ON (jogo.Plataforma_idPlataforma = plataforma.idPlataforma)
      INNER JOIN
  distribuicao ON (jogo.Distribuicao_idDistribuicao = distribuicao.idDistribuicao)
      INNER JOIN
  recurso ON (jogo.Recurso_idRecurso = recurso.idRecurso)
  WHERE idJogo = ?`, appID, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }
    res.status(200).json(results);
  })
})

router.get('/api/data/:id/categories', (req, res) => {
  const appID = req.params.id;

  pool.query(`SELECT
  nomeCategoria
FROM
  steamdb.jogo
      LEFT JOIN
  jogo_has_categoria ON (jogo.idJogo = jogo_has_categoria.Jogo_idJogo)
      LEFT JOIN
  categoria ON (jogo_has_categoria.Categoria_idCategoria = categoria.idCategoria)
  WHERE idJogo = ?`, appID, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }
    res.status(200).json(results);
  })
})

router.get('/api/data/:id/genres', (req, res) => {
  const appID = req.params.id;

  pool.query(`SELECT 
  nomeGenero
FROM
  steamdb.jogo
      LEFT JOIN
  jogo_has_genero ON (jogo.idJogo = jogo_has_genero.Jogo_idJogo)
      LEFT JOIN
  genero ON (jogo_has_genero.Genero_idGenero = genero.idGenero)
  WHERE idJogo = ?`, appID, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }
    res.status(200).json(results);
  })
})

router.delete('/api/data/:id', (req, res) => {
  const appID = req.params.id;

  pool.query('DELETE FROM jogo_has_categoria WHERE Jogo_idJogo = ?;', appID, (error, results) =>{
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error'});
      return;
    }
    pool.query('DELETE FROM jogo_has_genero WHERE Jogo_idJogo = ?;', appID, (error, results) =>{
      if (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error'});
        return;
      }
      pool.query('DELETE FROM jogo_has_linguagem WHERE Jogo_idJogo = ?;', appID, (error, results) =>{
        if (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error'});
          return;
        }
        pool.query(`DELETE FROM steamdb.jogo
        WHERE idJogo = ?;`, appID, (error, results) => {
          if (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error'});
            return;
          }
          res.status(200).json({ message: 'Game deleted successfully'});
        })
      })
    })
  })
})

router.get('/api/languages', (req,res) => {
  pool.query('SELECT * FROM linguagem', (error, results) =>{
    if (error){
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results);
    }
  })
})

router.get('/api/genres', (req,res) => {
  pool.query('SELECT * FROM genero', (error, results) =>{
    if (error){
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results);
    }
  })
})

router.get('/api/categories', (req, res) => {
  pool.query('SELECT * FROM categoria', (error, results) =>{
    if (error){
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results);
    }
  })
})

// PUT request para database
router.put('/api/data/:id', (req, res) => {
  const appID = req.params.id;
  const appData = req.body;

  console.log(appID)
  console.log(appData)
  pool.query(`SELECT * FROM steamdb.jogo WHERE idJogo = ${appID}`, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }

    const promises = [];
    // App existente, request irá atualizar alvo
    if (results.length > 0) {
      // Atualiza informações principais
      if (appData.hasOwnProperty("main")){
        promises.push(pool.query(`UPDATE jogo SET ? WHERE idJogo = ?`, [appData.main, appID], (updateError) => {
          if (updateError) {
            console.error(updateError);
            failed = true;
          }
        }));
      }

      // Atualiza as avaliações
      if (appData.hasOwnProperty("avaliacao")){
        const updateValues = appData.avaliacao;
        const updateColumns = Object.keys(updateValues).map(column => `${column} = ?`).join(', ');

        const query = `UPDATE avaliacao SET ${updateColumns} WHERE avaliacao.idAvaliacao IN (SELECT jogo.avaliacao_idAvaliacao FROM jogo WHERE idJogo = ?);`;

        const values = [...Object.values(updateValues), parseInt(appID, 10)];

        promises.push(pool.query(query, values, (updateError) => {
            if (updateError) {
                console.error(updateError);
                failed = true;
            }
        }));
      }

      // Atualiza as plataformas suportadas
      if (appData.hasOwnProperty("plataforma")){
        const updateValues = appData.plataforma;
        const updateColumns = Object.keys(updateValues).map(column => `${column} = ?`).join(', ');

        const query = `UPDATE plataforma SET ${updateColumns} WHERE plataforma.idPlataforma IN (SELECT jogo.Plataforma_idPlataforma FROM jogo WHERE idJogo = ?);`;

        const values = [...Object.values(updateValues), parseInt(appID, 10)];

        promises.push(pool.query(query, values, (updateError) => {
            if (updateError) {
                console.error(updateError);
                failed = true;
            }
        }));
      }

      if (appData.hasOwnProperty("recurso")){
        const updateValues = appData.recurso;
        const updateColumns = Object.keys(updateValues).map(column => `${column} = ?`).join(', ');

        const query = `UPDATE recurso SET ${updateColumns} WHERE recurso.idRecurso IN (SELECT jogo.Recurso_idRecurso FROM jogo WHERE idJogo = ?);`;

        const values = [...Object.values(updateValues), parseInt(appID, 10)];

        promises.push(pool.query(query, values, (updateError) => {
            if (updateError) {
                console.error(updateError);
                failed = true;
            }
        }));
      }

      // Atualiza a categoria do jogo
      if (appData.hasOwnProperty("categoria")){
        // Adiciona
        if (appData.categoria.hasOwnProperty("ADD")){
          Object.values(appData.categoria.ADD).forEach(idCategoria => {
            const insertQuery = pool.query(
              'INSERT INTO jogo_has_categoria (Jogo_idJogo, Categoria_idCategoria) VALUES (?, ?)',
              [appID, idCategoria],
              (insertError) => {
                if (insertError) {
                  console.error(insertError);
                  failed = true;
                }
              }
            );
            promises.push(insertQuery);
          });
        }

        // Remove
        if (appData.categoria.hasOwnProperty("REMOVE")) {
          Object.values(appData.categoria.REMOVE).forEach(idCategoria => {
            const insertQuery = pool.query(
              'DELETE FROM jogo_has_categoria WHERE Jogo_idJogo = ? AND Categoria_idCategoria = ?',
              [appID, idCategoria],
              (insertError) => {
                if (insertError) {
                  console.error(insertError);
                  failed = true;
                }
              }
            );
            promises.push(insertQuery);
          });
        }
      }

      // Atualiza o genero do jogo
      if (appData.hasOwnProperty("genero")){
        // Adiciona
        if (appData.genero.hasOwnProperty("ADD")){
          Object.values(appData.genero.ADD).forEach(idGenero => {
            const insertQuery = pool.query(
              'INSERT INTO jogo_has_genero (Jogo_idJogo, Genero_idGenero) VALUES (?, ?)',
              [appID, idGenero],
              (insertError) => {
                if (insertError) {
                  console.error(insertError);
                  failed = true;
                }
              }
            );
            promises.push(insertQuery);
          });
        }

        // Remove
        if (appData.genero.hasOwnProperty("REMOVE")) {
          Object.values(appData.genero.REMOVE).forEach(idGenero => {
            const insertQuery = pool.query(
              'DELETE FROM jogo_has_genero WHERE Jogo_idJogo = ? AND Genero_idGenero = ?',
              [appID, idGenero],
              (insertError) => {
                if (insertError) {
                  console.error(insertError);
                  failed = true;
                }
              }
            );
            promises.push(insertQuery);
          });
        }
      }

      // Atualiza a linguagem do jogo
      if (appData.hasOwnProperty("linguagem")){
        // Adiciona
        if (appData.linguagem.hasOwnProperty("ADD")){
          Object.values(appData.linguagem.ADD).forEach(idLinguagem => {
            const insertQuery = pool.query(
              'INSERT INTO jogo_has_linguagem (Jogo_idJogo, Linguagem_idLinguagem) VALUES (?, ?)',
              [appID, idLinguagem],
              (insertError) => {
                if (insertError) {
                  console.error(insertError);
                  failed = true;
                }
              }
            );
            promises.push(insertQuery);
          });
        }

        // Remove
        if (appData.linguagem.hasOwnProperty("REMOVE")) {
          Object.values(appData.linguagem.REMOVE).forEach(idLinguagem => {
            const insertQuery = pool.query(
              'DELETE FROM jogo_has_linguagem WHERE Jogo_idJogo = ? AND Linguagem_idLinguagem = ?',
              [appID, idLinguagem],
              (insertError) => {
                if (insertError) {
                  console.error(insertError);
                  failed = true;
                }
              }
            );
            promises.push(insertQuery);
          });
        }
      }

      Promise.all(promises)
      .then(() => {
        // Todas as queries funcionaram
        res.status(200).json({ message: 'App updated successfully.' });
      })
      .catch((updateError) => {
        // Alguma query falhou!
        console.error(updateError);
        res.status(500).json({ message: 'Internal Server Error' });
      });
    } else { // App inexistente, request irá criar app
      const { metacritic = 0, quantReviews = 0, quantRecomendacoes = 0 } = appData.avaliacao;
      pool.query(`INSERT INTO avaliacao (metacritic, quantReviews, quantRecomendacoes) VALUES (${metacritic}, ${quantReviews}, ${quantRecomendacoes}) `, (insertError, results) => {
        if (insertError){
          console.log(insertError);
          res.status(500).json({ message: 'Could not create avaliação object' });
        } else {
          console.log(`avaliação com id ${results.insertId} criada com sucesso`);
          let avaliacaoID = results.insertId;

          if (avaliacaoID == -1){
            return;
          }
          const {Windows = 0, Linux = 0, macOS = 0} = appData.plataforma;
          pool.query(`INSERT INTO plataforma (Windows, Linux, macOS) VALUES (${Windows}, ${Linux}, ${macOS})`, (insertError, results) => {
            if (insertError){
              console.log(insertError);
              res.status(500).json({ message: 'Could not create plataforma object' });
            } else {
              console.log(`plataforma com id ${results.insertId} criada com sucesso`);
              let plataformaID = results.insertId;
    
              if (plataformaID == -1){
                return;
              }
              
              const {quantDLCs = 0, quantDemos = 0, quantConquistas = 0} = appData.recurso;
              pool.query(`INSERT INTO recurso (quantDLCs, quantDemos, quantConquistas) VALUES (${quantDLCs}, ${quantDemos}, ${quantConquistas})`, (insertError, results) => {
                if (insertError){
                  console.log(insertError);
                  res.status(500).json({ message: 'Could not create recurso object' });
                } else {
                  console.log(`recurso com id ${results.insertId} criado com sucesso`);
                  let recursoID = results.insertId;
        
                  if (recursoID == -1){
                    return;
                  }
                  
                  pool.query('INSERT INTO distribuicao (numProprietariosSteam, aproxJogadoresTotais) VALUES (0,0)', (insertError, results) => {
                    if (insertError){
                      console.log(insertError);
                      res.status(500).json({ message: 'Could not create distribuição object' });
                    } else {
                      console.log(`avaliação com id ${results.insertId} criada com sucesso`);
                      let distribuicaoID = results.insertId;
            
                      if (distribuicaoID == -1){
                        return;
                      }
                      
                      pool.query(`INSERT INTO jogo SET ? , Avaliacao_idAvaliacao = ${avaliacaoID}, Plataforma_idPlataforma = ${plataformaID}, Distribuicao_idDistribuicao = ${distribuicaoID}, Recurso_idRecurso = ${recursoID}`, appData.main, (insertError, results) => {
                        if (insertError) {
                          console.error(insertError);
                          res.status(500).json({ message: 'Internal Server Error' });
                        } else {
                          let createdAppID = results.insertId;
                          console.log(`App com id ${createdAppID} criado com sucesso`)
                          // Adiciona as categorias do jogo
                          if (appData.hasOwnProperty("categoria")){
                            // Adiciona
                            if (appData.categoria.hasOwnProperty("ADD")){
                              Object.values(appData.categoria.ADD).forEach(idCategoria => {
                                const insertQuery = pool.query(
                                  'INSERT INTO jogo_has_categoria (Jogo_idJogo, Categoria_idCategoria) VALUES (?, ?)',
                                  [createdAppID, idCategoria],
                                  (insertError) => {
                                    if (insertError) {
                                      console.error(insertError);
                                      failed = true;
                                    }
                                  }
                                );
                                promises.push(insertQuery);
                              });
                            }
                          }

                          // Adiciona os generos do jogo
                          if (appData.hasOwnProperty("genero")){
                            // Adiciona
                            if (appData.genero.hasOwnProperty("ADD")){
                              Object.values(appData.genero.ADD).forEach(idGenero => {
                                const insertQuery = pool.query(
                                  'INSERT INTO jogo_has_genero (Jogo_idJogo, Genero_idGenero) VALUES (?, ?)',
                                  [createdAppID, idGenero],
                                  (insertError) => {
                                    if (insertError) {
                                      console.error(insertError);
                                      failed = true;
                                    }
                                  }
                                );
                                promises.push(insertQuery);
                              });
                            }
                          }

                          // Adiciona as linguagens iniciais do jogo
                          if (appData.hasOwnProperty("linguagem")){
                            // Adiciona
                            if (appData.linguagem.hasOwnProperty("ADD")){
                              Object.values(appData.linguagem.ADD).forEach(idLinguagem => {
                                const insertQuery = pool.query(
                                  'INSERT INTO jogo_has_linguagem (Jogo_idJogo, Linguagem_idLinguagem) VALUES (?, ?)',
                                  [createdAppID, idLinguagem],
                                  (insertError) => {
                                    if (insertError) {
                                      console.error(insertError);
                                      failed = true;
                                    }
                                  }
                                );
                                promises.push(insertQuery);
                              });
                            }
                          }

                          Promise.all(promises)
                          .then(() => {
                            // Todas as queries funcionaram
                            res.status(201).json({ message: `App created successfully with ID: ${createdAppID}` });
                          })
                          .catch((updateError) => {
                            // Alguma query falhou!
                            console.error(updateError);
                            res.status(500).json({ message: 'Internal Server Error' });
                          });
                        }
                      });
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
})

module.exports = {
    router
};