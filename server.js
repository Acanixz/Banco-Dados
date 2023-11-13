const express = require('express')
const app = express();

const website = require('./src/routes/website');
const dbAPI = require('./src/routes/database');

const PORT = 3000

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
});

app.set('views', 'src');
app.set('view engine', 'ejs');

// Conexão das rotas ao servidor aplicativo express
// OBS: website deve ser o ultimo router posicionado
//      pois nele contém os erros 404 e 405 no fim,
//      após ele, tudo irá cair em uma das duas condições.
app.use(dbAPI.router);
app.use(website.router);