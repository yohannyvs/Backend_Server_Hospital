//  Require - Importacion de librerias
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Importar rutas
appRoutes = require("./routes/app");
usuarioRoutes = require("./routes/usuario");
loginRoutes = require("./routes/login");

// Conexion a Mongo
mongoose.connection.openUri("mongodb://localhost:27017/hospitalDB", { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;

    console.log("HospitalDB: \x1b[32m%s\x1b[0m", "online");
});

/* Rutas */
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => { console.log("Express server - puerto 3000: \x1b[32m%s\x1b[0m", "online"); });