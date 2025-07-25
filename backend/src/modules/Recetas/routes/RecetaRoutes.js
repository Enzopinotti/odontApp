const express = require('express');
const router = express.Router();

//controladores 
const{
    listarRecetas,
    crearReceta,
    getReceta,
    eliminarReceta,
    actualizarReceta
}= require('../controllers/recetaController');


// GET /recetas para listar recetas
router.get('/',listarRecetas);
// POST /recetas para crear una nueva receta
router.post('/', crearReceta);
// GET /recetas/:id para obtener una receta específica
router.get('/:id', getReceta);
//DELETE /recetas/:id para eliminar una receta
router.delete('/:id', eliminarReceta);
// PUT /recetas/:id para actualizar una receta
router.put('/:id', actualizarReceta);


//GET /recetas/:id/pdf para generar receta en PDF
router.get('/:id/pdf', generarRecetaPDF);
//POST /recetas/:id/enviar para enviar receta mail o whatsapp
router.post('/:id/enviar', enviarReceta);


router.use('/:id/medicamentoRecetados', require('./medicamentoRecetadosRoutes'));

module.exports = router;