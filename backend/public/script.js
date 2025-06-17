



const API_URL = '/api/products';
const INFO_API_URL = '/api/info';
const AUTH_API_URL = '/api/auth';
const CONTACT_API_URL = '/api/contact';





const updateResponse = (res) => {
    const responseElement = document.getElementById('response-status');
    if (!responseElement) return;

    let text = "Статус ответа: ";
    let color = 'black';

    if (res instanceof Error) {
        text += `Ошибка сети - ${res.message}`;
        color = 'red';
    } else if (res && typeof res.status === 'number') {
        text += `${res.status} ${res.statusText}`;
        if (res.status >= 200 && res.status < 300) {
            color = 'green';
        } else if (res.status >= 400 && res.status < 500) {
            color = 'orange';
        } else if (res.status >= 500) {
            color = 'red';
        }
    } else if (typeof res === 'string') {
        text += res;
        color = 'red';
    } else {
        text += "Ожидание...";
    }

    responseElement.textContent = text;
    responseElement.style.color = color;
};



const initializeToggleForms = () => {
    let toggleFormContainers = document.querySelectorAll('.toggle-form_container');
    toggleFormContainers.forEach(container => {

        if (container.dataset.listenerAttached) {
            return;
        }
        container.dataset.listenerAttached = 'true';

        container.addEventListener('click', () => {
            const section = container.closest('.func-section__vertical, .search_section, .filter_section, .sort_section');
            if (section) {
                const hiddenForm = section.querySelector('.hidden-form');
                const arrowIcon = container.querySelector('.arrow-down-icon');

                if (hiddenForm) {
                    const isVisible = hiddenForm.classList.contains('visible');
                    hiddenForm.classList.toggle('visible');

                    if (arrowIcon) {

                        arrowIcon.classList.toggle('rotated', !isVisible);
                    }
                }
            }
        });


        const arrowIcon = container.querySelector('.arrow-down-icon');
        const isFormVisible = container.closest('section')?.querySelector('.hidden-form')?.classList.contains('visible');
        if (arrowIcon) {

            arrowIcon.classList.toggle('rotated', isFormVisible);
            arrowIcon.style.transition = 'transform 0.5s ease';
        }
    });
};



const displayErrors = (errors, errorsDivId) => {
    const errorsDiv = document.getElementById(errorsDivId);
    if (!errorsDiv) return;

    errorsDiv.innerHTML = '';

    if (errors && Array.isArray(errors)) {
        let errorHtml = '<ul>';
        errors.forEach(err => {


            errorHtml += `<li>${err.msg}</li>`;
        });
        errorHtml += '</ul>';
        errorsDiv.innerHTML = errorHtml;
    } else if (typeof errors === 'string') {
        errorsDiv.innerHTML = `<p>${errors}</p>`;
    } else if (errors && typeof errors.error === 'string') {
        errorsDiv.innerHTML = `<p>${errors.error}</p>`;
    }

    if (errorsDiv.innerHTML.trim() !== '') {
        errorsDiv.style.display = '';
    } else {
        errorsDiv.style.display = 'none';
    }
};


const clearMessages = (errorsDivId, successDivId) => {
    const errorsDiv = document.getElementById(errorsDivId);
    const successDiv = document.getElementById(successDivId);
    if (errorsDiv) {
        errorsDiv.innerHTML = '';
        errorsDiv.style.display = 'none';
    }
    if (successDiv) {
        successDiv.innerHTML = '';
        successDiv.style.display = 'none';
    }
};





const fetchProducts = async () => {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = '<p>Загрузка продуктов...</p>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            const result = await response.json().catch(() => ({error: response.statusText}));
            const errorDetail = result.error || response.statusText || 'Неизвестная ошибка';

            productList.innerHTML = `<p style="color: red;">Не удалось загрузить продукты.<br>${errorDetail}</p>`;
            updateResponse(response);
            return;
        }
        const products = await response.json();
        updateResponse(response);
        renderProducts(products, 'product-list');

    } catch (error) {
        console.error('Error fetching products:', error);
        updateResponse(error);
        productList.innerHTML = `<p style="color: red;">Не удалось загрузить продукты.<br>${error.message || ''}</p>`;
    }
};


