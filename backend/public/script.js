// backend\public\script.js
// This file contains all client-side JavaScript for the marketplace application.

// Backend API URL (relative paths)
const API_URL = '/api/products';
const INFO_API_URL = '/api/info';
const AUTH_API_URL = '/api/auth';
const CONTACT_API_URL = '/api/contact';


// --- Общие функции для всех страниц ---

// Обновляет статус ответа в футере
const updateResponse = (res) => {
    const responseElement = document.getElementById('response-status');
    if (!responseElement) return;

    let text = "Статус ответа: ";
    let color = 'black';

    if (res instanceof Error) {
        text += `Ошибка сети - ${res.message}`;
        color = 'red';
    } else if (res && typeof res.status === 'number') { // Проверяем, что это объект ответа fetch
        text += `${res.status} ${res.statusText}`;
        if (res.status >= 200 && res.status < 300) {
            color = 'green';
        } else if (res.status >= 400 && res.status < 500) {
            color = 'orange';
        } else if (res.status >= 500) {
            color = 'red';
        }
    } else if (typeof res === 'string') { // Если передана просто строка (например, сообщение об ошибке JS)
        text += res;
        color = 'red';
    } else {
        text += "Ожидание...";
    }

    responseElement.textContent = text;
    responseElement.style.color = color;
};


// Инициализация скрытия/раскрытия блоков с анимацией стрелки
const initializeToggleForms = () => {
    let toggleFormContainers = document.querySelectorAll('.toggle-form_container');
    toggleFormContainers.forEach(container => {
        // Проверяем, не является ли обработчик уже привязанным
        if (container.dataset.listenerAttached) {
            return;
        }
        container.dataset.listenerAttached = 'true';

        container.addEventListener('click', () => {
            const section = container.closest('.func-section__vertical, .search_section, .filter_section, .sort_section'); // Ищем ближайший родительский раздел
            if (section) {
                const hiddenForm = section.querySelector('.hidden-form');
                const arrowIcon = container.querySelector('.arrow-down-icon');

                if (hiddenForm) {
                    const isVisible = hiddenForm.classList.contains('visible');
                    hiddenForm.classList.toggle('visible'); // Переключаем видимость формы

                    if (arrowIcon) {
                        // Переключаем класс для поворота стрелки (анимация в CSS)
                        arrowIcon.classList.toggle('rotated', !isVisible);
                    }
                }
            }
        });

        // Изначальное состояние стрелок при загрузке страницы
        const arrowIcon = container.querySelector('.arrow-down-icon');
        const isFormVisible = container.closest('section')?.querySelector('.hidden-form')?.classList.contains('visible');
        if (arrowIcon) {
            // Устанавливаем начальное состояние стрелки в зависимости от видимости формы
            arrowIcon.classList.toggle('rotated', isFormVisible);
            arrowIcon.style.transition = 'transform 0.5s ease'; // Убедимся, что переход установлен
        }
    });
};


// Helper function to display validation errors from server (from express-validator)
const displayErrors = (errors, errorsDivId) => {
    const errorsDiv = document.getElementById(errorsDivId);
    if (!errorsDiv) return;

    errorsDiv.innerHTML = ''; // Clear previous errors

    if (errors && Array.isArray(errors)) {
        let errorHtml = '<ul>';
        errors.forEach(err => {
            // err object from express-validator errors.array() has msg, param, etc.
            // Display just the message from the server validation
            errorHtml += `<li>${err.msg}</li>`;
        });
        errorHtml += '</ul>';
        errorsDiv.innerHTML = errorHtml;
    } else if (typeof errors === 'string') {
        errorsDiv.innerHTML = `<p>${errors}</p>`; // Display a single error string
    } else if (errors && typeof errors.error === 'string') { // Handle errors like { error: "message" }
        errorsDiv.innerHTML = `<p>${errors.error}</p>`;
    }
    // Show the div after adding content
    if (errorsDiv.innerHTML.trim() !== '') { // Use trim() to check if there's actual content
        errorsDiv.style.display = ''; // Remove display: none;
    } else {
        errorsDiv.style.display = 'none'; // Hide if empty
    }
};

// Helper function to clear error/success messages
const clearMessages = (errorsDivId, successDivId) => {
    const errorsDiv = document.getElementById(errorsDivId);
    const successDiv = document.getElementById(successDivId);
    if(errorsDiv) {
        errorsDiv.innerHTML = '';
        errorsDiv.style.display = 'none'; // Ensure it's hidden
    }
    if(successDiv) {
        successDiv.innerHTML = '';
        successDiv.style.display = 'none'; // Ensure it's hidden
    }
};


