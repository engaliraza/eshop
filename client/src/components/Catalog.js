import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CatalogItem from './CatalogItem';
import './Catalog.css';

const Catalog = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                // The proxy in package.json forwards this request to http://localhost:5000/api/v1/catalog/items
                const response = await axios.get('/api/v1/catalog/items');
                setItems(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('There was an error fetching the catalog data.');
                setLoading(false);
                console.error(err);
            }
        };

        fetchItems();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="catalog-container">
            <h2>Our Products</h2>
            <div className="catalog-grid">
                {items.map(item => (
                    <CatalogItem key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default Catalog;
