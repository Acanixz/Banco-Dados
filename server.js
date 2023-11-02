const express = require('express')
const app = express();

const website = require('./src/routes/website');
const dbAPI = require('./src/routes/database');

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.set('views', 'src');
app.set('view engine', 'ejs');

// Conexão das rotas ao servidor aplicativo express
app.use(website.router);