var express = require('express');
var app = express();
var fs = require('fs');

// Modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Carga de Archivos
var fileUpload = require('express-fileupload');

// default options
app.use(fileUpload());

// 
app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos Validos
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La colección no es valida',
            error: { message: 'La colección no es valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            error: { message: 'Debe de seleccionar un archivo' }
        });
    }

    // Obtener Archivo
    var archivo = req.files.imagen;
    var nombreDividido = archivo.name.split('.');
    var extencion_arch = nombreDividido[nombreDividido.length - 1];

    // Extenciones Permitidas
    var extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extencionesValidas.indexOf(extencion_arch) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Extención no valida',
            error: { message: 'Las extenciones validas son ' + extencionesValidas.join(', ') }
        });

    }

    // nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extencion_arch }`;

    // Mover Archivo temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                error: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === "usuarios") {

        Usuario.findById(id, 'nombre email img role')
            .exec((err, usuario) => {

                if (!usuario) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Usuario no existe',
                        error: { message: 'Usuario no existe' }
                    });
                }

                var pathViejo = `./uploads/usuarios/${usuario.img}`;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }

                usuario.img = nombreArchivo;

                usuario.save((err, usuarioActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });
                });

            });
    }

    if (tipo === "medicos") {

        Medico.findById(id)
            .exec((err, medico) => {

                if (!medico) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Medico no existe',
                        error: { message: 'Medico no existe' }
                    });
                }

                var pathViejo = `./uploads/medicos/${medico.img}`;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }

                medico.img = nombreArchivo;

                medico.save((err, medicoActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoActualizado
                    });
                });

            });
    }

    if (tipo === "hospitales") {

        Hospital.findById(id)
            .exec((err, hospital) => {

                if (!hospital) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Hospital no existe',
                        error: { message: 'Hospital no existe' }
                    });
                }

                var pathViejo = `./uploads/hospitales/${hospital.img}`;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }

                hospital.img = nombreArchivo;

                hospital.save((err, hospitalActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                    });
                });

            });

    }
}

module.exports = app;