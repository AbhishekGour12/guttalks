import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The .env file could be in server/src/ or server/ (root folder)
const srcEnvPath = path.resolve(__dirname, "../.env");
const rootEnvPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: rootEnvPath }); // Try loading from server/.env (standard)
dotenv.config({ path: srcEnvPath });  // Try loading from server/src/.env (current placement)
dotenv.config();                      // Fallback to process.cwd() based .env if present

export default dotenv;
