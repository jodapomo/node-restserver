const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;


    // Valida tipo
    let tiposValidos = ['productos', 'usuarios'];

    if( tiposValidos.indexOf( tipo ) < 0 ) {
        return res.status(400).json({
            ok: true,
            err: {
                message: 'Los tipos permitidos son: ' + tiposValidos.join(', '),
            }
        });
    }

    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({
            ok: true,
            err: {
                message: 'No files were uploaded.'
            }
        });
    }
  
    let archivo = req.files.archivo;

    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[ nombreCortado.length - 1 ];
    
    // Extensiones permitidas
    let extenseionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if ( extenseionesValidas.indexOf( extension ) < 0 ) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son: ' + extenseionesValidas.join(', '),
                ext: extension
            }
        });
    }

    // Cambiar nombre al archivo
    let nombreArchivo = `${ id }-${ Math.round( Number( new Date().getMilliseconds() ) * Math.random() ) }.${ extension }`

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${ tipo }/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Aquí imagen cargada
        if ( tipo === 'usuarios' ) {

            imagenUsuario(id, res, nombreArchivo);

        } else {

            imagenProducto(id, res, nombreArchivo);
            
        }
    });

});

function imagenUsuario(id, res, nombreArchivo) {
    
    Usuario.findById(id, (err, usuarioDB) =>{
       
        if (err) {

            borraArchivo( nombreArchivo, 'usuarios' );

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !usuarioDB ) {

            borraArchivo( nombreArchivo, 'usuarios' );

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borraArchivo( usuarioDB.img, 'usuarios' );

        usuarioDB.img = nombreArchivo;

        usuarioDB.save( (err, usuarioGuardado) =>{
            
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        });
    });
}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) =>{
       
        if (err) {

            borraArchivo( nombreArchivo, 'productos' );

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !productoDB ) {

            borraArchivo( nombreArchivo, 'productos' );

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        borraArchivo( productoDB.img, 'productos' );

        productoDB.img = nombreArchivo;

        productoDB.save( (err, productoGuardado) =>{
            
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        });
    });
}

function borraArchivo(nombreImagen, tipo) {
    
    let pathImagen = path.resolve( __dirname, `../../uploads/${ tipo }/${ nombreImagen }`);

    if( fs.existsSync(pathImagen) ) {

        fs.unlinkSync(pathImagen);

    }

}

module.exports = app;