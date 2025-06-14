// backend\middlewares\auth.js
const authMiddleware = (req, res, next) => {
    // Проверяем, есть ли информация о пользователе в сессии
    if (req.session && req.session.user) {
        // Если пользователь авторизован, передаем запрос дальше
        next();
    } else {
        // Если пользователь не авторизован, отправляем статус 401 и перенаправляем на страницу входа
        // Добавляем originUrl в query для возможного редиректа обратно после входа (опционально)
        res.status(401).redirect(`/auth?error=${encodeURIComponent('Требуется авторизация')}&origin=${encodeURIComponent(req.originalUrl)}`);
    }
};

module.exports = authMiddleware;