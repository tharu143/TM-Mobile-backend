const serverless = require('serverless-http');
const app = require('../src/server');

module.exports.handler = serverless(app, {
    binary: ['image/*', 'multipart/form-data', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
});
