const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());

// Set secure HTTP headers
app.use(helmet());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Rate limiting - 100 requests per 10 minutes per IP
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Custom middleware: Prevent NoSQL injection by stripping keys starting with '$'
const sanitizeObject = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else {
        sanitizeObject(obj[key]);
      }
    }
  }
};
app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  next();
});

// Custom middleware: Sanitize string fields in body against XSS
const sanitizeXSS = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitizeXSS(obj[key]);
    }
  }
};
app.use((req, res, next) => {
  if (req.body) sanitizeXSS(req.body);
  next();
});

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Route files
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/goalsheets', require('./routes/goalsheets'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/checkins', require('./routes/checkins'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
