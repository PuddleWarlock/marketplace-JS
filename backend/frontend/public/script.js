const socket = io();

// Backend API URL
const API_URL = 'http://localhost:3000/api/products';

// Fetch and display products
const fetchProducts = async () => {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        renderProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
};

// Render products as cards
const renderProducts = (products) => {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    products.forEach((product) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p>Category: ${product.category}</p>
            <p>Price: $${product.price}</p>
            <button onclick="deleteProduct('${product._id}')">Delete</button>
        `;
        productList.appendChild(card);
    });
};

// Delete a product
const deleteProduct = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchProducts();
        } else {
            console.error('Error deleting product:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// Listen for real-time updates
socket.on('update', (data) => {
    console.log('Real-time update:', data);
    fetchProducts();
});

// Initial load
fetchProducts();
