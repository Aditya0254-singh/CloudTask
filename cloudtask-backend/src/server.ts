import { createApp } from "./app";
import { env } from "./config/env";
import { checkDbConnection } from "./config/db";

async function start(): Promise<void> {
  try {
    await checkDbConnection();
    console.log("Connected to PostgreSQL successfully.");
  } catch (err) {
    console.error("Failed to connect to PostgreSQL on startup:", err);
    process.exit(1);
  }

  const app = createApp();

  app.listen(env.port, "0.0.0.0", () => {
    console.log(`CloudTask API listening on 0.0.0.0:${env.port}`);
  });
}

start();
