import mongoose from "mongoose";
import { resolveMongoUri } from "@/lib/env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (process.env.NODE_ENV !== "production") {
  global.mongooseCache = cache;
}

const connectOptions: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 15_000,
  connectTimeoutMS: 15_000,
  maxPoolSize: 10,
};

/**
 * Human-readable hint for dev / support (never leak secrets).
 */
export function hintFromMongoError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);

  if (/ECONNREFUSED|connect ECONNREFUSED/i.test(msg)) {
    return "Connection refused. If using local MongoDB, start the service and use mongodb://127.0.0.1:27017/your-db (not localhost if IPv6 causes issues).";
  }
  if (/authentication failed|bad auth|Invalid credentials/i.test(msg)) {
    return "Wrong database username/password, or password needs encoding. In Atlas: Database Access → reset the DB user password → copy URI from Connect → Drivers. Easiest: put your plain password in MONGODB_PASSWORD and use __PASSWORD__ in MONGODB_URI (see .env.example).";
  }
  if (/querySrv|ENOTFOUND|getaddrinfo/i.test(msg)) {
    return "Could not resolve cluster host. Check the Atlas connection string and your network/DNS.";
  }
  if (/SSL|TLS|certificate/i.test(msg)) {
    return "TLS error. Atlas URIs usually need tls=true (often included). Try the exact string from Atlas → Connect → Drivers.";
  }
  if (/timed out|TIMEOUT|ETIMEDOUT/i.test(msg)) {
    return "Timed out. For Atlas: add your IP under Network Access (or 0.0.0.0/0 for dev). Check firewall/VPN.";
  }

  return msg;
}

export async function connectDB(): Promise<typeof mongoose> {
  const resolved = resolveMongoUri();
  if (!resolved.ok) {
    throw new Error(resolved.error);
  }
  const uri = resolved.uri;

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, connectOptions).then(() => mongoose);
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (err) {
    cache.promise = null;
    cache.conn = null;
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    } catch {
      /* ignore */
    }
    throw err;
  }
}
