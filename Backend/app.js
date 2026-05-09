// Express app setup: middleware, routes, error handler.
// Kept separate from server.js so it can be imported in tests.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const bookRoutes = require('./routes/book.routes');
const authorRoutes = require('./routes/author.routes');
const categoryRoutes = require('./routes/category.routes');
const transactionRoutes = require('./routes/transaction.routes');
const reservationRoutes = require('./routes/reservation.routes');
const fineRoutes = require('./routes/fine.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Security & infra middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Basic rate limit on auth endpoints (mitigates brute-force)
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));

// --- Health check ---
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// --- API routes (RESTful) ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Centralized error handler (must be LAST)
app.use(errorHandler);

module.exports = app;
