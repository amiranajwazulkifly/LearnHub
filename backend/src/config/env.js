const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const requiredVariables = [
  "DATABASE_URL",
  "JWT_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`${variable} is missing from the .env file`);
  }
}

function positiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// "1" -> 1 hop, "true" -> true, anything else (e.g. "loopback") passes through.
function parseTrustProxy(value) {
  if (/^\d+$/.test(value)) return Number(value);
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5001,
  databaseUrl: process.env.DATABASE_URL,
  // CLIENT_URL is an older/alternate name for the same thing; FRONTEND_URL
  // (the var actually set in .env) takes priority.
  clientUrl: process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5175",
  frontendUrl: process.env.FRONTEND_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  supabaseUrl: process.env.SUPABASE_URL,
  // Only differs from supabaseUrl in Docker: the backend uploads via the
  // internal container network (SUPABASE_URL, e.g. http://storage-gateway:8000),
  // but public file URLs handed to the browser need the host-reachable
  // address instead. Outside Docker these are the same value.
  supabasePublicUrl: process.env.SUPABASE_PUBLIC_URL || process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Requests per client IP per 15 minutes.
  apiRateLimitMax: positiveInt(process.env.API_RATE_LIMIT_MAX, 1000),
  authRateLimitMax: positiveInt(process.env.AUTH_RATE_LIMIT_MAX, 20),

  // Express `trust proxy`. Leave unset when the API is reached directly (the
  // default Compose setup): trusting X-Forwarded-For without a proxy lets any
  // client forge its IP and walk around the rate limiter. Set it to the
  // number of proxy hops (e.g. 1) when deploying behind a load balancer, or
  // every user will share the proxy's single rate-limit bucket.
  trustProxy: process.env.TRUST_PROXY ? parseTrustProxy(process.env.TRUST_PROXY) : false,
};

module.exports = env;
