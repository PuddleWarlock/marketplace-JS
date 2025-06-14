Извините, моя предыдущая корректировка EJS шаблонов была не совсем верной. Я добавил элементы `.content_side__left`, `.content_center`, `.content_side__right` во *все* страницы, включая те, которые должны быть одноколоночными. При этом CSS для одноколоночных макетов скрывал боковые колонки, но поскольку контент этих страниц был помещен внутрь тех *скрытых* боковых колонок, он тоже пропадал.

Чтобы решить эту проблему, нужно вернуть структуру шаблонов `auth.ejs`, `contact.ejs`, `404.ejs`, `error.ejs` к состоянию без этих колоночных оберток, а затем скорректировать CSS, чтобы центрировать непосредственно *секции* (`.func-section__vertical`) на этих одноколоночных страницах.

Вот обновленные файлы:

**1. `backend\views\layout.ejs`** (без изменений относительно предыдущего шага, но для полноты)

```ejs
﻿<!-- backend\views\layout.ejs -->
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Проект | <%= locals.title %></title> <!-- Используем locals для доступа к переменным -->
    <link rel="stylesheet" href="/styles.css">
    <!-- Добавляем опциональные специфичные стили для страницы, если они нужны -->
    <% if (locals.pageStyles) { %>
        <link rel="stylesheet" href="/<%= locals.pageStyles %>">
    <% } %>
</head>
<body>

<header>
    <h1><%= locals.title %></h1>
    <%- include('partials/navigation', { user: locals.user }) %> <!-- Включаем навигацию, передаем user из locals -->
</header>

<main class="container">
    <%
    // Определяем CSS класс для макета контента в зависимости от страницы
    let contentLayoutClass = '';
    if (locals.pageTemplate === 'pages/auth') {
        contentLayoutClass = 'auth-page-layout';
    } else if (locals.pageTemplate === 'pages/contact') {
        contentLayoutClass = 'contact-page-layout';
    } else if (locals.pageTemplate === 'pages/404') {
        contentLayoutClass = 'not-found-page-layout';
    } else if (locals.pageTemplate === 'pages/error') {
        contentLayoutClass = 'error-page-layout';
    }
    // Класс для 3-х колоночного макета (index, admin) не добавляется к самому .content,
    // так как 3-х колоночная структура определяется div'ами внутри .content на этих страницах.
    %>
    <div class="content <%= contentLayoutClass %>"> <!-- Добавляем класс, только если он есть -->
        <!-- Включаем содержимое страницы. Шаблон страницы ДОЛЖЕН содержать нужную структуру колонок ИЛИ просто блоки контента -->
        <%- include(locals.pageTemplate, locals) %>
    </div>
</main>

<footer>
    <p>© Проект КБ-14 <%= new Date().getFullYear() %></p>
    <p class="response" id="response-status">Статус ответа: Ожидание...</p>
    <!-- Кнопка обновления списка продуктов/данных - видна только на главной и админке -->
    <% if (locals.pageTemplate === 'pages/index' || locals.pageTemplate === 'pages/admin') { %>
        <button class="button__refresh"> <!-- Убрал onclick, будет в script.js -->
            <img class="refresh-icon" src="/icons/refresh-ccw.svg" alt="Обновить">
        </button>
    <% } %>
</footer>

<script src="/script.js"></script>
<% if (locals.pageScripts) { %>
    <script src="/<%= locals.pageScripts %>"></script>
<% } %>
</body>
</html>
```

**2. `backend\views\pages\index.ejs`** (без изменений относительно предыдущего шага)

```ejs
﻿<!-- backend\views\pages\index.ejs -->
<!-- Содержимое главной страницы -->

<% /* Этот шаблон включится внутрь <div class="content"> в layout.ejs */ %>

<div class="content_side__left">
    <!-- Блок 1: Информация о системе -->
    <section class="info-block func-section__vertical sticky">
        <h2>Информация о системе</h2>
        <div class="info_buttons">
            <button id="os-info-btn" class="button__info">OS Info</button>
            <button id="file-info-btn" class="button__info">File Info</button>
        </div>
        <div id="info-display"></div>
    </section>

    <!-- Блок 2: Дополнительная информация (пример) -->
    <section class="info-block func-section__vertical">
        <h2>Свежие новости</h2>
        <p>Читайте последние новости о наших обновлениях и специальных предложениях.</p>
        <p><a href="#">Читать подробнее...</a></p>
    </section>

    <!-- Блок 3: Еще один информационный блок -->
    <section class="info-block func-section__vertical">
        <h2>О нас</h2>
        <p>Мы молодая и амбициозная команда, стремящаяся сделать онлайн-покупки максимально удобными и безопасными.</p>
        <p>Присоединяйтесь к нам!</p>
    </section>

</div>
<div class="content_center">
    <!-- Блок 4: Поиск продукта -->
    <section class="func-section__vertical search_section">
        <div class="toggle-form_container drop-down interactive">
            <h2 class="toggle-form_header search_header">Поиск продукта</h2>
            <img src="/icons/chevron-down.svg" class="arrow-down-icon" alt="">
        </div>
        <div class="search hidden-form hidden-form__horizontal">
            <input type="text" id="search-id" placeholder="ID продукта">
            <img src="/icons/scan-search.svg" class="search-icon interactive" alt="Найти">
        </div>
    </section>

    <!-- Блок 5: Фильтр по цене -->
    <section class="func-section__vertical filter_section">
        <div class="toggle-form_container drop-down interactive">
            <h2 class="toggle-form_header">Фильтр по цене</h2>
            <img src="/icons/chevron-down.svg" class="arrow-down-icon" alt="">
        </div>
        <div class="hidden-form__vertical hidden-form filter">
            <label class="input-container">
                <span>От</span>
                <input type="number" id="min-price" placeholder="Мин. цена">
            </label>
            <label class="input-container">
                <span>До</span>
                <input type="number" id="max-price" placeholder="Макс. цена">
            </label>
            <button id="filter-price-btn">Применить фильтр</button> <% /* Добавляем ID для обработчика в JS */ %>
        </div>
    </section>

    <!-- Блок 6: Сортировка -->
    <section class="func-section__vertical sort_section">
        <h2>Сортировка</h2>
        <div class="sort-buttons">
            <button id="sort-by-category-btn">По категории</button>
            <button id="sort-by-seller-btn">По продавцу</button>
            <button id="sort-by-price-btn">По цене</button>
            <button id="sort-by-name-btn">По имени</button>
            <button id="sort-by-quantity-btn">По количеству</button>
            <button id="sort-by-created-btn">По дате добавления</button>
            <button id="sort-by-updated-btn">По дате обновления</button>
        </div>
    </section>

    <!-- Блок 7: Список продуктов -->
    <section class="products-section func-section__vertical">
        <h2>Список продуктов</h2>
        <div id="product-list" class="product-grid">
            <!-- Продукты будут добавлены сюда скриптом fetchProducts -->
            <p>Загрузка продуктов...</p>
        </div>
    </section>

</div>
<div class="content_side__right">
    <!-- Блок 8: Блок полезной информации 1 -->
    <section class="info-block func-section__vertical">
        <h2>Почему выбирают нас?</h2>
        <p>Мы предлагаем лучшие цены и широкий ассортимент товаров.</p>
        <img src="/images/quality.jpg" alt="Качество" class="info-image">
        <p>Высокое качество продукции гарантировано.</p>
    </section>

    <!-- Блок 9: Блок полезной информации 2 -->
    <section class="info-block func-section__vertical">
        <h2>Быстрая доставка</h2>
        <p>Оперативно доставляем заказы по всей стране.</p>
        <img src="/images/delivery.jpg" alt="Доставка" class="info-image">
        <p>Сроки доставки минимальны.</p>
    </section>

    <!-- Блок 10: Блок полезной информации 3 -->
    <section class="info-block func-section__vertical">
        <h2>Поддержка клиентов 24/7</h2>
        <p>Наша служба поддержки всегда готова помочь.</p>
        <p>Звоните или пишите нам в любое время!</p>
    </section>

</div>
```

