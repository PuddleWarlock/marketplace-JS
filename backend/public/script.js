// backend\public\script.js
// Socket.IO больше не используется, удаляем его подключение и код.
// const socket = io(); // УДАЛИТЬ

// Backend API URL (теперь просто /api, т.к. сервер один)
const API_URL = '/api/products';
const INFO_API_URL = '/api/info'; // URL для информации OS/File
const AUTH_API_URL = '/api/auth'; // URL для авторизации (уже обрабатывается в auth.ejs)
const CONTACT_API_URL = '/api/contact'; // URL для обратной связи (уже обрабатывается в contact.ejs)


// --- Функции для Главной страницы (index.ejs) ---

// Fetch and display products
// Эту функцию вызываем на главной странице при загрузке
const fetchProducts = async () => {
    const productList = document.getElementById('product-list');
    if (!productList) return; // Убедиться, что этот элемент есть на странице

    productList.innerHTML = '<p>Загрузка продуктов...</p>'; // Индикатор загрузки

    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        updateResponse({ status: response.status, statusText: response.statusText }); // Обновляем статус в футере
        renderProducts(products, 'product-list'); // Рендерим продукты на главной странице

    } catch (error) {
        console.error('Error fetching products:', error);
        updateResponse(error);
        productList.innerHTML = '<p style="color: red;">Не удалось загрузить продукты.</p>';
    }
};

