// Runs before every test file (see jest.config.js `setupFiles`).
//
// The whole suite makes hundreds of requests from one address inside a single
// 15-minute window, which would trip the general API rate limiter part way
// through. Raise its ceiling for tests. The auth limiter keeps its real value,
// and rateLimit.test.js checks the general limiter against a low ceiling.
//
// Assigned unconditionally: the Compose file sets API_RATE_LIMIT_MAX for the
// running server, and inheriting that here would test against the production
// ceiling instead.
process.env.API_RATE_LIMIT_MAX = "100000";
