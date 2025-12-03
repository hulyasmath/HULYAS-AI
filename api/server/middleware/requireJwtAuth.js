const cookies = require('cookie');
const passport = require('passport');
const { isEnabled } = require('@librechat/api');

/**
 * Custom Middleware to handle JWT authentication, with support for OpenID token reuse
 * Switches between JWT and OpenID authentication based on cookies and environment settings
 */
const requireJwtAuth = (req, res, next) => {
  // Check if token provider is specified in cookies
  const cookieHeader = req.headers.cookie;
  const tokenProvider = cookieHeader ? cookies.parse(cookieHeader).token_provider : null;

  // Callback to handle authentication result
  const callback = (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error', error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized', error: info?.message || 'Invalid or missing token' });
    }
    req.user = user;
    next();
  };

  // Use OpenID authentication if token provider is OpenID and OPENID_REUSE_TOKENS is enabled
  if (tokenProvider === 'openid' && isEnabled(process.env.OPENID_REUSE_TOKENS)) {
    return passport.authenticate('openidJwt', { session: false }, callback)(req, res, next);
  }

  // Default to standard JWT authentication
  return passport.authenticate('jwt', { session: false }, callback)(req, res, next);
};

module.exports = requireJwtAuth;
