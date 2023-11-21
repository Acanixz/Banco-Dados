// Página responsável por responder aos pedidos da pagina web
const express = require('express');
const router = express.Router();

// Responde ao GET /
router.get('/', (req, res) => {
    res.status(200).render('website/pages/index')
})

router.get('/search', (req, res) => {
    res.status(200).render('website/pages/search')
})

router.get('/insert', (req,res) => {
    res.status(200).render('website/pages/insert')
})

router.get('/update', (req, res) => {
    res.status(200).render('website/pages/update')
})

router.get('/delete', (req, res) => {
    res.status(200).render('website/pages/delete')
})

router.get('/games/:id', (req, res) => {
    res.status(200).render('website/pages/gamePage')
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