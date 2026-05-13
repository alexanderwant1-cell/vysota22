function requireAuth(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/admin/login');
    }
    next();
}

function requireLogout(req, res, next) {
    if (req.session.isAuthenticated) {
        return res.redirect('/admin/dashboard');
    }
    next();
}

module.exports = { requireAuth, requireLogout };
