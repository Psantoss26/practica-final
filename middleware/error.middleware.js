// middleware/error.middleware.js

module.exports = (err, req, res, next) => {
    console.error('❌ Error capturado:', err)
  
    const statusCode = err.statusCode || 500
    const message = err.message || 'Error interno del servidor'
  
    res.status(statusCode).json({
      error: message
    })
  }
  