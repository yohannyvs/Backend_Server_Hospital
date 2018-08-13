var express = require('express');
var app = express();

// Modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Get - Busca Coleccion
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regexp = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {

        case 'usuario':
            promesa = buscarUsuarios(regexp);
            break;

        case 'medico':
            promesa = buscarMedicos(regexp);
            break;

        case 'hospital':
            promesa = buscarHospitales(regexp);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: "Error en el tipo de busqueda",
                error: { messege: 'Tipo de Colección no valida' }
            });
    }

    promesa.then(data => {

        res.status(200).json({
            ok: true,
            [tabla]: data
        });

    });
});

// Get - Busqueda General
app.get('/todo/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var regexp = new RegExp(busqueda, 'i');

    Promise.all([

        buscarHospitales(regexp),
        buscarMedicos(regexp),
        buscarUsuarios(regexp)

    ]).then(respuesta => {

        res.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2]
        });

    });

});

function buscarHospitales(regexp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regexp })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }

            });
    });
}

function buscarMedicos(regexp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regexp })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }

            });
    });
}

function buscarUsuarios(regexp) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ nombre: regexp }, { email: regexp }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }

            });
    });
}


module.exports = app;