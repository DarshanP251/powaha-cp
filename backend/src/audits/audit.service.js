const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'audit.log');

function ensureLogDir() {
	try {
		if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
	} catch (e) {
		console.error('Failed to ensure log dir', e);
	}
}

async function record(action, meta = {}) {
	try {
		ensureLogDir();
		const entry = {
			ts: new Date().toISOString(),
			action,
			meta
		};
		fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
	} catch (err) {
		console.error('AUDIT RECORD ERROR:', err);
	}
}

module.exports = {
	record
};