// --- Функции для Главной страницы (index.ejs) ---

// Fetch and display products on Main page
const fetchProducts = async () => {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = '<p>Загрузка продуктов...</p>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            // Attempt to read JSON error response if available, otherwise just text
            // const errorBody = await response.text(); // Read body as text first
            // let errorDetail = errorBody;
            // try {
            //     const jsonError = JSON.parse(errorBody);
            //     if (jsonError.error) errorDetail = jsonError.error;
            // } catch (e) { /* body was not JSON */ }

            const result = await response.json().catch(() => ({ error: response.statusText }));
            const errorDetail = result.error || response.statusText || 'Неизвестная ошибка';

            // throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText} - ${errorDetail}`);
            productList.innerHTML = `<p style="color: red;">Не удалось загрузить продукты.<br>${errorDetail}</p>`;
            updateResponse(response);
            return; // Stop execution
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

// Render products as cards
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
        const card = document.createElement('div');
        card.className = 'card';
        // Добавляем data-id для удобства идентификации
        card.dataset.productId = product._id;

        card.innerHTML = `
            <div class="card_content">
                <h3>${product.name || 'Без названия'}</h3>
                <p><b>Категория:</b> ${product.category || 'Не указано'}</p>
                <p><b>Цена:</b> $${product.price != null ? product.price.toFixed(2) : 'Не указано'}</p> <!-- Форматируем цену -->
                <p><b>Продавец:</b> ${product.seller || 'Не указан'}</p>
                <p><b>Количество:</b> ${product.quantity != null ? product.quantity : 'Не указано'}</p>
                <p><b>Описание:</b> ${product.description || 'Нет описания'}</p>
           </div>
            <!-- Кнопка удаления только на странице админки -->
           ${containerId === 'admin-product-list' ? `<button class="button__delete" onclick="deleteProduct('${product._id}')"><img class="trash-icon" src="/icons/trash-2.svg" alt="Удалить"></button>` : ''}
        `;

        // Добавляем событие клика ТОЛЬКО для списка продуктов на странице админки
        if (containerId === 'admin-product-list') {
            card.classList.add('interactive');
            card.onclick = () => populateEditForm(product);
        }


        productList.appendChild(card);
    });
};

// Search for a product by ID on Main page
const searchProduct = async () => {
    const idInput = document.getElementById('search-id');
    const productList = document.getElementById('product-list');
    if (!idInput || !productList) return;

    const id = idInput.value.trim();

    if (!id) {
        alert('Введите ID продукта для поиска.');
        fetchProducts(); // Перезагружаем весь список, если поле пустое
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
            // const result = await response.headers.get('content-type')?.includes('application/json') ? await response.json() : { error: await response.text() };
            // productList.innerHTML = `<p style="color: red;">${result.error || response.statusText || 'Ошибка при поиске'}</p>`;
            const result = await response.json().catch(() => ({ error: response.statusText })); // Attempt JSON, fallback to statusText
            productList.innerHTML = `<p style="color: red;">${result.error || response.statusText || 'Ошибка при поиске'}</p>`;
        }

    } catch (error) {
        console.error('Error searching product:', error);
        updateResponse(error);
        productList.innerHTML = `<p style="color: red;">Произошла ошибка сети при поиске продукта.</p>`;
    }
};

