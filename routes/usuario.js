var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion').verificaToken;

var app = express();

var Usuario = require("../models/usuario");

// Get - Obtener todos los Usuarios
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Usuarios',
                        errors: err
                    });
                }

                Usuario.countDocuments({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        usuarios: usuarios
                    });

                });


            }
        );
});

// Put - Actualizar Usuario
app.put('/:id', mdAutenticacion, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, 'nombre email img role')
        .exec((err, usuario) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: `El usuario con el id ${id} no existe`,
                    errors: { message: 'No existe un usuario con ese ID' }
                });
            }

            if (!usuario) {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar usuario',
                        errors: err
                    });
                }
            }

            usuario.nombre = body.nombre;
            usuario.email = body.email;
            usuario.role = body.role;

            usuario.save((err, usuarioGuardado) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarioGuardado
                });

            });

        });

});

// Post - Crear nuevo Usuario
app.post('/', mdAutenticacion, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });
});

// Delete - Borrar Usuario
app.delete('/:id', mdAutenticacion, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: "No existe un usuario con ese id" }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;