const renderProducts = (products, containerId) => {
    const productList = document.getElementById(containerId);
    if (!productList) return;

    productList.innerHTML = '';

    if (!Array.isArray(products)) {
        products = [products];
    }

    if (products.length === 0) {
        productList.innerHTML = '<p>Продукты не найдены.</p>';
        return;
    }


    products.forEach((product) => {
        if(product.isVisible) {
            const card = document.createElement('div');
            card.className = 'card';

            card.dataset.productId = product._id;

            card.innerHTML = `
            <div class="card_content">
                <h3>${product.name || 'Без названия'}</h3>
                <p><b>Категория:</b> ${product.category || 'Не указано'}</p>
                <p><b>Цена:</b> $${product.price != null ? product.price.toFixed(2) : 'Не указано'}</p> 
                <p><b>Продавец:</b> ${product.seller || 'Не указан'}</p>
                <p><b>Количество:</b> ${product.quantity != null ? product.quantity : 'Не указано'}</p>
                <p><b>Описание:</b> ${product.description || 'Нет описания'}</p>
           </div>
            
           ${containerId === 'admin-product-list' ? `<button class="button__delete" onclick="deleteProduct('${product._id}')"><img class="trash-icon" src="/icons/trash-2.svg" alt="Удалить"></button>` : ''}
        `;


            if (containerId === 'admin-product-list') {
                card.classList.add('interactive');
                card.onclick = () => populateEditForm(product);
            }


            productList.appendChild(card);
        }
    });
};


const searchProduct = async () => {
    const idInput = document.getElementById('search-id');
    const productList = document.getElementById('product-list');
    if (!idInput || !productList) return;

    const id = idInput.value.trim();

    if (!id) {
        alert('Введите ID продукта для поиска.');
        fetchProducts();
        return;
    }

    productList.innerHTML = '<p>Поиск...</p>';

    try {
        const response = await fetch(`${API_URL}/${id}`);
        updateResponse(response);

        if (response.ok) {
            const product = await response.json();
            renderProducts([product], 'product-list');
        } else {
            const result = await response.json().catch(() => ({error: response.statusText}));
            productList.innerHTML = `<p style="color: red;">${result.error || response.statusText || 'Ошибка при поиске'}</p>`;
        }

    } catch (error) {
        console.error('Error searching product:', error);
        updateResponse(error);
        productList.innerHTML = `<p style="color: red;">Произошла ошибка сети при поиске продукта.</p>`;
    }
};


const filterProducts = async () => {
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const productList = document.getElementById('product-list');
    if (!minPriceInput || !maxPriceInput || !productList) return;

    const minPrice = Number(minPriceInput.value) || 0;
    const maxPrice = Number(maxPriceInput.value) || Infinity;


    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            const result = await response.json().catch(() => ({error: response.statusText}));
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText} - ${result.error}`);
        }
        const products = await response.json();

        updateResponse(response);

        const filteredProducts = products.filter(
            (product) => product.price >= minPrice && product.price <= maxPrice
        );

        renderProducts(filteredProducts, 'product-list');

    } catch (error) {
        console.error('Error filtering products:', error);
        updateResponse(error);
        productList.innerHTML = `<p style="color: red;">Произошла ошибка при фильтрации продуктов.<br>${error.message || ''}</p>`;
    }
};



const fetchOSInfo = async () => {
    const infoDisplay = document.getElementById('info-display');
    if (!infoDisplay) return;

    infoDisplay.innerHTML = '<p>Загрузка OS Info...</p>';

    try {
        const response = await fetch(`${INFO_API_URL}/os`);
        if (!response.ok) {
            const result = await response.json().catch(() => ({error: response.statusText}));
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText} - ${result.error}`);
        }
        const osInfo = await response.json();

        updateResponse(response);
        displayInfo('Информация об OS', osInfo, 'info-display');

    } catch (error) {
        console.error('Error fetching OS info:', error);
        updateResponse(error);
        displayInfo('Информация об OS', {error: `Не удалось загрузить информацию об OS.<br>${error.message || ''}`}, 'info-display');
    }
};


