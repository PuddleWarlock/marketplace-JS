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

        // Add click event to populate the edit form
        card.onclick = () => populateEditForm(product);

        productList.appendChild(card);
    });
};

// Populate the edit form with product data.txt
const populateEditForm = (product) => {
    document.getElementById('edit-id').value = product._id;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-category').value = product.category;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-seller').value = product.seller;
    document.getElementById('edit-quantity').value = product.quantity;
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
    const minPrice = Number(document.getElementById('min-price').value)?Number(document.getElementById('min-price').value):0;
    const maxPrice = Number(document.getElementById('max-price').value)?Number(document.getElementById('max-price').value):9999999;

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


// Fetch and display OS information
const fetchOSInfo = async () => {
    const API_URL = 'http://localhost:3000/api/info';
    try {
        const response = await fetch(`${API_URL}/os`);
        const osInfo = await response.json();

        displayInfo('OS Information', osInfo);
    } catch (error) {
        console.error('Error fetching OS info:', error);
    }
};

// Fetch and display file information
const fetchFileInfo = async () => {
    const API_URL = 'http://localhost:3000/api/info';
    try {
        const response = await fetch(`${API_URL}/file`);
        const fileInfo = await response.text();

        displayInfo('File Information', fileInfo);
    } catch (error) {
        console.error('Error fetching file info:', error);
    }
};

// Display fetched information
const displayInfo = (title, info) => {
    const infoDisplay = document.getElementById('info-display');
    infoDisplay.innerHTML = `<h3>${title}</h3><pre>${JSON.stringify(info, null, 2)}</pre>`;
};

// Event listeners for buttons
document.getElementById('os-info-btn').addEventListener('click', fetchOSInfo);
document.getElementById('file-info-btn').addEventListener('click', fetchFileInfo);



// Listen for real-time updates
socket.on('update', (data) => {
    console.log('Real-time update:', data);
    //fetchProducts();
});

// Initial load
fetchProducts();
