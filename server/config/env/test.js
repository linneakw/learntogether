'use strict';

var fs = require('fs');

module.exports = {
	domain: "menrva.io",
	http_port: process.env.HTTP_PORT || 3000,
	https_port: process.env.HTTPS_PORT || 4000,
	private_key: fs.readFileSync(__dirname + '/ssl/test-key.pem', 'utf-8'),
	public_cert: fs.readFileSync(__dirname + '/ssl/test-cert.pem', 'utf-8'),
	db: {
		database: "learntogether",
		username: "root",
		password: "root",
		host: process.env.CONTAINER_IP,
		dialect: "postgres",
		protocol: "postgres",
		port: 5432,
		pool: {
			maxConnections: 1,
			maxIdleTime: 30
		}
	}
};