**3. `backend\views\pages\admin.ejs`** (без изменений относительно предыдущего шага)

```ejs
﻿<!-- backend\views\pages\admin.ejs -->
<!-- Содержимое страницы администратора -->

<% /* Этот шаблон включится внутрь <div class="content"> в layout.ejs */ %>

<div class="content_side__left">
    <!-- Блок 1: Админ меню / Ссылки -->
    <section class="admin-menu func-section__vertical sticky">
        <h2>Администрирование</h2>
        <ul>
            <li><a href="#add-product-form-section">Добавить продукт</a></li>
            <li><a href="#edit-product-form-section">Редактировать продукт</a></li>
            <li><a href="#admin-product-list-section">Список продуктов</a></li>
            <li><a href="#contact-messages-section">Сообщения обратной связи</a></li>
            <li><a href="#users-list-section">Пользователи</a></li>
            <li><a href="/logs/requests.log" target="_blank">Логи запросов</a></li>
            <li><a href="/logs/errors.log" target="_blank">Логи ошибок</a></li>
        </ul>
    </section>
    <!-- Блок 2: Статистика -->
    <section class="admin-stats func-section__vertical">
        <h2>Статистика</h2>
        <p>Всего продуктов: <span id="total-products">-</span></p>
        <p>Всего пользователей: <span id="total-users">-</span></p>
        <p>Всего сообщений: <span id="total-messages">-</span></p> <!-- Исправил ID и текст -->
    </section>
</div>
<div class="content_center">
    <h2>Панель администратора</h2>

    <!-- Блок 3: Форма добавления продукта -->
    <section id="add-product-form-section" class="func-section__vertical">
        <div class="toggle-form_container drop-down interactive">
            <h2 class="toggle-form_header">Добавить продукт</h2>
            <img src="/icons/chevron-down.svg" class="arrow-down-icon" alt="">
        </div>
        <form id="add-product-form" class="hidden-form__vertical hidden-form">
            <label class="input-container">
                <span>Название</span>
                <input type="text" id="name" placeholder="Название" required>
            </label>
            <label class="input-container">
                <span>Категория</span>
                <input type="text" id="category" placeholder="Категория" required>
            </label>
            <label class="input-container">
                <span>Описание</span>
                <input type="text" id="description" placeholder="Описание"> <!-- Описание не обязательное -->
            </label>
            <label class="input-container">
                <span>Цена</span>
                <input type="number" id="price" placeholder="Цена" required min="0.01" step="0.01"> <!-- Валидация в HTML -->
            </label>
            <label class="input-container">
                <span>Продавец</span>
                <input type="text" id="seller" placeholder="Продавец" required>
            </label>
            <label class="input-container">
                <span>Количество</span>
                <input type="number" id="quantity" placeholder="Количество" required min="0" step="1"> <!-- Валидация в HTML -->
            </label>
            <button type="submit">Добавить продукт</button>
            <div id="add-form-errors" class="errors-display"></div>
            <div id="add-form-success" class="success-display"></div> <!-- Добавил div для успеха -->
        </form>
    </section>

    <!-- Блок 4: Форма редактирования продукта -->
    <section id="edit-product-form-section" class="func-section__vertical">
        <div class="toggle-form_container drop-down interactive">
            <h2 class="toggle-form_header">Редактировать продукт</h2>
            <img src="/icons/chevron-down.svg" class="arrow-down-icon" alt="">
        </div>
        <form id="edit-product-form" class="hidden-form__vertical hidden-form">
            <label class="input-container">
                <span>ID</span>
                <input type="text" id="edit-id" placeholder="ID продукта" required readonly>
            </label>
            <label class="input-container">
                <span>Название</span>
                <input type="text" id="edit-name" placeholder="Новое название">
            </label>
            <label class="input-container">
                <span>Категория</span>
                <input type="text" id="edit-category" placeholder="Новая категория">
            </label>
            <label class="input-container">
                <span>Описание</span>
                <input type="text" id="edit-description" placeholder="Новое описание">
            </label>
            <label class="input-container">
                <span>Цена</span>
                <input type="number" id="edit-price" placeholder="Новая цена" min="0.01" step="0.01">
            </label>
            <label class="input-container">
                <span>Продавец</span>
                <input type="text" id="edit-seller" placeholder="Новый продавец">
            </label>
            <label class="input-container">
                <span>Количество</span>
                <input type="number" id="edit-quantity" placeholder="Новое количество" min="0" step="1">
            </label>
            <button type="submit">Сохранить изменения</button>
            <div id="edit-form-errors" class="errors-display"></div>
            <div id="edit-form-success" class="success-display"></div> <!-- Добавил div для успеха -->
        </form>
    </section>

    <!-- Блок 5: Список продуктов для выбора (для редактирования/удаления) -->
    <section id="admin-product-list-section" class="products-section func-section__vertical">
        <h2>Продукты</h2>
        <p>Кликните по карточке продукта в списке ниже, чтобы автоматически заполнить форму редактирования.</p>
        <div id="admin-product-list" class="product-grid">
            <!-- Продукты будут добавлены сюда скриптом fetchAdminProducts -->
            <p>Загрузка продуктов...</p>
        </div>
    </section>

    <!-- Блок 6: Сообщения обратной связи -->
    <section id="contact-messages-section" class="func-section__vertical">
        <h2>Сообщения обратной связи</h2>
        <div id="contact-messages-list"> <!-- Здесь будет список сообщений -->
            <p>Загрузка сообщений...</p>
        </div>
    </section>

    <!-- Блок 7: Управление пользователями -->
    <section id="users-list-section" class="func-section__vertical">
        <h2>Пользователи</h2>
        <div id="users-list-container"> <!-- Здесь будет список пользователей -->
            <p>Загрузка пользователей...</p>
        </div>
    </section>

</div>
<div class="content_side__right">
    <!-- Блок 8: Инструкции для админа -->
    <section class="info-block func-section__vertical sticky">
        <h2>Инструкции</h2>
        <p>Используйте формы в центре для добавления и редактирования продуктов.</p>
        <p>Для удаления продукта, кликните по нему в списке и нажмите кнопку "Удалить" на карточке.</p>
        <p>Просматривайте сообщения пользователей и список зарегистрированных пользователей ниже.</p>
    </section>
</div>
```

