// ==============================
// Puerto
// ==============================
process.env.PORT = process.env.PORT || 3000;

// ==============================
// Entorno
// ==============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// ==============================
// Vencimiento del token
// ==============================

process.env.CADUCIDAD_TOKEN = "30 days";

// ==============================
// SEED de autenticación
// ==============================

process.env.SEED = process.env.SEED || 'seed-dev';

// ==============================
// Base de datos
// ==============================

let urlDB;

if ( process.env.NODE_ENV === 'dev' ) {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB


// ==============================
// Google Client ID
// ==============================

process.env.CLIENT_ID = process.env.CLIENT_ID || "799523991458-5rt39vk3f9qjbn940o603vqndae6e3bp.apps.googleusercontent.com";

