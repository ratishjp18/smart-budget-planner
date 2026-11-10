// ============================================
// Authentication Middleware
// ============================================

// Check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ error: 'Please login to continue' });
};

// Check if user is NOT logged in (for login/register pages)
const isNotAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.status(400).json({ error: 'Already logged in' });
    }
    return next();
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated
};
