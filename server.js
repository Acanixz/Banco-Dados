const express = require('express')
const app = express();

const website = require('./src/routes/website');
const dbAPI = require('./src/routes/database');

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Pedidos da pagina web
app.get('/', website.W_readMain);

// Pedidos do banco de dados mySQL