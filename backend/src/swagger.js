const swaggerUi = require('swagger-ui-express');

const spec = {
  openapi: '3.0.0',
  info: { title: 'HRMS Lite API', version: '1.0.0', description: 'Employee and Attendance APIs' },
  servers: [{ url: '/api', description: 'API base' }],
  paths: {
    '/employees': {
      get: {
        summary: 'List employees',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }],
        responses: { 200: { description: 'List of employees' } },
      },
      post: {
        summary: 'Create employee',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['full_name', 'email', 'department'], properties: { full_name: { type: 'string' }, email: { type: 'string', format: 'email' }, department: { type: 'string' } } } } } },
        responses: { 201: { description: 'Created' }, 400: { description: 'Validation error' }, 409: { description: 'Email exists' } },
      },
    },
    '/employees/{id}': {
      get: { summary: 'Get employee', parameters: [{ name: 'id', in: 'path', required: true }], responses: { 200: {}, 404: {} } },
      put: { summary: 'Update employee', parameters: [{ name: 'id', in: 'path', required: true }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { full_name: { type: 'string' }, email: { type: 'string' }, department: { type: 'string' } } } } } }, responses: { 200: {}, 400: {}, 404: {}, 409: {} } },
      delete: { summary: 'Delete employee', parameters: [{ name: 'id', in: 'path', required: true }], responses: { 204: {}, 404: {} } },
    },
    '/attendance': {
      post: {
        summary: 'Mark attendance',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['employee_id', 'date', 'status'], properties: { employee_id: { type: 'string' }, date: { type: 'string', format: 'date' }, status: { type: 'string', enum: ['Present', 'Absent'] } } } } } },
        responses: { 201: {}, 400: {}, 404: {}, 409: {} },
      },
    },
    '/attendance/{employee_id}': {
      get: {
        summary: 'Get attendance by employee',
        parameters: [{ name: 'employee_id', in: 'path', required: true }, { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } }, { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } }],
        responses: { 200: {}, 404: {} },
      },
    },
  },
};

module.exports = { swaggerUi, spec };