**4. `backend\views\pages\auth.ejs`** (Удалены колоночные обертки)

```ejs
﻿<!-- backend\views\pages\auth.ejs -->
<!-- Содержимое страницы входа и регистрации -->

<% /* Этот шаблон включится внутрь <div class="content auth-page-layout"> в layout.ejs */ %>

<% /* Боковые колонки скрыты через CSS. Контент центрируется через CSS для func-section__vertical в auth-page-layout */ %>

<!-- Блок для отображения ошибки из URL (редирект сервера) - остается вне секций -->
<div id="page-auth-error" class="errors-display"></div>

<!-- Блок 1: Приветственное сообщение -->
<section class="auth-welcome func-section__vertical sticky">
    <h2>Добро пожаловать!</h2>
    <p>Войдите, чтобы получить доступ к вашему аккаунту, или зарегистрируйтесь, чтобы стать частью нашего сообщества.</p>
</section>

<!-- Блок 2: Преимущества регистрации -->
<section class="auth-benefits func-section__vertical">
    <h2>Почему стоит зарегистрироваться?</h2>
    <ul>
        <li>Доступ к эксклюзивным предложениям и скидкам.</li>
        <li>Быстрое и удобное оформление заказов.</li>
        <li>Сохранение истории покупок и избранных товаров.</li>
        <li>Персонализированные рекомендации товаров.</li>
        <li>Участие в бонусной программе.</li>
    </ul>
</section>

<!-- Блок с формами (входит в центральную область по дизайну) -->
<section class="func-section__vertical"> <% /* Обернем формы в секцию для единообразия стилей */ %>
    <div class="auth-forms-container">
        <!-- Блок 3: Форма входа -->
        <div id="login-form-container">
            <h3>Вход</h3>
            <form id="login-form">
                <label class="input-container">
                    <span>Имя пользователя:</span>
                    <input type="text" id="login-username" required>
                </label>
                <label class="input-container">
                    <span>Пароль:</span>
                    <input type="password" id="login-password" required minlength="6"> <!-- Валидация в HTML -->
                </label>
                <button type="submit">Войти</button>
                <div id="login-errors" class="errors-display"></div> <!-- Ошибки валидации логина -->
                <div id="login-success" class="success-display"></div> <!-- Добавлен div -->
            </form>
            <p>Нет аккаунта? <a href="#" id="show-register-link">Зарегистрироваться</a></p>
        </div>

        <!-- Блок 4: Форма регистрации (скрыта по умолчанию) -->
        <div id="register-form-container" style="display: none;">
            <h3>Регистрация</h3>
            <form id="register-form">
                <label class="input-container">
                    <span>Имя пользователя:</span>
                    <input type="text" id="register-username" required>
                </label>
                <label class="input-container">
                    <span>Пароль:</span>
                    <input type="password" id="register-password" required minlength="6"> <!-- Валидация в HTML -->
                </label>
                <label class="input-container">
                    <span>Повторите пароль:</span>
                    <input type="password" id="register-password2" required minlength="6"> <!-- Валидация в HTML -->
                </label>
                <button type="submit">Зарегистрироваться</button>
                <div id="register-errors" class="errors-display"></div> <!-- Ошибки валидации регистрации -->
                <div id="register-success" class="success-display"></div> <!-- Добавлен div -->
            </form>
            <p>Уже есть аккаунт? <a href="#" id="show-login-link">Войти</a></p>
        </div>
    </div>
</section>

<!-- Блок 5: Информация о конфиденциальности -->
<section class="auth-privacy func-section__vertical sticky">
    <h2>Конфиденциальность</h2>
    <p>Ваши данные надежно защищены. Мы используем современные методы шифрования и не передаем информацию третьим лицам без вашего согласия.</p>
    <p><a href="#">Политика конфиденциальности</a></p>
</section>

<!-- Блок 6: Изображение (пример) -->
<section class="auth-image func-section__vertical">
    <img src="/images/security.jpg" alt="Безопасность">
</section>
```

**5. `backend\views\pages\contact.ejs`** (Удалены колоночные обертки)

