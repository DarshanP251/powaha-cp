const express = require('express');
const cors = require('cors');

const auth = require('./middlewares/auth.middleware');

const app = express();
app.use(cors());
app.use(express.json());

// AUTH ROUTES (VERY IMPORTANT)
app.use('/auth', require('./modules/auth/auth.routes'));


// ADMIN ROUTES
app.use('/admin', auth(['ADMIN']), require('./modules/admin/admin.routes'));

// CP ROUTES
const cpRoutes = require('./modules/cp/cp.routes');

app.use('/cp', cpRoutes); // ✅ auth handled inside routes
;

// Health check
app.get('/', (req, res) => {
  res.send('POWAHA CP Backend Running');
});

module.exports = app;
