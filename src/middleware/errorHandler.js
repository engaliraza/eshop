const { ValidationError, DatabaseError, ConnectionError } = require('sequelize');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

// Handle Sequelize validation errors
const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map(error => ({
    field: error.path,
    message: error.message,
    value: error.value
  }));

  return new BadRequestError('Validation failed', { errors });
};

// Handle Sequelize database errors
const handleSequelizeDatabaseError = (err) => {
  console.error('Database error:', err);
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return new ConflictError(`${field} already exists`);
  }
  
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return new BadRequestError('Invalid reference to related resource');
  }
  
  return new AppError('Database operation failed', 500);
};

// Handle JWT errors
const handleJWTError = () => new UnauthorizedError('Invalid token');
const handleJWTExpiredError = () => new UnauthorizedError('Token expired');

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    });
  }
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err instanceof ValidationError) {
      error = handleSequelizeValidationError(err);
    } else if (err instanceof DatabaseError || err instanceof ConnectionError) {
      error = handleSequelizeDatabaseError(err);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    } else if (err.name === 'MulterError') {
      if (err.code === 'LIMIT_FILE_SIZE') {
        error = new BadRequestError('File too large');
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error = new BadRequestError('Unexpected file field');
      } else {
        error = new BadRequestError('File upload error');
      }
    }

    sendErrorProd(error, res);
  }
};

// Catch async errors
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Handle 404 errors
const notFound = (req, res, next) => {
  const err = new NotFoundError(`Can't find ${req.originalUrl} on this server!`);
  next(err);
};

module.exports = {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  globalErrorHandler,
  catchAsync,
  notFound
};
