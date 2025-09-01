export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      code: 'DUPLICATE_ERROR',
      message: 'Resource already exists',
      details: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Invalid token',
      details: err.message
    });
  }

  // Default error
  res.status(err.status || 500).json({
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Internal server error',
    details: err.details || 'An unexpected error occurred'
  });
};
