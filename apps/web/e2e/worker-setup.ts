import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// This runs in each worker process to ensure env vars are loaded
// Load .env.local file if it exists (for local development)
if (!process.env.CI) {
  const envPath = resolve(__dirname, "../.env.local");
  if (existsSync(envPath)) {
    // Suppress dotenv messages
    process.env.DOTENV_CONFIG_QUIET = "true";
    // Load env vars - this ensures they're available in worker processes
    config({ path: envPath, override: false });
  }
}
