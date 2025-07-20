const request = require('supertest');
const { app } = require('../server');
const dbo = require('../db/conn');

// Mock the database connection
jest.mock('../db/conn', () => ({
  getDb: jest.fn(),
  connectToServer: jest.fn(callback => callback())
}));

describe('Products API', () => {
  // Setup mock database responses before tests
  beforeAll(() => {
    // Mock database for deals endpoint
    const mockDealsCollection = {
      find: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn((callback) => {
        callback(null, [
          { id: '1', title: 'Test Deal', description: 'This is a test deal' }
        ]);
      })
    };

    // Mock database for product by SKU endpoint
    const mockProductsCollection = {
      findOne: jest.fn((query, callback) => {
        if (query['variants.sku'] === 'TEST-SKU-123') {
          callback(null, {
            id: 'product-1',
            name: 'Test Product',
            variants: [{ sku: 'TEST-SKU-123', price: 9.99 }]
          });
        } else {
          callback(null, null);
        }
      })
    };

    // Set up mock implementation for getDb
    dbo.getDb.mockImplementation(() => ({
      collection: (collectionName) => {
        if (collectionName === 'deals') {
          return mockDealsCollection;
        }
        if (collectionName === 'products') {
          return mockProductsCollection;
        }
        return null;
      }
    }));
  });

  // Test the /deals endpoint
  test('GET /deals should return deals list', async () => {
    const response = await request(app).get('/deals');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe('Test Deal');
  });

  // Test the /products/sku/:id endpoint with a valid SKU
  test('GET /products/sku/:id with valid SKU should return a product', async () => {
    const response = await request(app).get('/products/sku/TEST-SKU-123');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('name', 'Test Product');
    expect(response.body.variants[0].sku).toBe('TEST-SKU-123');
  });

  // Basic health check test
  test('API server should be healthy', async () => {
    // This test just verifies that the app exists and can handle requests
    expect(app).toBeDefined();
  });
});