const fetchFileInfo = async () => {
    const infoDisplay = document.getElementById('info-display');
    if (!infoDisplay) return;

    infoDisplay.innerHTML = '<p>Загрузка File Info...</p>';

    try {
        const response = await fetch(`${INFO_API_URL}/file`);
        if (!response.ok) {
            const result = await response.text();
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText} - ${result}`);
        }

        const contentType = response.headers.get('content-type');
        let fileInfo;
        if (contentType && contentType.includes('application/json')) {
            const jsonResponse = await response.json();
            fileInfo = jsonResponse.data || JSON.stringify(jsonResponse, null, 2);
        } else {
            fileInfo = await response.text();
        }


        updateResponse(response);
        displayInfo('Информация о файле', fileInfo, 'info-display');

    } catch (error) {
        console.error('Error fetching file info:', error);
        updateResponse(error);
        displayInfo('Информация о файле', {error: `Не удалось загрузить информацию о файле.<br>${error.message || ''}`}, 'info-display');
    }
};


const displayInfo = (title, info, containerId) => {
    const infoDisplay = document.getElementById(containerId);
    if (!infoDisplay) return;

    let formattedInfo;
    if (typeof info === 'object') {
        formattedInfo = `<pre>${JSON.stringify(info, null, 2)}</pre>`;
    } else {
        formattedInfo = `<pre>${info}</pre>`;
    }

    infoDisplay.innerHTML = `<h3>${title}</h3>${formattedInfo}`;
};


const fetchSortedProducts = async (sortBy, order = 'asc') => {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = '<p>Сортировка...</p>';

    try {
        const response = await fetch(`${API_URL}/sort?by=${sortBy}&order=${order}`);
        if (!response.ok) {

            const result = await response.json().catch(() => ({error: response.statusText}));
            throw new Error(result.error || `Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        const sortedProducts = await response.json();

        updateResponse(response);
        renderProducts(sortedProducts, 'product-list');

    } catch (error) {
        console.error(`Error sorting products by ${sortBy}:`, error);
        updateResponse(error);
        productList.innerHTML = `<p style="color: red;">${error.message || 'Не удалось отсортировать продукты.'}</p>`;
    }
};





const fetchAdminProducts = async () => {
    const productList = document.getElementById('admin-product-list');
    if (!productList) return;

    productList.innerHTML = '<p>Загрузка продуктов для админки...</p>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            const result = await response.json().catch(() => ({error: response.statusText}));
            const errorDetail = result.error || 'Неизвестная ошибка';

            if (response.status === 401) {




                productList.innerHTML = `<p style="color: orange;">Ошибка авторизации или сессия истекла. ${errorDetail}.<br><a href="/auth?origin=${encodeURIComponent(window.location.pathname)}">Войти</a></p>`;
            } else {
                productList.innerHTML = `<p style="color: red;">Не удалось загрузить продукты для администрирования.<br>${errorDetail || ''}</p>`;
            }
            updateResponse(response);
            return;

        }
        const products = await response.json();

        updateResponse(response);
        renderProducts(products, 'admin-product-list');

        const totalProductsSpan = document.getElementById('total-products');
        if (totalProductsSpan) totalProductsSpan.textContent = products.length;


    } catch (error) {
        console.error('Error fetching admin products:', error);
        updateResponse(error);

    }
};