```ejs
﻿<!-- backend\views\pages\contact.ejs -->
<!-- Содержимое страницы обратной связи -->

<% /* Этот шаблон включится внутрь <div class="content contact-page-layout"> в layout.ejs */ %>

<% /* Боковые колонки скрыты через CSS. Контент центрируется через CSS для func-section__vertical в contact-page-layout */ %>

<!-- Блок 1: Контактные данные -->
<section class="contact-details func-section__vertical sticky">
    <h2>Наши контакты</h2>
    <p><b>Адрес:</b> ул. Примерная, д. 1, г. Городск, 123456</p>
    <p><b>Телефон:</b> +7 (123) 456-78-90</p>
    <p><b>Email:</b> support@yourmarketplace.com</p>
    <p><b>Время работы:</b> Пн-Пт, 9:00 - 18:00</p>
</section>

<!-- Блок 2: Как нас найти -->
<section class="how-to-find func-section__vertical">
    <h2>Как нас найти</h2>
    <p>Наш офис расположен в центре города, недалеко от станции метро "Центральная".</p>
    <p>Вход в здание с улицы.</p>
</section>

<!-- Блок 3: Форма обратной связи -->
<section id="contact-form-section" class="func-section__vertical">
    <h2>Форма обратной связи</h2>
    <p>Заполните форму, и мы свяжемся с вами в ближайшее время.</p>

    <form id="contact-form">
        <label class="input-container">
            <span>Ваше имя:</span>
            <input type="text" id="contact-name" name="name" required>
        </label>
        <label class="input-container">
            <span>Ваш Email:</span>
            <input type="email" id="contact-email" name="email" required>
        </label>
        <label class="input-container">
            <span>Сообщение:</span>
            <textarea id="contact-message" name="message" rows="6" required></textarea>
        </label>
        <button type="submit" id="contact-submit-btn">Отправить сообщение</button>
        <div id="contact-form-errors" class="errors-display"></div>
        <div id="contact-form-success" class="success-display"></div>
    </form>
</section>

<!-- Блок 4: Часто задаваемые вопросы (FAQ) -->
<section class="faq-section func-section__vertical">
    <h2>Часто задаваемые вопросы</h2>
    <div class="faq-item">
        <h3>Как сделать заказ?</h3>
        <p>Для оформления заказа выберите товар и добавьте его в корзину. Перейдите в корзину и следуйте инструкциям для завершения покупки.</p>
    </div>
    <div class="faq-item">
        <h3>Какие способы оплаты доступны?</h3>
        <p>Мы принимаем оплату банковскими картами Visa, Mastercard, МИР, а также электронными кошельками и банковским переводом.</p>
    </div>
    <div class="faq-item">
        <h3>Могу ли я вернуть товар?</h3>
        <p>Да, вы можете вернуть товар надлежащего качества в течение 14 дней с момента покупки, если он не был в употреблении и сохранены его товарный вид и упаковка.</p>
    </div>
    <div class="faq-item">
         <h3>Сколько стоит доставка?</h3>
         <p>Стоимость доставки зависит от вашего региона и веса заказа. Точная стоимость будет рассчитана при оформлении заказа.</p>
     </div>
    <p>Полный список вопросов и ответов доступен по запросу.</p>
</section>

<!-- Блок 5: Карта -->
<section class="contact-map func-section__vertical sticky">
    <h2>Мы на карте</h2>
    <!-- Placeholder для карты -->
    <div class="map-placeholder">
        <img src="/images/map-placeholder.jpg" alt="Карта">
    </div>
    <p>Нажмите на карту, чтобы открыть в полном размере.</p>
</section>
<!-- Блок 6: Дополнительный текст -->
<section class="info-block func-section__vertical">
    <h2>Свяжитесь с нами</h2>
    <p>Мы всегда рады помочь нашим клиентам.</p>
    <p>Ваше мнение очень важно для нас!</p>
</section>

<!-- JS для контактной формы уже в script.js -->
```

**6. `backend\views\pages\404.ejs`** (Удалены колоночные обертки)

```ejs
﻿<!-- backend\views\pages\404.ejs -->
<!-- Содержимое страницы 404 -->

<% /* Этот шаблон включится внутрь <div class="content not-found-page-layout"> в layout.ejs */ %>

<% /* Боковые колонки скрыты через CSS. Контент центрируется через CSS для func-section__vertical в not-found-page-layout */ %>

<!-- Блок 1: Основное сообщение -->
<section class="func-section__vertical">
    <h2>404 - Страница не найдена</h2>
    <p>Извините, страница, которую вы ищете, не существует или была перемещена.</p>
    <img src="/images/404.jpg" alt="Страница не найдена" class="info-image">
</section>

<!-- Блок 2: Ссылка на главную -->
<section class="func-section__vertical">
    <p>Пожалуйста, перейдите на <a href="/">главную страницу</a>.</p>
</section>


<!-- Блок 3: Поиск -->
<section class="func-section__vertical">
    <h3>Поиск по сайту</h3>
    <p>Попробуйте найти нужную информацию с помощью поиска:</p>
    <div class="search-input-container">
        <input type="text" placeholder="Что ищете?">
        <button>Найти</button>
    </div>
</section>

<!-- Блок 4: Популярные страницы -->
<section class="func-section__vertical">
    <h3>Популярные разделы</h3>
    <p>Возможно, вы ищете один из этих разделов:</p>
    <ul>
        <li><a href="/">Главная</a></li>
        <li><a href="/admin">Панель администратора</a></li>
        <li><a href="/contact">Обратная связь</a></li>
        <li><a href="/auth">Вход / Регистрация</a></li>
        <!-- Добавьте другие важные ссылки, если есть -->
    </ul>
</section>

<!-- Блок 5: Контакты -->
<section class="func-section__vertical">
    <h3>Нужна помощь?</h3>
    <p>Если вы уверены, что страница должна существовать, пожалуйста, <a href="/contact">свяжитесь с нами</a>.</p>
    <p>Мы постараемся помочь!</p>
</section>

<!-- Блок 6: Дополнительная информация (пример) -->
<section class="func-section__vertical">
    <h3>Совет</h3>
    <p>Проверьте правильность написания адреса страницы.</p>
</section>
```

**7. `backend\views\pages\error.ejs`** (Удалены колоночные обертки)

```ejs
﻿<!-- backend\views\pages\error.ejs -->
<!-- Содержимое страницы ошибки -->

<% /* Этот шаблон включится внутрь <div class="content error-page-layout"> в layout.ejs */ %>

<% /* Боковые колонки скрыты через CSS. Контент центрируется через CSS для func-section__vertical в error-page-layout */ %>

<!-- Блок ошибки -->
<section class="func-section__vertical">
    <h2>Ошибка <%= locals.errorStatus || 'Неизвестная' %></h2>
    <p><%= locals.errorMessage || 'Произошла непредвиденная ошибка.' %></p>
    <p>Пожалуйста, попробуйте <a href="javascript:history.back()">вернуться назад</a> или перейдите на <a href="/">главную страницу</a>.</p>
    <!-- Дополнительная информация для отладки (опционально, можно убрать в продакшне) -->
    <% if (process.env.NODE_ENV !== 'production') { %>
        <!-- <pre><%= typeof errorStack !== 'undefined' ? errorStack : 'Стек ошибки недоступен.' %></pre> -->
    <% } %>
</section>

 <!-- Можно добавить другие блоки, как на 404 странице -->
<section class="func-section__vertical">
     <h3>Популярные разделы</h3>
     <p>Возможно, вы ищете один из этих разделов:</p>
     <ul>
         <li><a href="/">Главная</a></li>
         <li><a href="/admin">Панель администратора</a></li>
         <li><a href="/contact">Обратная связь</a></li>
         <li><a href="/auth">Вход / Регистрация</a></li>
     </ul>
 </section>
```

