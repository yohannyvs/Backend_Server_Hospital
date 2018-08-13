var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

var app = express();

var Usuario = require("../models/usuario");

// Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

// Autenticación por Google
app.post('/google', async(req, res) => {

    var token = req.body.token;
    var google_user = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });

    Usuario.findOne({ email: google_user.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'
                });
            } else {
                // Crear un token
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // Expira 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // El usuario no existe.. Crear usuario
            var usuario = new Usuario();

            usuario.nombre = google_user.nombre;
            usuario.email = google_user.email;
            usuario.img = google_user.img;
            usuario.google = true;
            usuario.password = '-';

            usuario.save((err, usuarioDB) => {
                // Crear un token
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // Expira 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            });

        }


    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK!!!',
    //     google_user: google_user
    // });
});

// Autenticación Normal
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        usuarioDB.password = '';

        // Crear un token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // Expira 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });

});


module.exports = app;