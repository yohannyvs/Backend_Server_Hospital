//  Require - Importacion de librerias
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// Configuraciones
var mongo_url = require('./config/config').mongo_url;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Importar rutas
appRoutes = require("./routes/app");
usuarioRoutes = require("./routes/usuario");
medicoRoutes = require("./routes/medico");
busquedaRoutes = require('./routes/busqueda');
hospitalRoutes = require("./routes/hospital");
uploadRoutes = require("./routes/upload");
imagenesRoutes = require("./routes/imagenes");
loginRoutes = require("./routes/login");

// Conexion a Mongo
mongoose.connection.openUri(mongo_url, { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;

    console.log("HospitalDB: \x1b[32m%s\x1b[0m", "online");
});

/* Rutas */
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => { console.log("Express server - puerto 3000: \x1b[32m%s\x1b[0m", "online"); });