**8. `backend\public\styles.css`** (Скорректированы правила для одноколоночных макетов)

Удалим правила, которые пытались стилизовать `.content_center` в одноколоночных макетах (потому что этого `.content_center` там больше нет). Вместо этого добавим правила, которые центрируют *любую секцию* (`.func-section__vertical`) внутри `.content`, если у `.content` есть соответствующий одноколоночный класс макета.

```css
/* backend\public\styles.css */

/* --- Общие стили --- */
* {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    box-sizing: border-box;
}

body {
    background-color: #f1f1f1;
    color: #333;
    line-height: 1.6;
}

h1, h2, h3 {
    margin-bottom: 15px;
    color: #0056b3;
}

h1 { font-size: 2em; }
h2 { font-size: 1.6em; }
h3 { font-size: 1.3em; }

p {
    margin-bottom: 10px;
}

a {
    color: #007bff;
    text-decoration: none;
    transition: color 0.3s ease;
}

a:hover {
    color: #0056b3;
    text-decoration: underline;
}

img {
    max-width: 100%;
    height: auto;
    display: block;
}


/* --- Шапка --- */
header{
    background-color: #e9e9e9;
    padding: 15px 20px;
    text-align: center;
    margin-bottom: 30px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

header h1 {
    background-color: inherit;
    margin-bottom: 10px;
    color: #0056b3;
}

/* --- Навигация --- */
nav ul {
    padding: 0;
    list-style: none;
    display: flex;
    justify-content: center;
    gap: 20px;
    background-color: inherit;
    flex-wrap: wrap;
}

nav li {
    background-color: inherit;
}

nav a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 4px;
    transition: color 0.3s ease, background-color 0.3s ease;
    background-color: inherit;
}

nav a:hover {
    color: #fff;
    background-color: #007bff;
    text-decoration: none;
}


/* --- Основной контейнер контента --- */
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px; /* Padding inside the centered container */
}

/* --- Макет контента (Grid) --- */
/* Контейнер Grid, который находится внутри .container */
.content {
    display: grid;
    /* Определяем колонки для 3-х колоночного макета по умолчанию */
    grid-template-columns: 280px 1fr 280px;
    gap: 30px; /* Промежутки между колонками */
    background-color: #f1f1f1; /* Фон на уровне сетки */
    width: 100%; /* Убедимся, что сетка занимает всю ширину родителя (.container) */
}

/* Специальный Grid для страниц без боковых панелей (одна колонка) */
.content.auth-page-layout,
.content.contact-page-layout,
.content.not-found-page-layout,
.content.error-page-layout {
    grid-template-columns: 1fr; /* Одна центральная колонка */
    gap: 20px; /* Промежутки между секциями в одной колонке */
    /* Padding уже на .container, не нужно здесь */
}

/* Скрываем боковые колонки на страницах с классом layout */
.content.auth-page-layout .content_side__left,
.content.auth-page-layout .content_side__right,
.content.contact-page-layout .content_side__left,
.content.contact-page-layout .content_side__right,
.content.not-found-page-layout .content_side__left,
.content.not-found-page-layout .content_side__right,
.content.error-page-layout .content_side__left,
.content.error-page-layout .content_side__right {
    display: none; /* Полностью скрываем боковые колонки */
}

/* Стили для самих контейнеров колонок (существуют только в 3-х колоночном макете) */
.content_side__left,
.content_center,
.content_side__right {
    background-color: inherit; /* Наследует фон родителя (.content) */
    /* Убираем padding с самих колонок, padding будет на внутренних секциях */
    padding: 0;
}

/* УБИРАЕМ ПРАВИЛА ДЛЯ .content_center В ОДНОКОЛОНОЧНЫХ МАКЕТАХ */
/* .content.auth-page-layout .content_center, */
/* .content.contact-page-layout .content_center, */
/* .content.not-found-page-layout .content_center, */
/* .content.error-page-layout .content_center { */
/*     grid-column: 1 / -1; */
/*     display: block; */
/*     align-items: initial; */
/*     padding: 0; */
/*     max-width: 600px; */
/*     margin-left: auto; */
/*     margin-right: auto; */
/*     width: 100%; */
/* } */


/* --- Стили для секций/блоков --- */
.func-section__vertical {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    padding: 15px; /* Внутренний отступ секции */
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff; /* Явный белый фон для секций */
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    /* Убедимся, что секция занимает всю доступную ширину родителя (колонки) */
    width: 100%;
    box-sizing: border-box; /* Учитываем padding и border в ширине */
}
.func-section__vertical:last-child {
    margin-bottom: 0;
}

.func-section__vertical h2,
.func-section__vertical h3 {
    background-color: inherit;
    margin-bottom: 10px;
    color: #555;
}

.func-section__vertical label span {
    background-color: inherit;
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 0.9em;
    color: #555;
}

/* Стили для полей ввода и текстовых областей */
.func-section__vertical input[type="text"],
.func-section__vertical input[type="number"],
.func-section__vertical input[type="email"],
.func-section__vertical input[type="password"],
.func-section__vertical textarea {
    border: 1px solid #ccc;
    min-height: 40px;
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 8px 10px;
    width: 100%;
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1em;
}

.func-section__vertical textarea {
    resize: vertical;
    min-height: 80px;
}


/* --- Стили для кнопок --- */
button{
    border: none;
    background-color: #007bff;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    height: 38px;
    padding: 0 20px;
    margin: 5px 0;
    cursor: pointer;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
    font-size: 1em;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
}

button:hover{
    background-color: #0056b3;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}
button:active{
    background-color: #003f7f;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    box-shadow: none;
    color: #666;
}

button img {
    background-color: transparent;
    width: 24px;
    height: 24px;
}


/* --- Иконки --- */
.search-icon, .arrow-down-icon {
    width: 30px;
    height: 30px;
    cursor: pointer;
    transition: transform 0.3s ease;
    background-color: transparent;
    margin: 0 10px;
}
.search-icon:hover{ transform: scale(1.1); }
.search-icon:active{ transform: scale(0.9); }

.arrow-down-icon {
    margin-right: 10px;
    transform: rotate(0deg);
    transition: transform 0.5s ease;
    background-color: transparent;
}
.arrow-down-icon.rotated {
    transform: rotate(180deg);
}

.trash-icon, .refresh-icon {
    background-color: transparent;
    width: 24px;
    height: 24px;
    vertical-align: middle;
}


/* --- Специальные блоки и формы --- */
.search {
    display: flex;
    align-items: center;
    background-color: inherit;
    padding: 0 10px 10px 10px;
}
.search input {
    flex-grow: 1;
    margin: 0 10px 0 0;
}

.toggle-form_container {
    padding: 10px 15px;
    border-bottom: 1px solid #eee;
    margin-bottom: 10px;
    background-color: inherit;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.3s ease;
}
.toggle-form_container:hover {
    background-color: #f9f9f9;
}
.toggle-form_container h2 {
    margin: 0;
    background-color: inherit;
    flex-grow: 1;
    font-size: 1.3em;
    color: #333;
}


.hidden-form__vertical,
.hidden-form__horizontal {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.5s ease-out;
    padding: 0 15px; /* Padding внутри скрываемого блока */
    background-color: inherit;
}
/* Убираем padding-bottom при скрытой форме */
.hidden-form__vertical:not(.visible),
.hidden-form__horizontal:not(.visible) {
    padding-bottom: 0;
}


.hidden-form.visible {
    max-height: 1000px; /* Достаточно большое значение для показа */
    transition: max-height 0.5s ease-in;
    padding-bottom: 15px; /* Возвращаем padding-bottom при показе */
}

/* --- Липкие элементы --- */
.sticky {
    position: sticky;
    top: 20px;
    z-index: 10;
    /* background-color: #f1f1f1; /* Фон sticky блока, может перекрывать контент */
    padding-bottom: 10px; /* Отступ снизу, чтобы контент не прилипал к футеру при прокрутке */
    margin-bottom: 0 !important; /* Убираем стандартный margin-bottom у секции */
}
.sticky .func-section__vertical {
    margin-bottom: 0; /* Убираем margin-bottom у секции внутри sticky */
}
/* Добавим фон sticky блока, если нужно явно */
/* Эти правила применяются к ОБЕРТКАМ колонок, которые существуют только в 3-х колоночном макете */
.content_side__left .sticky,
.content_side__right .sticky {
    background-color: #f1f1f1; /* Фон колонки, а не секции */
}
/* Для одноколоночных макетов, где нет оберток колонок, фон sticky будет у .content */
.content.auth-page-layout .sticky,
.content.contact-page-layout .sticky,
.content.not-found-page-layout .sticky,
.content.error-page-layout .sticky {
    background-color: #f1f1f1; /* Или цвет фона страницы, если он другой */
}


/* --- Футер --- */
footer {
    background-color: #e9e9e9;
    padding: 20px;
    margin-top: 40px;
    position: relative;
    min-height: 60px;
    text-align: center;
    box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

footer p {
    background-color: inherit;
    margin: 0;
    font-size: 0.9em;
    color: #555;
}

.response {
    flex-grow: 1;
    text-align: left;
    min-width: 250px;
}

.button__refresh {
    width: 40px;
    height: 40px;
    margin: 0;
    padding: 0;
    background-color: #28a745;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
}
.button__refresh:hover { background-color: #218838; box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15); }
.button__refresh:active { background-color: #1e7e34; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); }

.button__refresh img {
    transition: transform 0.5s ease;
}

.button__refresh:hover .refresh-icon {
    transform: rotate(-180deg);
}


/* --- Стили для кнопки удаления --- */
.button__delete{
    width: auto;
    margin-top: 10px;
    padding: 8px 15px;
    background-color: #dc3545;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
}

.button__delete:hover{ background-color: #c82333; }
.button__delete:active{ background-color: #bd2130; }
.button__delete .trash-icon { background-color: transparent; }


/* --- Стили для блоков информации (sidebar blocks) --- */
.info-block {
    /* Использует стили func-section__vertical */
}
.info-image {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 10px auto;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}


/* --- Стили для отображения информации OS/File --- */
#info-display {
    margin-top: 15px;
    padding: 10px;
    background-color: #e9ecef;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 0.9em;
    overflow-x: auto;
}
#info-display h3 {
    margin-top: 0;
    background-color: inherit;
    color: #555;
    font-size: 1.1em;
}
#info-display pre {
    background-color: inherit;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 0.85em;
}


/* --- Стили для блоков ошибок и успеха --- */
.errors-display,
.success-display {
    margin-top: 15px;
    padding: 15px;
    border-radius: 4px;
    font-size: 0.9em;
    line-height: 1.5;
}
/* Правило для полного скрытия, если контента нет */
.errors-display:empty,
.success-display:empty {
    padding: 0;
    border: none;
    margin-top: 0;
    margin-bottom: 0;
    min-height: 0;
    overflow: hidden;
    display: none; /* Полностью скрываем пустой блок */
}


.errors-display {
    border: 1px solid #f5c6cb;
    background-color: #f8d7da;
    color: #721c24;
}
.errors-display ul {
    list-style: inside;
    padding-left: 0;
    background-color: inherit;
    margin: 0;
}
.errors-display li {
    margin-bottom: 5px;
    background-color: inherit;
}
.errors-display li:last-child {
    margin-bottom: 0;
}


.success-display {
    border: 1px solid #c3e6cb;
    background-color: #d4edda;
    color: #155724;
}
.success-display p {
    margin: 0;
    background-color: inherit;
}


/* --- Стили для одноколоночных макетов (Auth, Contact, 404, Error) --- */
/* Применяются к СЕКЦИЯМ (.func-section__vertical) внутри этих макетов */
.content.auth-page-layout .func-section__vertical,
.content.contact-page-layout .func-section__vertical,
.content.not-found-page-layout .func-section__vertical,
.content.error-page-layout .func-section__vertical {
    max-width: 600px; /* Ограничиваем максимальную ширину */
    margin-left: auto;
    margin-right: auto; /* Центрируем секцию */
    width: 100%; /* Занимает всю доступную ширину до max-width */
    /* padding и другие стили наследуются от .func-section__vertical */
}

/* Специальное правило для контейнера форм авторизации внутри его секции */
.auth-page-layout .auth-forms-container {
     /* Отменяем центрирование и max-width, которое могло быть унаследовано от .func-section__vertical,
        и применяем свои размеры и центрирование ВНУТРИ секции */
    max-width: 400px; /* Своя ограниченная ширина */
    margin-left: auto;
    margin-right: auto; /* Центрируем контейнер форм внутри секции */
    width: 100%;
    /* padding, border, background-color и shadow наследуются или задаются напрямую */
}


/* Дополнительные стили для Auth Page */
/* Эти блоки теперь являются прямыми потомками .content.auth-page-layout и центрируются правилом выше */
/* .auth-page-layout .auth-forms-container { ... } */ /* Перенесено выше */
/* ... (остальные стили для auth-page-layout без изменений, т.к. они применяются к элементам ВНУТРИ секций) */


/* Дополнительные стили для Contact Page */
/* Эти блоки теперь являются прямыми потомками .content.contact-page-layout и центрируются правилом выше */
/* .contact-page-layout .contact-details p b { ... } */
/* ... (остальные стили для contact-page-layout без изменений) */


/* Стили для страниц 404 и ошибки */
/* Эти блоки теперь являются прямыми потомками .content.not-found-page-layout/.error-page-layout и центрируются правилом выше */
/* .not-found-page-layout section, .error-page-layout section { ... } */
/* ... (остальные стили для 404/error без изменений) */


/* --- Стили для списков в админке (сообщения, пользователи) --- */
.message-item, .user-item {
    border: 1px solid #eee;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 4px;
    background-color: #f9f9f9;
}
.message-item:last-child, .user-item:last-child {
    margin-bottom: 0;
}
.message-item p, .user-item p {
    margin: 5px 0;
    background-color: inherit;
    font-size: 0.95em;
}
.message-item p b, .user-item p b {
    background-color: inherit;
}

.admin-menu ul {
    list-style: none;
    padding: 0;
    background-color: inherit;
}
.admin-menu li {
    margin-bottom: 10px;
    background-color: inherit;
}
.admin-menu a {
    color: #555;
    font-weight: normal;
}
.admin-menu a:hover {
    color: #007bff;
    text-decoration: underline;
}
.admin-stats p {
    margin-bottom: 5px;
    background-color: inherit;
    font-weight: bold;
}
.admin-stats p span {
    font-weight: normal;
    color: #007bff;
    background-color: inherit;
}


/* Стили для списков внутри блоков (например, преимущества в auth, FAQ в contact) */
/* Применяем только к спискам внутри секций с классом layout, чтобы не затронуть навигацию и т.п. */
/* Эти правила применяются к секциям, которые теперь сами центрируются */
.auth-page-layout .func-section__vertical ul,
.contact-page-layout .func-section__vertical ul,
.not-found-page-layout .func-section__vertical ul,
.error-page-layout .func-section__vertical ul {
    list-style: disc; /* Маркеры списка */
    padding-left: 20px; /* Отступ для маркеров */
    background-color: inherit;
}
/* Отдельное правило для ul внутри faq-item */
.contact-page-layout .faq-item ul {
    list-style: circle; /* Другой тип маркера для вложенных списков */
    padding-left: 20px;
}
.auth-page-layout .func-section__vertical li,
.contact-page-layout .func-section__vertical li,
.not-found-page-layout .func-section__vertical li,
.error-page-layout .func-section__vertical li {
    margin-bottom: 5px;
    background-color: inherit;
}



/* Адаптация макета */
@media (max-width: 1024px) {
    /* Grid для страниц с боковыми панелями (index, admin) */
    /* Переключаемся на одноколоночный макет */
    .content:not(.auth-page-layout):not(.contact-page-layout):not(.not-found-page-layout):not(.error-page-layout) {
        grid-template-columns: 1fr; /* На узких экранах - одна колонка */
        gap: 20px; /* Промежутки между блоками (бывшими колонками) */
        padding: 0 15px; /* Добавим padding к самому .content для адаптивного режима */
    }
    /* Боковые панели при адаптации для index/admin теперь становятся блоками в одной колонке */
    .content:not(.auth-page-layout):not(.contact-page-layout):not(.not-found-page-layout):not(.error-page-layout) .content_side__left,
    .content:not(.auth-page-layout):not(.contact-page-layout):not(.not-found-page-layout):not(.error-page-layout) .content_side__right,
     /* Центр тоже */
    .content:not(.auth-page-layout):not(.contact-page-layout):not(.not-found-page-layout):not(.error-page-layout) .content_center {
        width: 100%; /* Занимают всю ширину доступную в 1fr колонке */
        order: initial;
         /* Убираем padding с самих колонок при переходе в адаптивный режим */
         padding: 0;
         max-width: none; /* Column takes full 1fr width */
         margin: 0; /* No margin on the column div itself */
    }

     /* Центрируем содержимое секций внутри колонок при переходе в одну колонку (актуально для index/admin в адаптивном режиме) */
     .content:not(.auth-page-layout):not(.contact-page-layout):not(.not-found-page-layout):not(.error-page-layout) .func-section__vertical { /* Применяем к любой секции в этом контексте */
        max-width: 600px; /* Ограничиваем ширину блоков внутри */
        margin-left: auto; /* Center section */
        margin-right: auto;
        width: 100%; /* Убедимся, что занимает доступную ширину до max-width */
        box-sizing: border-box; /* Make sure section padding/border is included in its width */
     }

    .sticky {
        position: static; /* Sticky отключается в адаптивном режиме */
        margin-bottom: 20px; /* Возвращаем margin-bottom */
        padding-bottom: 0;
        background-color: transparent; /* Убираем фон sticky блока */
        z-index: auto;
    }
     /* УБИРАЕМ ФОН СЕКЦИИ ВНУТРИ СТИКИ БЛОКА В АДАПТИВЕ */
     .sticky .func-section__vertical {
         background-color: #fff; /* Секция всегда имеет белый фон */
         margin-bottom: 0;
     }
     /* УБИРАЕМ ФОН ОБЕРТОК КОЛОНОК В АДАПТИВЕ (не существуют в одноколоночных макетах) */
     .content_side__left .sticky,
     .content_side__right .sticky {
         background-color: transparent;
     }
     /* ФОН СТИКИ БЛОКА В ОДНОКОЛОНОЧНЫХ МАКЕТАХ (sticky теперь на секции) */
    .content.auth-page-layout .func-section__vertical.sticky,
    .content.contact-page-layout .func-section__vertical.sticky,
    .content.not-found-page-layout .func-section__vertical.sticky,
    .content.error-page-layout .func-section__vertical.sticky {
         background-color: #fff; /* Секция всегда имеет белый фон */
    }


    /* Специальный Grid для страниц без боковых панелей при адаптации (остается одна колонка) */
    /* Класс content уже центрируется через .container, а content_center внутри него центрируется своими правилами */
    .content.auth-page-layout,
    .content.contact-page-layout,
    .content.not-found-page-layout,
    .content.error-page-layout {
        grid-template-columns: 1fr; /* Остается одна колонка */
        gap: 20px; /* Остается промежуток между секциями */
        padding: 0 15px; /* Остается внутренний отступ */
    }
    /* На этих страницах боковые панели скрыты и при адаптации - правило выше */

}

@media (max-width: 768px) {
    header { padding: 10px 15px; }
    nav ul { gap: 10px; }
    .container { padding: 0 10px; } /* Уменьшаем padding контейнера */
    h1 { font-size: 1.8em; }
    h2 { font-size: 1.4em; }
    h3 { font-size: 1.2em; }

    /* Уменьшаем padding на самом .content в адаптивном режиме */
    .content:not(.auth-page-layout):not(.contact-page-layout):not(.not-found-page-layout):not(.error-page-layout) {
         padding: 0 10px;
    }


     /* Уменьшаем max-width для центрированных блоков на очень маленьких экранах */
    .content.auth-page-layout .func-section__vertical, /* Применяем ко всем секциям в одноколоночных макетах */
    .content.contact-page-layout .func-section__vertical,
    .content.not-found-page-layout .func-section__vertical,
    .content.error-page-layout .func-section__vertical,
    .content:not(.auth-page-layout):not(.contact-page-layout):not(.not-found-page-layout):not(.error-page-layout) .func-section__vertical { /* Применяем ко всем центрируемым блокам в 3-х колоночном макете (в адаптивном режиме) */
        max-width: 100%; /* Занимает всю ширину с учетом padding контейнера */
    }
    /* Уменьшаем внутренний padding секций */
    .func-section__vertical {
         padding: 10px;
    }
     /* Специфический padding для форм авторизации */
    .auth-page-layout .auth-forms-container {
        padding: 15px; /* Уменьшаем padding формы авторизации */
    }
     .hidden-form__vertical,
     .hidden-form__horizontal {
         padding: 0 10px; /* Уменьшаем padding скрываемых форм */
     }
      .hidden-form.visible {
        padding-bottom: 10px;
      }
       .search {
         padding: 0 5px 5px 5px;
       }
}


.arrow-down-icon {
    margin-right: 10px;
    transform: rotate(0deg);
    transition: transform 0.5s ease;
    background-color: transparent;
}
/* Стиль для повернутой стрелки (добавляется JS) */
.arrow-down-icon.rotated {
    transform: rotate(180deg);
}

/* --- Стили для списков в админке (сообщения, пользователи) --- */
.message-item, .user-item {
    border: 1px solid #eee;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 4px;
    background-color: #f9f9f9;
}
.message-item:last-child, .user-item:last-child {
    margin-bottom: 0;
}
.message-item p, .user-item p {
    margin: 5px 0;
    background-color: inherit;
    font-size: 0.95em;
}
.message-item p b, .user-item p b {
    background-color: inherit;
}

.admin-menu ul {
    list-style: none;
    padding: 0;
    background-color: inherit;
}
.admin-menu li {
    margin-bottom: 10px;
    background-color: inherit;
}
.admin-menu a {
    color: #555;
    font-weight: normal;
}
.admin-menu a:hover {
    color: #007bff;
    text-decoration: underline;
}
.admin-stats p {
    margin-bottom: 5px;
    background-color: inherit;
    font-weight: bold;
}
.admin-stats p span {
    font-weight: normal;
    color: #007bff;
    background-color: inherit;
}


/* Стили для списков внутри блоков (например, преимущества в auth, FAQ в contact) */
/* Применяем только к спискам внутри секций с классом layout, чтобы не затронуть навигацию и т.п. */
.auth-page-layout .func-section__vertical ul,
.contact-page-layout .func-section__vertical ul,
.not-found-page-layout .func-section__vertical ul,
.error-page-layout .func-section__vertical ul {
    list-style: disc; /* Маркеры списка */
    padding-left: 20px; /* Отступ для маркеров */
    background-color: inherit;
}
/* Отдельное правило для ul внутри faq-item */
.contact-page-layout .faq-item ul {
    list-style: circle; /* Другой тип маркера для вложенных списков */
    padding-left: 20px;
}
.auth-page-layout .func-section__vertical li,
.contact-page-layout .func-section__vertical li,
.not-found-page-layout .func-section__vertical li,
.error-page-layout .func-section__vertical li {
    margin-bottom: 5px;
    background-color: inherit;
}
```