// Render products as cards
// Принимает ID контейнера, куда рендерить
const renderProducts = (products, containerId) => {
    const productList = document.getElementById(containerId);
    if (!productList) return;

    productList.innerHTML = ''; // Очищаем список

    if (!Array.isArray(products)) { // Если пришел не массив (например, один продукт при поиске)
        products = [products]; // Преобразуем в массив для рендеринга
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
                <p><b>Цена:</b> $${product.price != null ? product.price : 'Не указано'}</p>
                <p><b>Продавец:</b> ${product.seller || 'Не указан'}</p>
                <p><b>Количество:</b> ${product.quantity != null ? product.quantity : 'Не указано'}</p>
                <p><b>Описание:</b> ${product.description || 'Нет описания'}</p>
           </div>
            <!-- Кнопка удаления только на странице админки -->
           ${containerId === 'admin-product-list' ? `<button class="button__delete" onclick="deleteProduct('${product._id}')"><img class="trash-icon" src="/icons/trash-2.svg" alt="Удалить"></button>` : ''}
        `;

        // Добавляем событие клика ТОЛЬКО для списка продуктов на странице админки
        if (containerId === 'admin-product-list') {
            card.classList.add('interactive'); // Добавляем класс для стилей курсора
            card.onclick = () => populateEditForm(product); // При клике заполняем форму редактирования
        }


        productList.appendChild(card);
    });
};

// Search for a product by ID
// Используется на главной странице
const searchProduct = async () => {
    const idInput = document.getElementById('search-id');
    const productList = document.getElementById('product-list'); // Ищем на главной странице
    if (!idInput || !productList) return; // Проверяем наличие элементов

    const id = idInput.value.trim();

    if (!id) {
        alert('Введите ID продукта для поиска.');
        // Можно снова загрузить все продукты или очистить список
        fetchProducts(); // Перезагружаем весь список
        return;
    }

    productList.innerHTML = '<p>Поиск...</p>';

    try {
        // Отправляем запрос на API для получения одного продукта
        const response = await fetch(`${API_URL}/${id}`);

        updateResponse({ status: response.status, statusText: response.statusText });

        if (response.ok) {
            const product = await response.json();
            renderProducts([product], 'product-list'); // Отображаем только найденный продукт
        } else {
            // Обрабатываем ошибку (например, 404 Not Found)
            const result = await response.json(); // Пытаемся получить JSON с ошибкой
            productList.innerHTML = `<p style="color: red;">${result.error || response.statusText}</p>`;
        }

    } catch (error) {
        console.error('Error searching product:', error);
        updateResponse(error);
        productList.innerHTML = `<p style="color: red;">Произошла ошибка при поиске продукта.</p>`;
    }
};

// Filter products by price range (Client-side filtering as requested)
// Используется на главной странице
const filterProducts = async () => {
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const productList = document.getElementById('product-list'); // Ищем на главной странице
    if (!minPriceInput || !maxPriceInput || !productList) return; // Проверяем наличие элементов

    const minPrice = Number(minPriceInput.value) || 0; // Если пусто, считаем 0
    const maxPrice = Number(maxPriceInput.value) || Infinity; // Если пусто, считаем бесконечность

    // Сначала получаем ВСЕ продукты, затем фильтруем на клиенте
    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        updateResponse({ status: response.status, statusText: response.statusText });

        const filteredProducts = products.filter(
            (product) => product.price >= minPrice && product.price <= maxPrice
        );

        renderProducts(filteredProducts, 'product-list'); // Рендерим отфильтрованные продукты

    } catch (error) {
        console.error('Error filtering products:', error);
        updateResponse(error);
        productList.innerHTML = `<p style="color: red;">Произошла ошибка при фильтрации продуктов.</p>`;
    }
};


// Fetch and display OS information
// Используется на главной странице
const fetchOSInfo = async () => {
    const infoDisplay = document.getElementById('info-display');
    if (!infoDisplay) return;

    infoDisplay.innerHTML = '<p>Загрузка OS Info...</p>';

    try {
        const response = await fetch(`${INFO_API_URL}/os`);
        const osInfo = await response.json();

        updateResponse({ status: response.status, statusText: response.statusText });

        displayInfo('Информация об OS', osInfo, 'info-display');

    } catch (error) {
        console.error('Error fetching OS info:', error);
        updateResponse(error);
        displayInfo('Информация об OS', { error: 'Не удалось загрузить информацию об OS.' }, 'info-display');
    }
};

// Fetch and display file information
// Используется на главной странице
const fetchFileInfo = async () => {
    const infoDisplay = document.getElementById('info-display');
    if (!infoDisplay) return;

    infoDisplay.innerHTML = '<p>Загрузка File Info...</p>';

    try {
        const response = await fetch(`${INFO_API_URL}/file`);
        // File info - это простой текст, поэтому используем response.text()
        const fileInfo = await response.text();

        updateResponse({ status: response.status, statusText: response.statusText });

        displayInfo('Информация о файле', fileInfo, 'info-display');

    } catch (error) {
        console.error('Error fetching file info:', error);
        updateResponse(error);
        displayInfo('Информация о файле', { error: 'Не удалось загрузить информацию о файле.' }, 'info-display');
    }
};

// Display fetched information in a specific container
const displayInfo = (title, info, containerId) => {
    const infoDisplay = document.getElementById(containerId);
    if (!infoDisplay) return;

    // Проверяем тип данных info для форматирования
    let formattedInfo;
    if (typeof info === 'object') {
        formattedInfo = `<pre>${JSON.stringify(info, null, 2)}</pre>`;
    } else {
        formattedInfo = `<pre>${info}</pre>`; // Просто отображаем как текст
    }

    infoDisplay.innerHTML = `<h3>${title}</h3>${formattedInfo}`;
};

// Fetch and display sorted products (Server-side sorting)
// Используется на главной странице
const fetchSortedProducts = async (sortBy) => {
    const productList = document.getElementById('product-list'); // Ищем на главной странице
    if (!productList) return;

    productList.innerHTML = '<p>Сортировка...</p>';

    try {
        // Отправляем запрос на API с параметром сортировки
        const response = await fetch(`${API_URL}/sort?by=${sortBy}`);
        const sortedProducts = await response.json();

        updateResponse({ status: response.status, statusText: response.statusText });

        renderProducts(sortedProducts, 'product-list'); // Рендерим отсортированные продукты

    } catch (error) {
        console.error(`Error sorting products by ${sortBy}:`, error);
        updateResponse(error);
        productList.innerHTML = `<p style="color: red;">Не удалось отсортировать продукты.</p>`;
    }
};

// Event listeners for sorting buttons (только если они есть на текущей странице)
document.getElementById('sort-by-category-btn')?.addEventListener('click', () => {
    fetchSortedProducts('category');
});

document.getElementById('sort-by-seller-btn')?.addEventListener('click', () => {
    fetchSortedProducts('seller');
});
document.getElementById('sort-by-price-btn')?.addEventListener('click', () => { // Новый обработчик
    fetchSortedProducts('price');
});
document.getElementById('sort-by-name-btn')?.addEventListener('click', () => { // Новый обработчик
    fetchSortedProducts('name');
});


// Event listeners for OS/File info buttons (только если они есть на текущей странице)
document.getElementById('os-info-btn')?.addEventListener('click', fetchOSInfo);
document.getElementById('file-info-btn')?.addEventListener('click', fetchFileInfo);


// --- Функции для страницы Админки (admin.ejs) ---

// Fetch and display products on Admin page
// Эту функцию вызываем на странице админки при загрузке
const fetchAdminProducts = async () => {
    const productList = document.getElementById('admin-product-list');
    if (!productList) return; // Убедиться, что этот элемент есть на странице

    productList.innerHTML = '<p>Загрузка продуктов для админки...</p>'; // Индикатор загрузки

    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        updateResponse({ status: response.status, statusText: response.statusText });
        renderProducts(products, 'admin-product-list'); // Рендерим продукты в админке

    } catch (error) {
        console.error('Error fetching admin products:', error);
        updateResponse(error);
        productList.innerHTML = '<p style="color: red;">Не удалось загрузить продукты для администрирования.</p>';
    }
};


// Populate the edit form with product data.txt
// Используется на странице админки
const populateEditForm = (product) => {
    const editForm = document.getElementById('edit-product-form');
    if (!editForm) return; // Проверка наличия формы

    editForm.querySelector('#edit-id').value = product._id;
    editForm.querySelector('#edit-name').value = product.name;
    editForm.querySelector('#edit-category').value = product.category;
    editForm.querySelector('#edit-description').value = product.description;
    editForm.querySelector('#edit-price').value = product.price;
    editForm.querySelector('#edit-seller').value = product.seller;
    editForm.querySelector('#edit-quantity').value = product.quantity;

    // Можно автоматически раскрыть форму редактирования при клике
    const editFormContainer = editForm.closest('.func-section__vertical').querySelector('.hidden-form');
    if (editFormContainer && !editFormContainer.classList.contains('visible')) {
        editFormContainer.classList.add('visible');
    }
};

// Delete a product
// Используется на странице админки (вызывается из onclick кнопки)
const deleteProduct = async (id) => {
    if (!confirm(`Вы уверены, что хотите удалить продукт с ID ${id}?`)) {
        return; // Отмена удаления
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        updateResponse({ status: response.status, statusText: response.statusText });

        if (response.ok) {
            alert(`Продукт с ID ${id} успешно удален.`);
            // После удаления обновляем список продуктов на странице админки
            fetchAdminProducts();
            // Очищаем форму редактирования, если в ней был удаленный продукт
            const editIdInput = document.getElementById('edit-id');
            if (editIdInput && editIdInput.value === id) {
                document.getElementById('edit-product-form').reset();
            }

        } else {
            const result = await response.json(); // Получаем ответ сервера с ошибкой
            console.error('Error deleting product:', result.error || response.statusText);
            alert(`Ошибка при удалении продукта: ${result.error || response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        updateResponse(error);
        alert(`Произошла ошибка сети при удалении продукта.`);
    }
};

// Add a new product
// Используется на странице админки
document.getElementById('add-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const addForm = document.getElementById('add-product-form');
    const addErrorsDiv = document.getElementById('add-form-errors');
    if (!addForm || !addErrorsDiv) return;

    addErrorsDiv.innerHTML = ''; // Очищаем предыдущие ошибки

    const product = {
        name: addForm.querySelector('#name').value,
        category: addForm.querySelector('#category').value,
        description: addForm.querySelector('#description').value,
        price: Number(addForm.querySelector('#price').value),
        seller: addForm.querySelector('#seller').value,
        quantity: Number(addForm.querySelector('#quantity').value),
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        });

        const result = await response.json(); // Ожидаем JSON ответ (успех или ошибки валидации)
        updateResponse({ status: response.status, statusText: response.statusText });

        if (response.ok) { // Статус 200 или 201
            alert('Продукт успешно добавлен!');
            addForm.reset(); // Очищаем форму
            // После добавления обновляем список продуктов на странице админки
            fetchAdminProducts();
        } else {
            // Ошибка (например, 400 ValidationError, 500)
            if (response.status === 400 && result.errors) {
                // Обработка ошибок валидации от express-validator
                let errorHtml = '<ul>';
                result.errors.forEach(err => {
                    // Ошибка express-validator имеет поля param (имя поля), msg (сообщение)
                    errorHtml += `<li>Поле "${err.param}": ${err.msg}</li>`;
                });
                errorHtml += '</ul>';
                addErrorsDiv.innerHTML = `<div style="color: red;">${errorHtml}</div>`;
            } else {
                // Другие ошибки сервера
                addErrorsDiv.innerHTML = `<p style="color: red;">Ошибка: ${result.error || response.statusText}</p>`;
            }
        }
    } catch (error) {
        console.error('Error adding product:', error);
        updateResponse(error);
        addErrorsDiv.innerHTML = `<p style="color: red;">Произошла ошибка сети при добавлении продукта.</p>`;
    }
});

