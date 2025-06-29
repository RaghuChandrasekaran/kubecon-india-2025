const express = require('express');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;
const elasticUrl = process.env.ELASTIC_URL || 'http://localhost:9200';

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Elasticsearch client
const client = new Client({ node: elasticUrl });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Search Service',
    timestamp: new Date().toISOString(),
    elasticsearch: elasticUrl
  });
});

// Search products endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, limit = 10, offset = 0 } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query parameter is required',
        example: '/api/search?query=laptop'
      });
    }

    // Build Elasticsearch query
    const searchQuery = {
      index: 'products',
      body: {
        from: parseInt(offset),
        size: parseInt(limit),
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query,
                  fields: ['title^2', 'description', 'category'],
                  fuzziness: 'AUTO'
                }
              }
            ],
            filter: []
          }
        },
        highlight: {
          fields: {
            title: {},
            description: {}
          }
        }
      }
    };

    // Add category filter if provided
    if (category) {
      searchQuery.body.query.bool.filter.push({
        term: { category: category.toLowerCase() }
      });
    }

    // Add price range filter if provided
    if (minPrice || maxPrice) {
      const priceRange = {};
      if (minPrice) priceRange.gte = parseFloat(minPrice);
      if (maxPrice) priceRange.lte = parseFloat(maxPrice);
      
      searchQuery.body.query.bool.filter.push({
        range: { price: priceRange }
      });
    }

    const response = await client.search(searchQuery);
    
    const results = {
      total: response.body.hits.total.value,
      products: response.body.hits.hits.map(hit => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
        highlights: hit.highlight
      })),
      query: {
        searchTerm: query,
        category,
        priceRange: { min: minPrice, max: maxPrice },
        pagination: { limit: parseInt(limit), offset: parseInt(offset) }
      }
    };

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message,
      suggestion: 'Check if Elasticsearch is running and products index exists'
    });
  }
});

// Search suggestions/autocomplete endpoint
app.get('/api/suggest', async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ 
        error: 'Query must be at least 2 characters',
        example: '/api/suggest?query=lap'
      });
    }

    const response = await client.search({
      index: 'products',
      body: {
        size: parseInt(limit),
        query: {
          match_phrase_prefix: {
            title: {
              query: query,
              max_expansions: 10
            }
          }
        },
        _source: ['title', 'category', 'price']
      }
    });

    const suggestions = response.body.hits.hits.map(hit => ({
      id: hit._id,
      title: hit._source.title,
      category: hit._source.category,
      price: hit._source.price
    }));

    res.json({ suggestions, count: suggestions.length });
  } catch (error) {
    console.error('Suggestion error:', error);
    res.status(500).json({ 
      error: 'Suggestions failed',
      message: error.message
    });
  }
});

// Get popular search terms
app.get('/api/popular', async (req, res) => {
  try {
    const response = await client.search({
      index: 'products',
      body: {
        size: 0,
        aggs: {
          popular_categories: {
            terms: {
              field: 'category.keyword',
              size: 10
            }
          }
        }
      }
    });

    const categories = response.body.aggregations.popular_categories.buckets.map(bucket => ({
      category: bucket.key,
      count: bucket.doc_count
    }));

    res.json({ popularCategories: categories });
  } catch (error) {
    console.error('Popular terms error:', error);
    res.status(500).json({ 
      error: 'Failed to get popular terms',
      message: error.message
    });
  }
});

// Initialize products index (for development)
app.post('/api/init', async (req, res) => {
  try {
    // Check if index exists
    const indexExists = await client.indices.exists({ index: 'products' });
    
    if (!indexExists.body) {
      // Create index with mapping
      await client.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              title: { type: 'text', analyzer: 'standard' },
              description: { type: 'text' },
              category: { 
                type: 'text',
                fields: {
                  keyword: { type: 'keyword', ignore_above: 256 }
                }
              },
              price: { type: 'float' },
              imageUrl: { type: 'keyword' },
              inStock: { type: 'boolean' },
              rating: { type: 'float' },
              createdAt: { type: 'date' }
            }
          }
        }
      });

      // Add sample products for testing
      const sampleProducts = [
        {
          title: 'MacBook Pro 16"',
          description: 'Powerful laptop for professionals',
          category: 'electronics',
          price: 2399.99,
          imageUrl: '/images/macbook.jpg',
          inStock: true,
          rating: 4.8,
          createdAt: new Date()
        },
        {
          title: 'Nike Air Max',
          description: 'Comfortable running shoes',
          category: 'fashion',
          price: 129.99,
          imageUrl: '/images/nike.jpg',
          inStock: true,
          rating: 4.5,
          createdAt: new Date()
        }
      ];

      for (let i = 0; i < sampleProducts.length; i++) {
        await client.index({
          index: 'products',
          id: i + 1,
          body: sampleProducts[i]
        });
      }

      await client.indices.refresh({ index: 'products' });
    }

    res.json({ 
      message: 'Search index initialized successfully',
      indexExists: indexExists.body,
      elasticsearchUrl: elasticUrl
    });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize index',
      message: error.message
    });
  }
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    service: 'E-Commerce Search Service',
    version: '1.0.0',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /api/search': 'Search products - ?query=term&category=cat&minPrice=10&maxPrice=100&limit=10&offset=0',
      'GET /api/suggest': 'Get search suggestions - ?query=term&limit=5',
      'GET /api/popular': 'Get popular categories',
      'POST /api/init': 'Initialize search index (development only)',
      'GET /api/docs': 'This documentation'
    },
    examples: {
      search: '/api/search?query=laptop&category=electronics&limit=5',
      suggest: '/api/suggest?query=mac&limit=3',
      popular: '/api/popular'
    }
  });
});

// Root endpoint redirect to docs
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

// Start server
app.listen(port, () => {
  console.log(`🔍 Search Service running on http://localhost:${port}`);
  console.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔗 Elasticsearch URL: ${elasticUrl}`);
});

module.exports = app;