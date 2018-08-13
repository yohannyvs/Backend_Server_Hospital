var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion').verificaToken;

var app = express();

var Hospital = require('../models/hospital');

// Get - Obtener todos los hospitales
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospital) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando Hospitales',
                    errors: err
                });
            }

            Hospital.countDocuments({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    total: conteo,
                    hospital: hospital
                });

            });

        });
});

// Put - Actualizar Hospital
app.put('/:id', mdAutenticacion, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: `El hospital con el ${id} no existe`,
                errors: { message: 'No existe un hospital con es ID' }
            });
        }

        if (!hospital) {
            if (errr) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospital
            });

        });

    });

});

// Post - Crear nuevo Hospital
app.post('/', mdAutenticacion, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });
});

// Delete - Borrar Hospital
app.delete('/:id', mdAutenticacion, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            if (errr) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un hospital con ese id',
                    errors: { message: 'No existe un hospital con ese id' }
                });
            }
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});

module.exports = app;