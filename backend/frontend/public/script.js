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
            <p>Seller: ${product.seller}</p>
            <p>Stock: ${product.quantity}</p>
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

// Add a new product
document.getElementById('add-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const product = {
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        price: Number(document.getElementById('price').value),
        seller: document.getElementById('seller').value,
        quantity: Number(document.getElementById('quantity').value),
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        });

        if (response.ok) {
            fetchProducts();
        } else {
            console.error('Error adding product:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Edit an existing product
document.getElementById('edit-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-id').value;
    const updatedProduct = {
        name: document.getElementById('edit-name').value || undefined,
        category: document.getElementById('edit-category').value || undefined,
        price: document.getElementById('edit-price').value
            ? Number(document.getElementById('edit-price').value)
            : undefined,
        seller: document.getElementById('edit-seller').value || undefined,
        quantity: document.getElementById('edit-quantity').value
            ? Number(document.getElementById('edit-quantity').value)
            : undefined,
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProduct),
        });

        if (response.ok) {
            fetchProducts();
        } else {
            console.error('Error editing product:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Search for a product by ID
const searchProduct = async () => {
    const id = document.getElementById('search-id').value;

    try {
        const response = await fetch(`${API_URL}/${id}`);
        const product = await response.json();

        renderProducts([product]); // Display only the found product
    } catch (error) {
        console.error('Error searching product:', error);
    }
};

// Filter products by price range
const filterProducts = async () => {
    const minPrice = Number(document.getElementById('min-price').value);
    const maxPrice = Number(document.getElementById('max-price').value);

    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        const filteredProducts = products.filter(
            (product) => product.price >= minPrice && product.price <= maxPrice
        );

        renderProducts(filteredProducts);
    } catch (error) {
        console.error('Error filtering products:', error);
    }
};

// Listen for real-time updates
socket.on('update', (data) => {
    console.log('Real-time update:', data);
    //fetchProducts();
});

// Initial load
fetchProducts();