// Filter products by price range (Client-side filtering) on Main page
const filterProducts = async () => {
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const productList = document.getElementById('product-list');
    if (!minPriceInput || !maxPriceInput || !productList) return;

    const minPrice = Number(minPriceInput.value) || 0;
    const maxPrice = Number(maxPriceInput.value) || Infinity;

    // Сначала получаем ВСЕ продукты, затем фильтруем на клиенте
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            // const errorBody = await response.text();
            // let errorDetail = errorBody;
            // try {
            //     const jsonError = JSON.parse(errorBody);
            //     if (jsonError.error) errorDetail = jsonError.error;
            // } catch (e) { /* body was not JSON */ }
            const result = await response.json().catch(() => ({ error: response.statusText }));
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


// Fetch and display OS information on Main page
const fetchOSInfo = async () => {
    const infoDisplay = document.getElementById('info-display');
    if (!infoDisplay) return;

    infoDisplay.innerHTML = '<p>Загрузка OS Info...</p>';

    try {
        const response = await fetch(`${INFO_API_URL}/os`);
        if (!response.ok) {
            const result = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText} - ${result.error}`);
        }
        const osInfo = await response.json();

        updateResponse(response);
        displayInfo('Информация об OS', osInfo, 'info-display');

    } catch (error) {
        console.error('Error fetching OS info:', error);
        updateResponse(error);
        displayInfo('Информация об OS', { error: `Не удалось загрузить информацию об OS.<br>${error.message || ''}` }, 'info-display');
    }
};

// Fetch and display file information on Main page
const fetchFileInfo = async () => {
    const infoDisplay = document.getElementById('info-display');
    if (!infoDisplay) return;

    infoDisplay.innerHTML = '<p>Загрузка File Info...</p>';

    try {
        const response = await fetch(`${INFO_API_URL}/file`);
        if (!response.ok) {
            const result = await response.text(); // File endpoint returns text for error
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText} - ${result}`);
        }
        // File info - это простой текст (или JSON с полем data)
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
        displayInfo('Информация о файле', { error: `Не удалось загрузить информацию о файле.<br>${error.message || ''}` }, 'info-display');
    }
};

// Display fetched information in a specific container
const displayInfo = (title, info, containerId) => {
    const infoDisplay = document.getElementById(containerId);
    if (!infoDisplay) return;

    let formattedInfo;
    if (typeof info === 'object') {
        formattedInfo = `<pre>${JSON.stringify(info, null, 2)}</pre>`;
    } else {
        formattedInfo = `<pre>${info}</pre>`; // Просто отображаем как текст
    }

    infoDisplay.innerHTML = `<h3>${title}</h3>${formattedInfo}`;
};

