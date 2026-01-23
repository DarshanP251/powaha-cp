const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const EMAIL_LOG = path.join(LOG_DIR, 'email.log');

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to ensure log dir', e);
  }
}

async function sendPasswordEmail(to, password) {
  // Simple stub for sending password emails in dev.
  ensureLogDir();
  const entry = {
    ts: new Date().toISOString(),
    to,
    subject: 'Your CP account has been created',
    body: `Your temporary password is: ${password}. Please change it after first login.`
  };

  try {
    fs.appendFileSync(EMAIL_LOG, JSON.stringify(entry) + '\n');
    console.log('Email stub logged for', to);
    return true;
  } catch (err) {
    console.error('Failed to write email log', err);
    throw err;
  }
}

module.exports = {
  sendPasswordEmail
};
