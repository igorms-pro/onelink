import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function globalSetup() {
  // Load .env.local file if it exists (for local development)
  // In CI, environment variables are set directly
  if (!process.env.CI) {
    const envPath = resolve(__dirname, "../.env.local");
    if (existsSync(envPath)) {
      // Suppress dotenv messages
      process.env.DOTENV_CONFIG_QUIET = "true";
      // Load env vars - this ensures they're available to all worker processes
      const result = config({ path: envPath, override: false });
      if (result.error) {
        console.warn("Warning: Failed to load .env.local:", result.error);
      }
    }
  }
}

export default globalSetup;
