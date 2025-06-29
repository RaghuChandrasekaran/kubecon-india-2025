import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchUrl } from '../api/config';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  imageUrl?: string;
  inStock: boolean;
  rating: number;
  score: number;
  highlights?: any;
}

interface SearchResponse {
  total: number;
  products: SearchResult[];
  query: {
    searchTerm: string;
    category?: string;
    priceRange?: { min?: string; max?: string };
    pagination: { limit: number; offset: number };
  };
}

const SearchComponent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Search function
  const handleSearch = async (queryOverride?: string) => {
    const query = queryOverride || searchTerm;
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: query,
        limit: '10',
        ...(category && { category }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice })
      });

      // Update URL params
      setSearchParams(params);

      console.log('Making search API call to:', `${searchUrl}api/search?${params}`);
      
      const response = await fetch(`${searchUrl}api/search?${params}`);
      const data = await response.json();
      
      console.log('Search API response:', response.status, data);
      
      if (response.ok) {
        setResults(data);
      } else {
        console.error('Search error:', data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle button click
  const handleSearchClick = () => {
    handleSearch();
  };

  // Auto-search when component mounts with query param
  useEffect(() => {
    const queryFromUrl = searchParams.get('query');
    if (queryFromUrl) {
      setSearchTerm(queryFromUrl);
      handleSearch(queryFromUrl);
    }
  }, []);

  // Get suggestions
  const getSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      console.log('Making suggestions API call to:', `${searchUrl}api/suggest?query=${encodeURIComponent(query)}&limit=5`);
      
      const response = await fetch(`${searchUrl}api/suggest?query=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      
      console.log('Suggestions API response:', response.status, data);
      
      if (response.ok) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Suggestions failed:', error);
    }
  };

  // Handle input change with debounced suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      getSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debug: Show current searchUrl
  useEffect(() => {
    console.log('Search service URL configured as:', searchUrl);
  }, []);

  return (
    <div className="search-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🔍 Product Search</h2>
      
      {/* Search Form */}
      <div className="search-form" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search products..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderTop: 'none',
                borderRadius: '0 0 4px 4px',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSearchTerm(suggestion.title);
                      setSuggestions([]);
                    }}
                    style={{
                      padding: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div style={{ fontWeight: 'bold' }}>{suggestion.title}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {suggestion.category} - ${suggestion.price}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={handleSearchClick}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="books">Books</option>
            <option value="home">Home & Garden</option>
          </select>
          
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min Price"
            style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px', width: '100px' }}
          />
          
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max Price"
            style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px', width: '100px' }}
          />
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="search-results">
          <h3>Search Results ({results.total} found)</h3>
          
          {results.products.length === 0 ? (
            <p>No products found for "{results.query.searchTerm}"</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {results.products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                    {product.highlights?.title ? (
                      <span dangerouslySetInnerHTML={{ __html: product.highlights.title[0] }} />
                    ) : (
                      product.title
                    )}
                  </h4>
                  
                  <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                    {product.highlights?.description ? (
                      <span dangerouslySetInnerHTML={{ __html: product.highlights.description[0] }} />
                    ) : (
                      product.description
                    )}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#007bff' }}>
                      ${product.price}
                    </span>
                    <span style={{ 
                      backgroundColor: product.inStock ? '#28a745' : '#dc3545',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                    Category: {product.category} | Rating: ⭐ {product.rating} | Score: {product.score?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;