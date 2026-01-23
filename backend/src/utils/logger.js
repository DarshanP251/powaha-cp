const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const APP_LOG = path.join(LOG_DIR, 'app.log');

function ensureLogDir() {
	try {
		if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
	} catch (e) {
		console.error('Failed to ensure log dir', e);
	}
}

function write(level, ...args) {
	ensureLogDir();
	const entry = { ts: new Date().toISOString(), level, msg: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') };
	try {
		fs.appendFileSync(APP_LOG, JSON.stringify(entry) + '\n');
	} catch (e) {
		// no-op
	}
}

function info(...args) {
	console.log(...args);
	write('info', ...args);
}

function error(...args) {
	console.error(...args);
	write('error', ...args);
}

module.exports = {
	info,
	error
};