// Edit an existing product
// Используется на странице админки
document.getElementById('edit-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const editForm = document.getElementById('edit-product-form');
    const editErrorsDiv = document.getElementById('edit-form-errors');
    if (!editForm || !editErrorsDiv) return;

    editErrorsDiv.innerHTML = ''; // Очищаем предыдущие ошибки

    const id = editForm.querySelector('#edit-id').value;
    if (!id) {
        editErrorsDiv.innerHTML = `<p style="color: red;">ID продукта для редактирования не указан.</p>`;
        return;
    }

    // Собираем только те поля, которые были изменены или заполнены (исключаем пустые строки)
    const updatedProduct = {};
    const name = editForm.querySelector('#edit-name').value.trim();
    const category = editForm.querySelector('#edit-category').value.trim();
    const description = editForm.querySelector('#edit-description').value.trim();
    const price = editForm.querySelector('#edit-price').value; // Оставим строку для проверки isFloat на бэке
    const seller = editForm.querySelector('#edit-seller').value.trim();
    const quantity = editForm.querySelector('#edit-quantity').value; // Оставим строку для проверки isInt на бэке

    if (name) updatedProduct.name = name;
    if (category) updatedProduct.category = category;
    if (description) updatedProduct.description = description;
    if (price !== '') updatedProduct.price = Number(price); // Пустая строка не парсится как число
    if (seller) updatedProduct.seller = seller;
    if (quantity !== '') updatedProduct.quantity = Number(quantity); // Пустая строка не парсится как число

    // Если нет полей для обновления, кроме ID
    if (Object.keys(updatedProduct).length === 0) {
        editErrorsDiv.innerHTML = `<p style="color: orange;">Нет полей для обновления.</p>`;
        return; // Не отправляем пустой запрос
    }


    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProduct),
        });

        const result = await response.json(); // Ожидаем JSON ответ
        updateResponse({ status: response.status, statusText: response.statusText });

        if (response.ok) {
            alert('Продукт успешно обновлен!');
            editForm.reset(); // Очищаем форму
            // После обновления обновляем список продуктов на странице админки
            fetchAdminProducts();
        } else {
            // Ошибка (400 ValidationError, 404 Not Found, 500)
            if (response.status === 400 && result.errors) {
                // Обработка ошибок валидации
                let errorHtml = '<ul>';
                result.errors.forEach(err => {
                    errorHtml += `<li>Поле "${err.param || 'неизвестно'}": ${err.msg}</li>`;
                });
                errorHtml += '</ul>';
                editErrorsDiv.innerHTML = `<div style="color: red;">${errorHtml}</div>`;
            } else {
                // Другие ошибки
                editErrorsDiv.innerHTML = `<p style="color: red;">Ошибка: ${result.error || response.statusText}</p>`;
            }
        }
    } catch (error) {
        console.error('Error editing product:', error);
        updateResponse(error);
        editErrorsDiv.innerHTML = `<p style="color: red;">Произошла ошибка сети при редактировании продукта.</p>`;
    }
});


