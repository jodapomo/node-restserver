const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

const Producto = require('../models/producto');

const app = express();

// ==============================
// Obtener todos los productos
// ==============================
app.get('/productos', verificaToken, (req, res) =>{

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec( (err, productos) => {
            
            if( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            });
        }) 
});


// ==============================
// Obtener un producto por ID
// ==============================
app.get('/productos/:id', verificaToken, (req, res) =>{

    let id = req.params.id;
    
    Producto.findById( id )
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec( (err, productoDB) =>{
            if( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if( !productoDB ) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'El ID no es correcto'
                    }
                })
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });

});

// ==============================
// Buscar productos
// ==============================
app.get('/productos/buscar/:termino', verificaToken, (req, res) =>{

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec( (err, productos) => {
            
            if( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            });
        });
});


// ==============================
// Crear un producto
// ==============================
app.post('/productos', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        nombre: body.nombre
    });

    producto.save( (err, productoDB) => {
        
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });

});


// ==============================
// Actualizar un producto
// ==============================
app.put('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if( !productoDB ) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            })
        }

        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;
        productoDB.nombre = body.nombre;

        productoDB.save( (err, productoGuardado) => {
        
            if( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
    
            res.status(201).json({
                ok: true,
                producto: productoGuardado
            });
        });
    });
});

// ==============================
// Borrar un producto
// ==============================
app.delete('/productos/:id', verificaToken, (req, res) => {
    
    let id = req.params.id;

    Producto.findById( id, (err, productoDB) => {
        
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if(!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            })
        }

        productoDB.disponible = false;

        productoDB.save( (err, productoBorrado) => {

            if( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productoBorrado,
                message: `Producto ${ productoBorrado.nombre } borrado`
            });

        });



    });

});



module.exports = app;