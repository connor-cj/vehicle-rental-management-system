import { defineConfig } from "drizzle-kit";

// drizzle-kit automatically loads .env before evaluating this config,
// so DATABASE_URL only ever needs to be set in one place: your .env file.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