const fetchContactMessages = async () => {
    const messagesList = document.getElementById('contact-messages-list');
    if (!messagesList) return;

    messagesList.innerHTML = '<p>Загрузка сообщений...</p>';

    try {
        const response = await fetch(`${CONTACT_API_URL}/messages`);
        if (!response.ok) {
            const result = await response.json().catch(() => ({error: response.statusText}));
            const errorDetail = result.error || 'Неизвестная ошибка';

            if (response.status === 401) {
                messagesList.innerHTML = `<p style="color: orange;">Ошибка авторизации или сессия истекла. ${errorDetail}.<br><a href="/auth?origin=${encodeURIComponent(window.location.pathname)}">Войти</a></p>`;
            } else {
                messagesList.innerHTML = `<p style="color: red;">Не удалось загрузить сообщения.<br>${errorDetail || ''}</p>`;
            }
            updateResponse(response);
            return;
        }
        const messages = await response.json();

        updateResponse(response);

        messagesList.innerHTML = '';
        if (messages.length === 0) {
            messagesList.innerHTML = '<p>Нет новых сообщений.</p>';
            return;
        }

        const messagesHtml = messages.map(msg => `
             <div class="message-item">
                 <p><b>От:</b> ${msg.name} (${msg.email})</p>
                 <p><b>Дата:</b> ${new Date(msg.createdAt).toLocaleString()}</p>
                 <p>${msg.message}</p>
             </div>
         `).join('');
        messagesList.innerHTML = messagesHtml;


        const totalMessagesSpan = document.getElementById('total-messages');
        if (totalMessagesSpan) totalMessagesSpan.textContent = messages.length;


    } catch (error) {
        console.error('Error fetching contact messages:', error);
        updateResponse(error);

    }
};


const fetchUsers = async () => {
    const usersList = document.getElementById('users-list-container');
    if (!usersList) return;

    usersList.innerHTML = '<p>Загрузка пользователей...</p>';

    try {
        const response = await fetch(`${AUTH_API_URL}/users`);
        if (!response.ok) {
            const result = await response.json().catch(() => ({error: response.statusText}));
            const errorDetail = result.error || 'Неизвестная ошибка';

            if (response.status === 401) {
                usersList.innerHTML = `<p style="color: orange;">Ошибка авторизации или сессия истекла. ${errorDetail}.<br><a href="/auth?origin=${encodeURIComponent(window.location.pathname)}">Войти</a></p>`;
            } else {
                usersList.innerHTML = `<p style="color: red;">Не удалось загрузить пользователей.<br>${errorDetail || ''}</p>`;
            }
            updateResponse(response);
            return;
        }
        const users = await response.json();

        updateResponse(response);

        usersList.innerHTML = '';
        if (users.length === 0) {
            usersList.innerHTML = '<p>Нет зарегистрированных пользователей.</p>';
            return;
        }

        const usersHtml = users.map(user => `
             <div class="user-item">
                 <p><b>Имя пользователя:</b> ${user.username}</p>
                 <p><b>ID:</b> ${user._id}</p>
                 <p><b>Зарегистрирован:</b> ${new Date(user.createdAt).toLocaleString()}</p>
             </div>
         `).join('');
        usersList.innerHTML = usersHtml;


        const totalUsersSpan = document.getElementById('total-users');
        if (totalUsersSpan) totalUsersSpan.textContent = users.length;

    } catch (error) {
        console.error('Error fetching users:', error);
        updateResponse(error);

    }
};