// Fetch and display sorted products (Server-side sorting) on Main page
const fetchSortedProducts = async (sortBy, order = 'asc') => { // Добавлена сортировка по порядку
    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = '<p>Сортировка...</p>';

    try {
        const response = await fetch(`${API_URL}/sort?by=${sortBy}&order=${order}`);
        if (!response.ok) {
            // const result = await response.headers.get('content-type')?.includes('application/json') ? await response.json() : { error: await response.text() };
            const result = await response.json().catch(() => ({ error: response.statusText }));
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


// --- Функции для страницы Админки (admin.ejs) ---

// Fetch and display products on Admin page
const fetchAdminProducts = async () => {
    const productList = document.getElementById('admin-product-list');
    if (!productList) return;

    productList.innerHTML = '<p>Загрузка продуктов для админки...</p>';

    try {
        const response = await fetch(API_URL); // Запрос всех продуктов
        if (!response.ok) {
            // Если не OK, возможно нужна авторизация или другая ошибка
            // const errorBody = await response.text();
            // let errorDetail = errorBody;
            // try {
            //     const jsonError = JSON.parse(errorBody);
            //     if (jsonError.error) errorDetail = jsonError.error;
            // } catch (e) { /* body was not JSON */ }
            const result = await response.json().catch(() => ({ error: response.statusText }));
            const errorDetail = result.error || 'Неизвестная ошибка';


            if (response.status === 401) {
                // Перенаправление на страницу авторизации выполнит authMiddleware на сервере
                // Если 401 получен в Fetch на защищенной странице, значит серверный middleware не сработал?
                // Или мы пытаемся фетчить с клиента, который не авторизован?
                // В любом случае, при 401 на API запросе с админки, лучше показать сообщение и, возможно, подсказать авторизоваться.
                // Серверный authMiddleware уже должен перенаправить ПАГЕ, если она защищена.
                // Этот код сработает, если вы на админке, а сессия ИСТЕКЛА.
                productList.innerHTML = `<p style="color: orange;">Ошибка авторизации или сессия истекла. ${errorDetail}.<br><a href="/auth?origin=${encodeURIComponent(window.location.pathname)}">Войти</a></p>`;
                // НЕ делаем window.location.href отсюда, чтобы избежать циклов редиректа или двойных сообщений.
            } else {
                productList.innerHTML = `<p style="color: red;">Не удалось загрузить продукты для администрирования.<br>${errorDetail || ''}</p>`;
            }
            updateResponse(response); // Обновляем статус ответа в футере
            return; // Выходим из функции после обработки ошибки

        }
        const products = await response.json();

        updateResponse(response);
        renderProducts(products, 'admin-product-list'); // Рендерим продукты в админке
        // Обновляем статистику продуктов
        const totalProductsSpan = document.getElementById('total-products');
        if(totalProductsSpan) totalProductsSpan.textContent = products.length;


    } catch (error) {
        console.error('Error fetching admin products:', error);
        updateResponse(error);
        // Сообщение уже выведено в блоке productList выше, здесь просто логгируем
    }
};

// Fetch and display contact messages on Admin page
const fetchContactMessages = async () => {
    const messagesList = document.getElementById('contact-messages-list'); // ID для списка сообщений
    if (!messagesList) return;

    messagesList.innerHTML = '<p>Загрузка сообщений...</p>';

    try {
        const response = await fetch(`${CONTACT_API_URL}/messages`); // API для получения сообщений
        if (!response.ok) {
            const result = await response.json().catch(() => ({ error: response.statusText }));
            const errorDetail = result.error || 'Неизвестная ошибка';

            if (response.status === 401) {
                messagesList.innerHTML = `<p style="color: orange;">Ошибка авторизации или сессия истекла. ${errorDetail}.<br><a href="/auth?origin=${encodeURIComponent(window.location.pathname)}">Войти</a></p>`;
                // НЕ делаем window.location.href отсюда
            } else {
                messagesList.innerHTML = `<p style="color: red;">Не удалось загрузить сообщения.<br>${errorDetail || ''}</p>`;
            }
            updateResponse(response);
            return;

        }
        const messages = await response.json();

        updateResponse(response);

        messagesList.innerHTML = ''; // Очищаем
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

        // Обновляем статистику сообщений
        const totalMessagesSpan = document.getElementById('total-messages'); // Исправлен ID
        if(totalMessagesSpan) totalMessagesSpan.textContent = messages.length;


    } catch (error) {
        console.error('Error fetching contact messages:', error);
        updateResponse(error);
        // Сообщение уже выведено
    }
};

// Fetch and display users on Admin page
const fetchUsers = async () => {
    const usersList = document.getElementById('users-list-container'); // ID для списка пользователей
    if (!usersList) return;

    usersList.innerHTML = '<p>Загрузка пользователей...</p>';

    try {
        const response = await fetch(`${AUTH_API_URL}/users`); // API для получения пользователей
        if (!response.ok) {
            const result = await response.json().catch(() => ({ error: response.statusText }));
            const errorDetail = result.error || 'Неизвестная ошибка';

            if (response.status === 401) {
                usersList.innerHTML = `<p style="color: orange;">Ошибка авторизации или сессия истекла. ${errorDetail}.<br><a href="/auth?origin=${encodeURIComponent(window.location.pathname)}">Войти</a></p>`;
                // НЕ делаем window.location.href отсюда
            } else {
                usersList.innerHTML = `<p style="color: red;">Не удалось загрузить пользователей.<br>${errorDetail || ''}</p>`;
            }
            updateResponse(response);
            return;

        }
        const users = await response.json();

        updateResponse(response);

        usersList.innerHTML = ''; // Очищаем
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

        // Обновляем статистику пользователей
        const totalUsersSpan = document.getElementById('total-users');
        if(totalUsersSpan) totalUsersSpan.textContent = users.length;

    } catch (error) {
        console.error('Error fetching users:', error);
        updateResponse(error);
        // Сообщение уже выведено
    }
};


// Populate the edit form with product data on Admin page
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

    // Очищаем сообщения об ошибках/успехе для формы редактирования
    clearMessages('edit-form-errors', 'edit-form-success');

    // Можно автоматически раскрыть форму редактирования при клике
    const editFormSection = editForm.closest('.func-section__vertical'); // Находим родительскую секцию
    if (editFormSection) {
        const hiddenForm = editFormSection.querySelector('.hidden-form');
        if (hiddenForm && !hiddenForm.classList.contains('visible')) {
            hiddenForm.classList.add('visible');
            // Находим контейнер переключателя и поворачиваем стрелку
            const toggleContainer = editFormSection.querySelector('.toggle-form_container');
            const arrowIcon = toggleContainer?.querySelector('.arrow-down-icon');
            if (arrowIcon) {
                arrowIcon.classList.add('rotated'); // Добавляем класс rotated
            }
        }
    }
};

// Delete a product on Admin page
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
            fetchAdminProducts(); // Обновляем список
            // Очищаем форму редактирования, если в ней был удаленный продукт
            const editIdInput = document.getElementById('edit-id');
            if (editIdInput && editIdInput.value === id) {
                document.getElementById('edit-product-form').reset();
                clearMessages('edit-form-errors', 'edit-form-success');
            }

        } else {
            const result = await response.json().catch(() => ({ error: response.statusText }));
            console.error('Error deleting product:', result.error || response.statusText);
            alert(`Ошибка при удалении продукта: ${result.error || response.statusText || 'Неизвестная ошибка'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        updateResponse(error);
        alert(`Произошла ошибка сети при удалении продукта.`);
    }
};

// Add a new product on Admin page
const handleAddProductSubmit = async (e) => {
    e.preventDefault();

    const addForm = document.getElementById('add-product-form');
    if (!addForm) return; // Check form existence
    const addErrorsDiv = document.getElementById('add-form-errors');
    const addSuccessDiv = document.getElementById('add-form-success');

    clearMessages('add-form-errors', 'add-form-success'); // Clear messages

    const product = {
        name: addForm.querySelector('#name').value.trim(),
        category: addForm.querySelector('#category').value.trim(),
        description: addForm.querySelector('#description').value.trim(),
        price: Number(addForm.querySelector('#price').value),
        seller: addForm.querySelector('#seller').value.trim(),
        quantity: Number(addForm.querySelector('#quantity').value),
    };

    // Simple client-side validation
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
            // alert('Продукт успешно добавлен!'); // Removed alert
            addForm.reset();
            fetchAdminProducts(); // Refresh list
            if(addSuccessDiv) displayErrors('Продукт успешно добавлен!', 'add-form-success'); // Use displayErrors for success
        } else {
            // Error handling based on status code and response body
            if (response.status === 400 && result.errors) {
                displayErrors(result.errors, 'add-form-errors');
            } else {
                displayErrors(result.error || response.statusText || 'Неизвестная ошибка при добавлении.', 'add-form-errors');
                if (response.status === 401) {
                    // Redirect to auth page if 401 (shouldn't happen if server middleware is working, but fallback)
                    // window.location.href = `/auth?error=${encodeURIComponent('Требуется авторизация')}&origin=${encodeURIComponent(window.location.pathname)}`;
                    // Instead of redirect, just show message. Server-side middleware handles page redirects.
                    displayErrors('Требуется авторизация для добавления продукта.', 'add-form-errors');
                }
            }
        }
    } catch (error) {
        console.error('Error adding product:', error);
        updateResponse(error);
        displayErrors('Произошла ошибка сети при добавлении продукта.', 'add-form-errors');
    }
};

// Edit an existing product on Admin page
const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    const editForm = document.getElementById('edit-product-form');
    if (!editForm) return; // Check form existence
    const editErrorsDiv = document.getElementById('edit-form-errors');
    const editSuccessDiv = document.getElementById('edit-form-success');

    clearMessages('edit-form-errors', 'edit-form-success'); // Clear messages

    const id = editForm.querySelector('#edit-id').value.trim();
    if (!id) {
        displayErrors('ID продукта для редактирования не указан.', 'edit-form-errors');
        return;
    }

    const updatedProduct = {};
    // Get values, but only add to updatedProduct if they are not empty (strings) or valid numbers
    const name = editForm.querySelector('#edit-name').value.trim();
    const category = editForm.querySelector('#edit-category').value.trim();
    const description = editForm.querySelector('#edit-description').value.trim();
    const price = editForm.querySelector('#edit-price').value.trim(); // Get as string first
    const seller = editForm.querySelector('#edit-seller').value.trim();
    const quantity = editForm.querySelector('#edit-quantity').value.trim(); // Get as string first

    // Client-side validation and population of updatedProduct object
    if (name !== '') updatedProduct.name = name;
    if (category !== '') updatedProduct.category = category;
    if (description !== '') updatedProduct.description = description;

    if (price !== '') {
        const numPrice = Number(price);
        // Allow price 0 or greater based on HTML min="0.01" might be inconsistent. Let's align with server side or HTML validation.
        // Server side says > 0. Let's stick to that.
        if (!isNaN(numPrice) && numPrice > 0) updatedProduct.price = numPrice; // Price must be > 0
        else { displayErrors('Цена должна быть положительным числом.', 'edit-form-errors'); return; }
    }
    if (seller !== '') updatedProduct.seller = seller;
    if (quantity !== '') {
        const numQuantity = Number(quantity);
        if (!isNaN(numQuantity) && numQuantity >= 0) updatedProduct.quantity = numQuantity; // Quantity >= 0
        else { displayErrors('Количество должно быть целым неотрицательным числом.', 'edit-form-errors'); return; }
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

        const result = await response.json(); // Expect JSON response
        updateResponse(response);

        if (response.ok) {
            // alert('Продукт успешно обновлен!'); // Removed alert
            // editForm.reset(); // Keep data in form for potential further editing
            fetchAdminProducts(); // Refresh list
            if(editSuccessDiv) displayErrors('Продукт успешно обновлен!', 'edit-form-success'); // Show success message
        } else {
            // Error handling
            if (response.status === 400 && result.errors) {
                displayErrors(result.errors, 'edit-form-errors');
            } else {
                displayErrors(result.error || response.statusText || 'Неизвестная ошибка при редактировании.', 'edit-form-errors');
                if (response.status === 401) {
                    // window.location.href = `/auth?error=${encodeURIComponent('Требуется авторизация')}&origin=${encodeURIComponent(window.location.pathname)}`;
                    displayErrors('Требуется авторизация для редактирования продукта.', 'edit-form-errors');
                } else if (response.status === 404) {
                    displayErrors('Продукт не найден для редактирования.', 'edit-form-errors');
                }
            }
        }
    } catch (error) {
        console.error('Error editing product:', error);
        updateResponse(error);
        displayErrors('Произошла ошибка сети при редактировании продукта.', 'edit-form-errors');
    }
};


// --- Функции для страницы Контактов (contact.ejs) ---

// Обработка отправки контактной формы
const handleContactFormSubmit = async (e) => {
    e.preventDefault();

    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return; // Check form existence
    const contactErrorsDiv = document.getElementById('contact-form-errors');
    const contactSuccessDiv = document.getElementById('contact-form-success');
    if (!contactErrorsDiv || !contactSuccessDiv) return;

    clearMessages('contact-form-errors', 'contact-form-success'); // Clear messages

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    // Simple client-side validation
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

        const result = await response.json(); // Expect JSON response
        updateResponse(response);

        if (response.ok) { // Status 200 or 201
            if(contactSuccessDiv) displayErrors(result.message || 'Ваше сообщение успешно отправлено!', 'contact-form-success'); // Show success message
            contactForm.reset(); // Clear form
            updateContactButtonState(); // Update button state
        } else {
            // Error handling
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

// Function to update the state of the contact form submit button
const updateContactButtonState = () => {
    const contactForm = document.getElementById('contact-form');
    const contactSubmitBtn = document.getElementById('contact-submit-btn');
    if (!contactForm || !contactSubmitBtn) return;

    const name = contactForm.querySelector('#contact-name')?.value;
    const email = contactForm.querySelector('#contact-email')?.value;
    const message = contactForm.querySelector('#contact-message')?.value;

    // Button is enabled only if all required fields are non-empty after trimming
    contactSubmitBtn.disabled = !(name?.trim() && email?.trim() && message?.trim());
};


// --- Функции для страницы Auth (auth.ejs) ---

// Handling the login form submission
const handleLoginFormSubmit = async (e) => {
    e.preventDefault();

    const loginForm = document.getElementById('login-form');
    if (!loginForm) return; // Check form existence
    const loginErrorsDiv = document.getElementById('login-errors');
    const loginSuccessDiv = document.getElementById('login-success'); // Add this div in auth.ejs
    // const pageAuthErrorDiv = document.getElementById('page-auth-error'); // Не очищаем здесь page-level error


    clearMessages('login-errors', 'login-success'); // Clear form-specific messages

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
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json(); // Expect JSON response
        updateResponse(response);

        if (response.ok) { // Status 200 OK
            // alert('Вход выполнен успешно!'); // Removed alert
            if(loginSuccessDiv) displayErrors('Вход выполнен успешно! Перенаправление...', 'login-success'); // Show success message

            // Redirect to the page user came from, or admin page by default
            const urlParams = new URLSearchParams(window.location.search);
            const originUrl = urlParams.get('origin') || '/admin';
            // Добавим небольшую задержку перед редиректом, чтобы пользователь увидел сообщение
            setTimeout(() => {
                window.location.href = originUrl; // Perform redirect
            }, 1000); // Задержка 1 секунда

        } else {
            // Error handling
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

// Handling the registration form submission
const handleRegisterFormSubmit = async (e) => {
    e.preventDefault();

    const registerForm = document.getElementById('register-form');
    if (!registerForm) return; // Check form existence
    const registerErrorsDiv = document.getElementById('register-errors');
    const registerSuccessDiv = document.getElementById('register-success'); // Add this div in auth.ejs
    // const pageAuthErrorDiv = document.getElementById('page-auth-error'); // Не очищаем здесь page-level error


    clearMessages('register-errors', 'register-success'); // Clear form-specific messages

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

    // Simple client-side password length check (server validation is primary)
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
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json(); // Expect JSON response
        updateResponse(response);

        if (response.ok) { // Status 200 OK or 201 Created
            // alert('Регистрация успешна! Теперь вы авторизованы.'); // Removed alert
            if(registerSuccessDiv) displayErrors('Регистрация успешна! Перенаправление...', 'register-success'); // Show success message

            // Автоматически авторизуем после регистрации (сервер это уже сделал, здесь только перенаправление)
            const urlParams = new URLSearchParams(window.location.search);
            const originUrl = urlParams.get('origin') || '/admin';
            // Добавим небольшую задержку перед редиректом, чтобы пользователь увидел сообщение
            setTimeout(() => {
                window.location.href = originUrl; // Perform redirect
            }, 1000); // Задержка 1 секунда

        } else {
            // Error handling
            if (response.status === 400 && result.errors) {
                displayErrors(result.errors, 'register-errors');
            } else {
                displayErrors(result.error || response.statusText || 'Ошибка при регистрации.', 'register-errors');
                if (response.status === 409) { // Conflict - user already exists
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

// Initialize Auth page functionality (toggle forms, attach submit listeners)
const initializeAuthPage = () => {
    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const pageAuthErrorDiv = document.getElementById('page-auth-error'); // Новый div для ошибок из URL


    // Only initialize if the key containers are found
    if (loginFormContainer && registerFormContainer && loginForm && registerForm && pageAuthErrorDiv) {

        // Helper to clear all auth page message divs
        const clearAllAuthMessages = () => {
            clearMessages('page-auth-error', null);
            clearMessages('login-errors', 'login-success');
            clearMessages('register-errors', 'register-success');
        }


        // Toggle forms functionality
        showRegisterLink?.addEventListener('click', (e) => {
            e.preventDefault();
            loginFormContainer.style.display = 'none';
            registerFormContainer.style.display = 'block';
            loginForm.reset();
            // clearMessages('login-errors', 'login-success'); // Очищаем через clearAllAuthMessages
            registerForm.reset(); // Also reset register form when switching to it
            // clearMessages('register-errors', 'register-success'); // Очищаем через clearAllAuthMessages
            clearAllAuthMessages();
        });

        showLoginLink?.addEventListener('click', (e) => {
            e.preventDefault();
            registerFormContainer.style.display = 'none';
            loginFormContainer.style.display = 'block';
            registerForm.reset(); // Also reset register form when switching from it
            // clearMessages('register-errors', 'register-success'); // Очищаем через clearAllAuthMessages
            loginForm.reset();
            // clearMessages('login-errors', 'login-success'); // Очищаем через clearAllAuthMessages
            clearAllAuthMessages();
        });

        // Attach submit listeners to forms
        loginForm.addEventListener('submit', handleLoginFormSubmit);
        registerForm.addEventListener('submit', handleRegisterFormSubmit);

        // Check if there's an error message in the URL and display it
        const urlParams = new URLSearchParams(window.location.search);
        const errorMessage = urlParams.get('error');
        if (errorMessage) {
            // Display the page-level error in the dedicated div
            displayErrors(decodeURIComponent(errorMessage), 'page-auth-error');
            // Optional: Remove the error from the URL after displaying
            // This prevents the message from reappearing on refresh, but might be bad for user experience if they expect refresh to preserve state.
            // history.replaceState(null, '', window.location.pathname + window.location.search.replace(/([?&])error=.*?(&|$)/, '$1').replace(/^[?&]$/, ''));
            // Simplified: Remove the error parameter entirely, keeping others (like origin)
            urlParams.delete('error');
            history.replaceState(null, '', window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : ''));

        }

        // Clear messages initially on load, except for the potential URL error
        clearMessages('login-errors', 'login-success');
        clearMessages('register-errors', 'register-success');

        // Determine which form to show initially based on URL or default
        const action = urlParams.get('action');
        if (action === 'register') {
            // showRegisterLink.click(); // Simulate click - might trigger unexpected events
            // Instead, just manually set display and clear messages
            loginFormContainer.style.display = 'none';
            registerFormContainer.style.display = 'block';
            clearMessages('login-errors', 'login-success');
            registerForm.reset();
            clearMessages('register-errors', 'register-success');

        } else {
            // Default is login form (already visible by default HTML/CSS)
            // Ensure register form is hidden
            loginFormContainer.style.display = 'block';
            registerFormContainer.style.display = 'none';
            clearMessages('register-errors', 'register-success');
            loginForm.reset();
            clearMessages('login-errors', 'login-success');
        }
        // Need to clear messages again *after* setting initial display, as reset() might be called
        clearAllAuthMessages(); // Clear all at the very end of initialization


    } else {
        console.warn("Auth page elements not found. initializeAuthPage skipped.");
    }
};


// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {

    // Initialize toggle/collapse functionality for form sections
    initializeToggleForms();

    // Check current page and initialize page-specific functionality
    if (document.getElementById('product-list')) {
        // This is the Main page (index.ejs)
        fetchProducts();
        // Attach event listeners for info and sort buttons (only present on main)
        document.getElementById('os-info-btn')?.addEventListener('click', fetchOSInfo);
        document.getElementById('file-info-btn')?.addEventListener('click', fetchFileInfo);
        document.getElementById('sort-by-category-btn')?.addEventListener('click', () => { fetchSortedProducts('category'); });
        document.getElementById('sort-by-seller-btn')?.addEventListener('click', () => { fetchSortedProducts('seller'); });
        document.getElementById('sort-by-price-btn')?.addEventListener('click', () => { fetchSortedProducts('price'); });
        document.getElementById('sort-by-name-btn')?.addEventListener('click', () => { fetchSortedProducts('name'); });
        document.getElementById('sort-by-quantity-btn')?.addEventListener('click', () => { fetchSortedProducts('quantity'); });
        document.getElementById('sort-by-created-btn')?.addEventListener('click', () => { fetchSortedProducts('createdAt', 'desc'); });
        document.getElementById('sort-by-updated-btn')?.addEventListener('click', () => { fetchSortedProducts('updatedAt', 'desc'); });

        // Attach search button listener
        document.querySelector('.search_section .search-icon')?.addEventListener('click', searchProduct);
        // Attach filter button listener (using the new ID)
        document.getElementById('filter-price-btn')?.addEventListener('click', filterProducts);


    }

    if (document.getElementById('admin-product-list')) {
        // This is the Admin page (admin.ejs)
        fetchAdminProducts(); // Load product list for admin
        fetchContactMessages(); // Load messages
        fetchUsers(); // Load users

        // Attach submit listeners for add/edit forms (only present on admin)
        document.getElementById('add-product-form')?.addEventListener('submit', handleAddProductSubmit);
        document.getElementById('edit-product-form')?.addEventListener('submit', handleEditProductSubmit);
    }

    // Initialize Auth page functionality
    if (document.getElementById('login-form-container')) { // Check if the auth form container exists
        initializeAuthPage();
    }

    // Initialize Contact page functionality
    if (document.getElementById('contact-form')) { // Check if the contact form exists
        document.getElementById('contact-form')?.addEventListener('submit', handleContactFormSubmit);
        // Attach input listeners for button state update
        document.getElementById('contact-name')?.addEventListener('input', updateContactButtonState);
        document.getElementById('contact-email')?.addEventListener('input', updateContactButtonState);
        document.getElementById('contact-message')?.addEventListener('input', updateContactButtonState);
        updateContactButtonState(); // Initial button state check
    }

    // Attach click handler for the refresh button in the footer (globally)
    document.querySelector('footer .button__refresh')?.addEventListener('click', () => {
        // Determine which data to refresh based on the current page elements
        if (document.getElementById('product-list')) {
            fetchProducts(); // Refresh products on Main page
        } else if (document.getElementById('admin-product-list')) {
            fetchAdminProducts(); // Refresh products on Admin page
            fetchContactMessages(); // Refresh messages
            fetchUsers(); // Refresh users
        } else {
            // For other pages, this button might not be present or relevant
            // alert('Обновление данных недоступно на этой странице.'); // Убрал alert
            const responseStatus = document.getElementById('response-status');
            if (responseStatus) {
                responseStatus.textContent = 'Обновление данных недоступно на этой странице.';
                responseStatus.style.color = 'orange';
            }
        }
    });

});

// Define the actual function bodies that were previously commented out or in EJS script blocks

// (All function bodies are defined above)