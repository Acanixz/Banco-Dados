// Página responsável por responder aos pedidos da pagina web
// todos os métodos começam com W_

// Responde a GET /
const W_readMain = (req,res) => {
    res.status(200);
    res.send("<p>Response received!</p>")
    console.log("Accepted a request, nice!")
}

module.exports = {W_readMain};