const populateEditForm = (product) => {
    const editForm = document.getElementById('edit-product-form');
    if (!editForm) return;

    editForm.querySelector('#edit-id').value = product._id;
    editForm.querySelector('#edit-name').value = product.name || '';
    editForm.querySelector('#edit-category').value = product.category || '';
    editForm.querySelector('#edit-description').value = product.description || '';
    editForm.querySelector('#edit-price').value = product.price != null ? product.price : '';
    editForm.querySelector('#edit-seller').value = product.seller || '';
    editForm.querySelector('#edit-quantity').value = product.quantity != null ? product.quantity : '';


    clearMessages('edit-form-errors', 'edit-form-success');


    const editFormSection = editForm.closest('.func-section__vertical');
    if (editFormSection) {
        const hiddenForm = editFormSection.querySelector('.hidden-form');
        if (hiddenForm && !hiddenForm.classList.contains('visible')) {
            hiddenForm.classList.add('visible');

            const toggleContainer = editFormSection.querySelector('.toggle-form_container');
            const arrowIcon = toggleContainer?.querySelector('.arrow-down-icon');
            if (arrowIcon) {
                arrowIcon.classList.add('rotated');
            }
        }
    }
};


const deleteProduct = async (id) => {
    if (!confirm(`Вы уверены, что хотите удалить продукт с ID ${id}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        updateResponse(response);

        if (response.ok) {
            alert(`Продукт с ID ${id} успешно удален.`);
            fetchAdminProducts();

            const editIdInput = document.getElementById('edit-id');
            if (editIdInput && editIdInput.value === id) {
                document.getElementById('edit-product-form').reset();
                clearMessages('edit-form-errors', 'edit-form-success');
            }

        } else {
            const result = await response.json().catch(() => ({error: response.statusText}));
            console.error('Error deleting product:', result.error || response.statusText);
            alert(`Ошибка при удалении продукта: ${result.error || response.statusText || 'Неизвестная ошибка'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        updateResponse(error);
        alert(`Произошла ошибка сети при удалении продукта.`);
    }
};


const handleAddProductSubmit = async (e) => {
    e.preventDefault();

    const addForm = document.getElementById('add-product-form');
    if (!addForm) return;
    const addErrorsDiv = document.getElementById('add-form-errors');
    const addSuccessDiv = document.getElementById('add-form-success');

    clearMessages('add-form-errors', 'add-form-success');

    const product = {
        name: addForm.querySelector('#name').value.trim(),
        category: addForm.querySelector('#category').value.trim(),
        description: addForm.querySelector('#description').value.trim(),
        price: Number(addForm.querySelector('#price').value),
        seller: addForm.querySelector('#seller').value.trim(),
        quantity: Number(addForm.querySelector('#quantity').value),
    };


    if (!product.name || !product.category || !product.seller || isNaN(product.price) || product.price <= 0 || isNaN(product.quantity) || product.quantity < 0) {
        displayErrors([{msg: 'Пожалуйста, заполните все обязательные поля корректно (Название, Категория, Продавец, Цена>0, Количество>=0).'}], 'add-form-errors');
        return;
    }


    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        });

        const result = await response.json();
        updateResponse(response);

        if (response.ok) {

            addForm.reset();
            fetchAdminProducts();
            if (addSuccessDiv) displayErrors('Продукт успешно добавлен!', 'add-form-success');
        } else {

            if (response.status === 400 && result.errors) {
                displayErrors(result.errors, 'add-form-errors');
            } else {

                displayErrors(result.error || response.statusText || 'Неизвестная ошибка при добавлении.', 'add-form-errors');
            }
        }
    } catch (error) {
        console.error('Error adding product:', error);
        updateResponse(error);
        displayErrors('Произошла ошибка сети при добавлении продукта.', 'add-form-errors');
    }
};


