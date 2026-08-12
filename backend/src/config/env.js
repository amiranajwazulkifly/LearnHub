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
};

module.exports = env;
