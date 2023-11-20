const express = require('express')
const app = express();

const website = require('./src/routes/website');
const dbAPI = require('./src/routes/database');

const PORT = 3000

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
});

// Define 'views' para começar pela pasta src
app.set('views', 'src');

// Troca o caminho da pasta public (contém imagens, css, etc)
// para src/public
app.use(express.static(__dirname + '/public'));
app.use(express.static('src/public'));

// Define a engine de renderização para .ejs
app.set('view engine', 'ejs');

// Permite o uso de .json e a pasta public
app.use(express.json());
app.use(express.static('public'));

// Conexão das rotas ao servidor aplicativo express
// OBS: website deve ser o ultimo router posicionado
//      pois nele contém os erros 404 e 405 no fim,
//      após ele, tudo irá cair em uma das duas condições.
app.use(dbAPI.router);
app.use(website.router);