const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    const editForm = document.getElementById('edit-product-form');
    if (!editForm) return;
    const editErrorsDiv = document.getElementById('edit-form-errors');
    const editSuccessDiv = document.getElementById('edit-form-success');

    clearMessages('edit-form-errors', 'edit-form-success');

    const id = editForm.querySelector('#edit-id').value.trim();
    if (!id) {
        displayErrors('ID продукта для редактирования не указан.', 'edit-form-errors');
        return;
    }

    const updatedProduct = {};

    const name = editForm.querySelector('#edit-name').value.trim();
    const category = editForm.querySelector('#edit-category').value.trim();
    const description = editForm.querySelector('#edit-description').value.trim();
    const price = editForm.querySelector('#edit-price').value.trim();
    const seller = editForm.querySelector('#edit-seller').value.trim();
    const quantity = editForm.querySelector('#edit-quantity').value.trim();


    if (name !== '') updatedProduct.name = name;
    if (category !== '') updatedProduct.category = category;
    if (description !== '') updatedProduct.description = description;

    if (price !== '') {
        const numPrice = Number(price);


        if (!isNaN(numPrice) && numPrice > 0) updatedProduct.price = numPrice;
        else {
            displayErrors('Цена должна быть положительным числом.', 'edit-form-errors');
            return;
        }
    }
    if (seller !== '') updatedProduct.seller = seller;
    if (quantity !== '') {
        const numQuantity = Number(quantity);
        if (!isNaN(numQuantity) && numQuantity >= 0) updatedProduct.quantity = numQuantity;
        else {
            displayErrors('Количество должно быть целым неотрицательным числом.', 'edit-form-errors');
            return;
        }
    }


    if (Object.keys(updatedProduct).length === 0) {
        displayErrors('Нет полей для обновления.', 'edit-form-errors');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProduct),
        });

        const result = await response.json();
        updateResponse(response);

        if (response.ok) {


            fetchAdminProducts();
            if (editSuccessDiv) displayErrors('Продукт успешно обновлен!', 'edit-form-success');
        } else {

            if (response.status === 400 && result.errors) {
                displayErrors(result.errors, 'edit-form-errors');
            } else {

                displayErrors(result.error || response.statusText || 'Неизвестная ошибка при редактировании.', 'edit-form-errors');
            }
        }
    } catch (error) {
        console.error('Error editing product:', error);
        updateResponse(error);
        displayErrors('Произошла ошибка сети при редактировании продукта.', 'edit-form-errors');
    }
};





const handleContactFormSubmit = async (e) => {
    e.preventDefault();

    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    const contactErrorsDiv = document.getElementById('contact-form-errors');
    const contactSuccessDiv = document.getElementById('contact-form-success');
    if (!contactErrorsDiv || !contactSuccessDiv) return;

    clearMessages('contact-form-errors', 'contact-form-success');

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());


    if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
        displayErrors('Пожалуйста, заполните все обязательные поля.', 'contact-form-errors');
        return;
    }


    try {
        const response = await fetch(CONTACT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        updateResponse(response);

        if (response.ok) {
            if (contactSuccessDiv) displayErrors(result.message || 'Ваше сообщение успешно отправлено!', 'contact-form-success');
            contactForm.reset();
            updateContactButtonState();
        } else {

            if (response.status === 400 && result.errors) {
                displayErrors(result.errors, 'contact-form-errors');
            } else {
                displayErrors(result.error || response.statusText || 'Неизвестная ошибка при отправке.', 'contact-form-errors');
            }
        }

    } catch (error) {
        console.error('Error sending message:', error);
        updateResponse(error);
        displayErrors('Произошла ошибка сети при отправке сообщения.', 'contact-form-errors');
    }
};


const updateContactButtonState = () => {
    const contactForm = document.getElementById('contact-form');
    const contactSubmitBtn = document.getElementById('contact-submit-btn');
    if (!contactForm || !contactSubmitBtn) return;

    const name = contactForm.querySelector('#contact-name')?.value;
    const email = contactForm.querySelector('#contact-email')?.value;
    const message = contactForm.querySelector('#contact-message')?.value;


    contactSubmitBtn.disabled = !(name?.trim() && email?.trim() && message?.trim());
};





