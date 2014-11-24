// http://thewayofcode.wordpress.com/2013/04/21/how-to-build-and-test-rest-api-with-nodejs-express-mocha/
// http://strongloop.com/strongblog/how-to-test-an-api-with-node-js/
// https://github.com/tj/supertest

'use strict';

var should = require('should');
var supertest = require('supertest');

var app = require('../../server/server.js');

var agent = supertest.agent(app);


describe('API - Users', function () {

	var admin = null;
	var adminCredentials = {
		email: 'root',
		password: 'root'
	};
	
	it('should respond with 401 to unauthed calls', function (done) {
		agent
			.get('/api/users')
			.expect(401)
			.end(function (err, res) {
				should.not.exist(err);
				should.not.exist(res.body.data);
				should.exist(res.body.error);
				should.exist(res.body.error.message);
				done();
			});
	});

	it('authenticating agent as admin', function (done) {
		agent
			.post('/api/auth/login')
			.send(adminCredentials)
			.expect(200)
			.end(function (err, res) {
				should.not.exist(err);
				should.exist(res.body.data);
				should.exist(res.body.data.user);
				// save admin for later
				admin = res.body.data.user;
				done();
			});
	});

	/**
	 * Authenticated tests
	 */
	
	var newUser = null;
	var newUserData = {
		name: 'Test user',
		email: 'test@test.net',
		password: 'testestest'
	};
	
	it('should return all users', function (done) {
		agent
			.get('/api/users/')
			.expect(200)
			.end(function (err, res) {
				should.not.exist(err);
				should.exist(res.body.data);
				should.exist(res.body.data.users);
				should.exist(res.body.data.users.length);
				done();
			});
	});

	it('should create new user', function (done) {
		agent
			.post('/api/users/')
			.send(newUserData)
			.expect(200)
			.end(function (err, res) {
				should.not.exist(err);
				should.exist(res.body.data);
				should.exist(res.body.data.user);
				var resUser = res.body.data.user;
				resUser.should.have.property('id');
				resUser.name.should.equal(newUserData.name);
				resUser.email.should.equal(newUserData.email);
				resUser.should.not.have.property('password');
				// save user for later
				newUser = resUser;
				done();
			});
	});

	it('should read new user', function (done) {
		agent
			.get('/api/users/' + newUser.id)
			.expect(200)
			.end(function (err, res) {
				should.not.exist(err);
				should.exist(res.body.data);
				should.exist(res.body.data.user);
				var resUser = res.body.data.user;
				resUser.id.should.equal(newUser.id);
				resUser.name.should.equal(newUser.name);
				resUser.email.should.equal(newUser.email);
				resUser.should.not.have.property('password');
				done();
			});
	});

	it('should update new user', function (done) {
		newUser.name = 'Updated name';
		agent
			.put('/api/users/' + newUser.id)
			.send(newUser)
			.expect(200)
			.end(function (err, res) {
				should.not.exist(err);
				should.exist(res.body.data);
				should.exist(res.body.data.user);
				var resUser = res.body.data.user;
				resUser.id.should.equal(newUser.id);
				resUser.name.should.equal(newUser.name);
				resUser.email.should.equal(newUser.email);
				resUser.should.not.have.property('password');
				done();
			});
	});

	it('should delete new user', function (done) {
		agent
			.delete('/api/users/' + newUser.id)
			.send(newUser)
			.expect(200)
			.end(function (err, res) {
				should.not.exist(err);
				should.exist(res.body.data);
				should.exist(res.body.data.user);
				var resUser = res.body.data.user;
				resUser.id.should.equal(newUser.id);
				resUser.name.should.equal(newUser.name);
				resUser.email.should.equal(newUser.email);
				resUser.should.not.have.property('password');
				done();
			});
	});

	it('should not read new user', function (done) {
		agent
			.get('/api/users/' + newUser.id)
			.expect(404)
			.end(function (err, res) {
				should.not.exist(err);
				should.not.exist(res.body.data);
				should.exist(res.body.error);
				should.exist(res.body.error.message);
				done();
			});
	});

});