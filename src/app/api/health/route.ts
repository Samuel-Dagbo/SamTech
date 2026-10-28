import { connectDB, connectionState } from "@/lib/db";
import { jsonError, jsonOk, logServerError } from "@/lib/http";

export async function GET() {
  try {
    await connectDB();
    return jsonOk({
      status: "ok",
      db: connectionState() === 1 ? "connected" : `state-${connectionState()}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logServerError("health", error);
    return jsonError(503, "Database unavailable");
  }
}
