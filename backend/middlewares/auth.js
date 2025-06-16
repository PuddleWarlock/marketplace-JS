
const authMiddleware = (req, res, next) => {

    if (req.session && req.session.user) {

        next();
    } else {


        res.status(401).redirect(`/auth?error=${encodeURIComponent('Требуется авторизация')}&origin=${encodeURIComponent(req.originalUrl)}`);
    }
};

module.exports = authMiddleware;