const handleLoginFormSubmit = async (e) => {
    e.preventDefault();

    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    const loginErrorsDiv = document.getElementById('login-errors');
    const loginSuccessDiv = document.getElementById('login-success');


    clearMessages('login-errors', 'login-success');

    const username = loginForm.querySelector('#login-username').value.trim();
    const password = loginForm.querySelector('#login-password').value;

    if (!username || !password) {
        displayErrors('Пожалуйста, введите имя пользователя и пароль.', 'login-errors');
        return;
    }

    try {
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password}),
        });

        const result = await response.json();
        updateResponse(response);

        if (response.ok) {
            if (loginSuccessDiv) displayErrors('Вход выполнен успешно! Перенаправление...', 'login-success');


            const urlParams = new URLSearchParams(window.location.search);
            const originUrl = urlParams.get('origin') || '/admin';

            setTimeout(() => {
                window.location.href = originUrl;
            }, 1000);

        } else {

            if (response.status === 400 && result.errors) {
                displayErrors(result.errors, 'login-errors');
            } else {
                displayErrors(result.error || response.statusText || 'Ошибка при входе.', 'login-errors');
            }
        }

    } catch (error) {
        console.error('Error logging in:', error);
        updateResponse(error);
        displayErrors('Произошла ошибка сети при входе.', 'login-errors');
    }
};


