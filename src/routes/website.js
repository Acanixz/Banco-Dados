// Página responsável por responder aos pedidos da pagina web
const express = require('express');
const router = express.Router();

// Responde ao GET /
router.get('/', (req, res) => {
    res.status(200).render('website/pages/index')
})

// Responde a qualquer outra página não-existente
router.get('/*', (req, res) => {
    res.status(404).render('website/pages/404')
})

// Responde a qualquer outro pedido não programado
router.all('/*', (req, res) => {
    const requestMethod = req.method;
    res.status(405).render('website/pages/405', {requestMethod})
})

module.exports = {
    router
};