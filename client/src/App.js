import React, { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('🔄 Fetching products from backend...');
      const response = await fetch('/api/v1/catalog/items');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Backend response:', data);
      
      if (data.success && data.data) {
        setProducts(data.data);
        setError(null);
        console.log(`📦 Loaded ${data.data.length} products`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(`Failed to load products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#007bff' }}>🛍️ eShop</h1>
        <div style={{ fontSize: '18px', color: '#666' }}>
          <div>⏳ Loading products...</div>
          <div style={{ fontSize: '14px', marginTop: '10px' }}>
            Connecting to backend server...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#007bff' }}>🛍️ eShop</h1>
        <div style={{ color: '#dc3545', fontSize: '16px', marginBottom: '20px' }}>
          ❌ {error}
        </div>
        <button 
          onClick={fetchProducts}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#007bff', 
        color: 'white', 
        padding: '20px 0',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0', fontSize: '2.5rem' }}>🛍️ eShop</h1>
        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Your favorite online store</p>
      </header>

      {/* Main Content */}
      <main style={{ padding: '30px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Products Header */}
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <h2 style={{ color: '#333', margin: '0 0 10px 0' }}>
              🎯 Featured Products ({products.length})
            </h2>
            <p style={{ color: '#666', margin: 0 }}>
              Discover amazing products at great prices
            </p>
          </div>

          {/* Products Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '25px',
            marginBottom: '40px'
          }}>
            {products.map(product => (
              <div key={product.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '25px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e9ecef',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}>
                
                {/* Product Name */}
                <h3 style={{ 
                  margin: '0 0 15px 0', 
                  color: '#333',
                  fontSize: '1.3rem',
                  fontWeight: '600'
                }}>
                  {product.name}
                </h3>
                
                {/* Product Description */}
                <p style={{ 
                  color: '#666', 
                  fontSize: '14px', 
                  margin: '0 0 20px 0',
                  lineHeight: '1.5'
                }}>
                  {product.description}
                </p>
                
                {/* Price */}
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: 'bold',
                    color: '#28a745'
                  }}>
                    ${product.price}
                  </span>
                </div>
                
                {/* Product Details */}
                <div style={{ 
                  fontSize: '13px', 
                  color: '#6c757d',
                  marginBottom: '20px',
                  backgroundColor: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '6px'
                }}>
                  <div style={{ marginBottom: '5px' }}>
                    🏷️ <strong>Brand:</strong> {product.catalogBrand?.brand || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '5px' }}>
                    📂 <strong>Category:</strong> {product.catalogType?.type || 'N/A'}
                  </div>
                  <div>
                    📦 <strong>Stock:</strong> {product.availableStock} available
                  </div>
                </div>
                
                {/* Add to Cart Button */}
                <button style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                onClick={() => alert(`Added "${product.name}" to cart! 🛒`)}>
                  🛒 Add to Cart
                </button>
              </div>
            ))}
          </div>

          {/* No Products Message */}
          {products.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📦</div>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>No products found</h3>
              <p style={{ color: '#666' }}>There are no products available at the moment.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#343a40', 
        color: 'white', 
        textAlign: 'center', 
        padding: '20px',
        marginTop: '40px'
      }}>
        <p style={{ margin: 0 }}>© 2024 eShop - Built with React.js & Node.js</p>
      </footer>
    </div>
  );
}

export default App;