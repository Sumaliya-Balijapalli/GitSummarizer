import { ZodError } from 'zod';

export function errorMiddleware(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed.', details: error.issues });
  console.error(error);
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error.' : error.message;
  res.status(500).json({ error: message });
}