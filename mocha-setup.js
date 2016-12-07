// Set up environment for Mocha tests

require('babel-register');

// Shim the global SiteSettings
global.SiteSettings = {
	endpoint: 'https://localhost/wp-json/',
	nonce: 'fake-nonce',
};