const handleRegisterFormSubmit = async (e) => {
    e.preventDefault();

    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    const registerErrorsDiv = document.getElementById('register-errors');
    const registerSuccessDiv = document.getElementById('register-success');


    clearMessages('register-errors', 'register-success');

    const username = registerForm.querySelector('#register-username').value.trim();
    const password = registerForm.querySelector('#register-password').value;
    const password2 = registerForm.querySelector('#register-password2').value;

    if (!username || !password || !password2) {
        displayErrors('Пожалуйста, заполните все поля.', 'register-errors');
        return;
    }

    if (password !== password2) {
        displayErrors('Пароли не совпадают!', 'register-errors');
        return;
    }


    if (password.length < 6) {
        displayErrors('Пароль должен быть минимум 6 символов.', 'register-errors');
        return;
    }


    try {
        const response = await fetch(`${AUTH_API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password}),
        });

        const result = await response.json();
        updateResponse(response);

        if (response.ok) {
            if (registerSuccessDiv) displayErrors('Регистрация успешна! Перенаправление...', 'register-success');


            const urlParams = new URLSearchParams(window.location.search);
            const originUrl = urlParams.get('origin') || '/admin';

            setTimeout(() => {
                window.location.href = originUrl;
            }, 1000);

        } else {

            if (response.status === 400 && result.errors) {
                displayErrors(result.errors, 'register-errors');
            } else {
                displayErrors(result.error || response.statusText || 'Ошибка при регистрации.', 'register-errors');
                if (response.status === 409) {
                    displayErrors('Пользователь с таким именем уже существует.', 'register-errors');
                }
            }
        }

    } catch (error) {
        console.error('Error registering:', error);
        updateResponse(error);
        displayErrors('Произошла ошибка сети при регистрации.', 'register-errors');
    }
};


const initializeAuthPage = () => {
    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const pageAuthErrorDiv = document.getElementById('page-auth-error');



    if (loginFormContainer && registerFormContainer && loginForm && registerForm && pageAuthErrorDiv) {


        const clearAllAuthMessages = () => {
            clearMessages('page-auth-error', null);
            clearMessages('login-errors', 'login-success');
            clearMessages('register-errors', 'register-success');
        }



        showRegisterLink?.addEventListener('click', (e) => {
            e.preventDefault();
            loginFormContainer.style.display = 'none';
            registerFormContainer.style.display = 'block';
            loginForm.reset();
            registerForm.reset();
            clearAllAuthMessages();
        });

        showLoginLink?.addEventListener('click', (e) => {
            e.preventDefault();
            registerFormContainer.style.display = 'none';
            loginFormContainer.style.display = 'block';
            registerForm.reset();
            loginForm.reset();
            clearAllAuthMessages();
        });


        loginForm.addEventListener('submit', handleLoginFormSubmit);
        registerForm.addEventListener('submit', handleRegisterFormSubmit);


        const urlParams = new URLSearchParams(window.location.search);
        const errorMessage = urlParams.get('error');
        if (errorMessage) {

            displayErrors(decodeURIComponent(errorMessage), 'page-auth-error');

            urlParams.delete('error');
            history.replaceState(null, '', window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : ''));

        }


        clearMessages('login-errors', 'login-success');
        clearMessages('register-errors', 'register-success');


        const action = urlParams.get('action');
        if (action === 'register') {

            loginFormContainer.style.display = 'none';
            registerFormContainer.style.display = 'block';
            clearMessages('login-errors', 'login-success');
            registerForm.reset();
            clearMessages('register-errors', 'register-success');
        } else {


            loginFormContainer.style.display = 'block';
            registerFormContainer.style.display = 'none';
            clearMessages('register-errors', 'register-success');
            loginForm.reset();
            clearMessages('login-errors', 'login-success');
        }

        clearAllAuthMessages();

    } else {
        console.warn("Auth page elements not found. initializeAuthPage skipped.");
    }
};



document.addEventListener('DOMContentLoaded', () => {


    initializeToggleForms();


    if (document.getElementById('product-list')) {

        fetchProducts();

        document.getElementById('os-info-btn')?.addEventListener('click', fetchOSInfo);
        document.getElementById('file-info-btn')?.addEventListener('click', fetchFileInfo);
        document.getElementById('sort-by-category-btn')?.addEventListener('click', () => {
            fetchSortedProducts('category');
        });
        document.getElementById('sort-by-seller-btn')?.addEventListener('click', () => {
            fetchSortedProducts('seller');
        });
        document.getElementById('sort-by-price-btn')?.addEventListener('click', () => {
            fetchSortedProducts('price');
        });
        document.getElementById('sort-by-name-btn')?.addEventListener('click', () => {
            fetchSortedProducts('name');
        });
        document.getElementById('sort-by-quantity-btn')?.addEventListener('click', () => {
            fetchSortedProducts('quantity');
        });
        document.getElementById('sort-by-created-btn')?.addEventListener('click', () => {
            fetchSortedProducts('createdAt', 'desc');
        });
        document.getElementById('sort-by-updated-btn')?.addEventListener('click', () => {
            fetchSortedProducts('updatedAt', 'desc');
        });


        document.querySelector('.search_section .search-icon')?.addEventListener('click', searchProduct);

        document.getElementById('filter-price-btn')?.addEventListener('click', filterProducts);


    }

    if (document.getElementById('admin-product-list')) {

        fetchAdminProducts();
        fetchContactMessages();
        fetchUsers();


        document.getElementById('add-product-form')?.addEventListener('submit', handleAddProductSubmit);
        document.getElementById('edit-product-form')?.addEventListener('submit', handleEditProductSubmit);
    }


    if (document.getElementById('login-form-container')) {
        initializeAuthPage();
    }


    if (document.getElementById('contact-form')) {
        document.getElementById('contact-form')?.addEventListener('submit', handleContactFormSubmit);

        document.getElementById('contact-name')?.addEventListener('input', updateContactButtonState);
        document.getElementById('contact-email')?.addEventListener('input', updateContactButtonState);
        document.getElementById('contact-message')?.addEventListener('input', updateContactButtonState);
        updateContactButtonState();
    }


    document.querySelector('footer .button__refresh')?.addEventListener('click', () => {

        if (document.getElementById('product-list')) {
            fetchProducts();
        } else if (document.getElementById('admin-product-list')) {
            fetchAdminProducts();
            fetchContactMessages();
            fetchUsers();
        } else {
            const responseStatus = document.getElementById('response-status');
            if (responseStatus) {
                responseStatus.textContent = 'Обновление данных недоступно на этой странице.';
                responseStatus.style.color = 'orange';
            }
        }
    });

});