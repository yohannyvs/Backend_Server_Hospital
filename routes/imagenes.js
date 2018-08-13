var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

// Get
app.get('/:tipo/:img', (req, res) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    // Tipos Validos
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La colección no es valida',
            error: { message: 'La colección no es valida' }
        });
    }

    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }

});

module.exports = app;