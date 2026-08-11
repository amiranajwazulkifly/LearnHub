const jwt = require('jsonwebtoken');
const env = require('../config/env');

// issuedAtMs is a custom millisecond-precision claim used for session
// revocation (see authMiddleware). The standard `iat` claim only has
// 1-second resolution, which is too coarse: a login immediately followed
// by a logout in the same second would round-trip to an equal value and
// the revoked token would incorrectly still pass.
function generateToken(user, { issuedAtMs } = {}) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      issuedAtMs: issuedAtMs ?? Date.now(),
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
      algorithm: 'HS256',
    }
  );
}

module.exports = generateToken;
