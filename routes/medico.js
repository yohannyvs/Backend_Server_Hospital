var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion').verificaToken;

var app = express();

var Medico = require('../models/medico');

// Get - Obtener todos los medicos
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medico) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            Medico.countDocuments({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    total: conteo,
                    medico: medico
                });

            });

        });
});

// Put - Actualizar Medico
app.put('/:id', mdAutenticacion, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: `El medico con el ${id} no existe`,
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        if (!medico) {
            if (errr) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medico
            });

        });

    });

});

// Post - Crear nuevo Medico
app.post('/', mdAutenticacion, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoGuardado
        });

    });
});

// Delete - Borrar Medico
app.delete('/:id', mdAutenticacion, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            if (errr) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un medico con ese id',
                    errors: { message: 'No existe un medico con ese id' }
                });
            }
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});

module.exports = app;