var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Verificar Token

exports.verificaToken = function(req, res, next) {

    // Token requerido por URL = localhost:3000/usuario?token=token_generado
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token invalido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });

};