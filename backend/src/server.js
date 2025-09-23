const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./utils/database');
const { globalErrorHandler } = require('./middleware/error.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');
const agenciesRoutes = require('./routes/agencies.routes');
const userRoutes = require('./routes/users.routes');
const offerLetterRoutes = require('./routes/offer-letters.routes');
const paymentScheduleItemRoutes = require('./routes/payment-schedule-items.routes');
const billingTransactionRoutes = require('./routes/billing-transactions.routes');
const billingEventHistoryRoutes = require('./routes/billing-event-histories.routes');
const superadminRoutes = require('./routes/superadmin.routes');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/agencies', agenciesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/offer-letters', offerLetterRoutes);
app.use('/api/payment-schedule-items', paymentScheduleItemRoutes);
app.use('/api/billing-transactions', billingTransactionRoutes);
app.use('/api/billing-event-histories', billingEventHistoryRoutes);
app.use('/api/superadmin', superadminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});