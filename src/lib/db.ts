import "server-only";
import mongoose from "mongoose";
import { getEnv } from "./env";

/**
 * Cached Mongoose connection shared across serverless invocations.
 * One connection per warm Lambda/container; never connects per request.
 */

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as { __samtechMongoose?: MongooseCache };
const cache: MongooseCache = globalForMongoose.__samtechMongoose ?? { conn: null, promise: null };
globalForMongoose.__samtechMongoose = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const uri = getEnv().MONGODB_URI;
    cache.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8_000,
        maxPoolSize: 10,
      })
      .then((connection) => {
        cache.conn = connection;
        return connection;
      })
      .catch((error) => {
        // Allow a later invocation to retry instead of caching the failure.
        cache.promise = null;
        throw error;
      });
  }

  return cache.promise;
}

export function connectionState(): number {
  return mongoose.connection.readyState;
}