// --- Общие функции для всех страниц ---

// Обновляет статус ответа в футере
const updateResponse = (res) => {
    const responseElement = document.getElementById('response-status');
    if (!responseElement) return; // Убедиться, что элемент существует

    let text = "Статус ответа: ";
    if (res instanceof Error) {
        // Если передан объект Error (например, ошибка сети)
        text += `Ошибка сети - ${res.message}`;
        responseElement.style.color = 'red';
    } else if (res && res.status) {
        // Если передан объект Response
        text += `${res.status} ${res.statusText}`;
        if (res.status >= 200 && res.status < 300) {
            responseElement.style.color = 'green';
        } else if (res.status >= 400 && res.status < 500) {
            responseElement.style.color = 'orange';
        } else if (res.status >= 500) {
            responseElement.style.color = 'red';
        } else {
            responseElement.style.color = 'black';
        }
    } else {
        // Другие случаи или начальное состояние
        text += "Ожидание...";
        responseElement.style.color = 'black';
    }

    responseElement.textContent = text;
};


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, на какой мы странице, и запускаем соответствующие функции
    // Используем ID элементов, которые уникальны для каждой страницы или части
    if (document.getElementById('product-list')) {
        // Мы на главной странице
        fetchProducts();
        // Добавляем слушателей для кнопок info и sort, которые есть только на главной
        document.getElementById('os-info-btn')?.addEventListener('click', fetchOSInfo);
        document.getElementById('file-info-btn')?.addEventListener('click', fetchFileInfo);
        document.getElementById('sort-by-category-btn')?.addEventListener('click', () => { fetchSortedProducts('category'); });
        document.getElementById('sort-by-seller-btn')?.addEventListener('click', () => { fetchSortedProducts('seller'); });
        document.getElementById('sort-by-price-btn')?.addEventListener('click', () => { fetchSortedProducts('price'); });
        document.getElementById('sort-by-name-btn')?.addEventListener('click', () => { fetchSortedProducts('name'); });

    }

    if (document.getElementById('admin-product-list')) {
        // Мы на странице админки
        fetchAdminProducts();
        // Добавляем слушателей для форм add/edit, которые есть только на админке
        document.getElementById('add-product-form')?.addEventListener('submit', async (e) => { /* ... ваш код ... */ });
        document.getElementById('edit-product-form')?.addEventListener('submit', async (e) => { /* ... ваш код ... */ });
    }

    // Логика переключения форм входа/регистрации, если находимся на странице Auth
    if (document.getElementById('login-form')) { // Или другой уникальный элемент на auth.ejs
        // Ваш существующий JS код для auth.ejs (переключение форм, обработка submit)
        // Убедитесь, что он вызывается здесь или что он уже в шаблоне auth.ejs
    }

    // Логика контактной формы, если находимся на странице Contact
    if (document.getElementById('contact-form')) { // Или другой уникальный элемент на contact.ejs
        // Ваш существующий JS код для contact.ejs (проверка кнопки, обработка submit)
        // Убедитесь, что он вызывается здесь или что он уже в шаблоне contact.ejs
        updateContactButtonState(); // Вызываем для начальной проверки кнопки
    }


    // Инициализация скрытия/раскрытия форм на всех страницах, где они есть
    let toggleFormContainers = document.querySelectorAll('.toggle-form_container');
    toggleFormContainers.forEach(container => {
        container.addEventListener('click', () => {
            const section = container.closest('.func-section__vertical, .search_section, .filter_section');
            if (section) {
                const hiddenForm = section.querySelector('.hidden-form');
                const arrowIcon = container.querySelector('.arrow-down-icon');
                if (hiddenForm) {
                    hiddenForm.classList.toggle('visible');
                    if (arrowIcon) {
                        arrowIcon.style.transform = hiddenForm.classList.contains('visible') ? 'rotate(180deg)' : 'rotate(0deg)';
                        arrowIcon.style.transition = 'transform 0.5s ease';
                    }
                }
            }
        });
    });

    // Изначальное состояние стрелок
    document.querySelectorAll('.toggle-form_container .arrow-down-icon').forEach(icon => {
        icon.style.transform = 'rotate(0deg)';
        icon.style.transition = 'transform 0.5s ease';
    });

});


// Функция для показа ошибок валидации под полями (опционально, для лучшего UX)
// Можно доработать JS для каждой формы (add, edit, contact, login, register),
// чтобы парсить errors.array() и выводить сообщения рядом с соответствующими полями
// вместо одного блока ошибок. Но текущий вариант с одним блоком тоже допустим по заданию.