**9. `backend\public\script.js`** (без изменений относительно предыдущего шага)

```javascript
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
```

**Ключевые изменения:**

*   В `auth.ejs`, `contact.ejs`, `404.ejs`, `error.ejs` удалены обертки `<div class="content_side__left">`, `<div class="content_center">`, `<div class="content_side__right">`. Теперь блоки `<section>` являются прямыми потомками `div.content`.
*   В `styles.css` удалены CSS правила, которые применялись к `.content_center` в одноколоночных макетах. Вместо этого добавлено новое правило, которое центрирует *любой блок секции* (`.func-section__vertical`) в одноколоночном макете (`.content.auth-page-layout .func-section__vertical, ...`).
*   В `auth.ejs` контейнер форм (`.auth-forms-container`) теперь помещен внутрь отдельной `<section class="func-section__vertical">`, чтобы он также получал общие стили секций и центрирование. Его собственные правила для `max-width` и `margin: auto` в `auth-page-layout .auth-forms-container` сохраняются для центрирования контейнера форм *внутри* этой секции.

Теперь:
- `index.ejs` и `admin.ejs` будут использовать 3-х колоночный Grid макет, так как их контент содержит соответствующие divs (`content_side__left`, `content_center`, `content_side__right`), и класс layout не добавляется к `.content`.
- `auth.ejs`, `contact.ejs`, `404.ejs`, `error.ejs` будут использовать 1-колоночный Grid макет, так как к `.content` добавляется соответствующий класс layout, а их контент не содержит div'ов колонок. Секции внутри будут центрироваться правилом, специфичным для этих layout'ов.

Пожалуйста, замените содержимое всех 7 файлов на новые версии. Это должно исправить проблему с отображением контента на одноколоночных страницах и сохранить правильный вид главной страницы и админки.