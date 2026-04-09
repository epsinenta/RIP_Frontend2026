import { resolve } from "node:path";
import { generateApi } from "swagger-typescript-api";

const root = resolve(import.meta.dirname, "..");
const swagger = resolve(root, "..", "RIP2026", "docs", "swagger.json");

await generateApi({
  name: "Api.ts",
  output: resolve(root, "src", "api"),
  input: swagger,
  httpClientType: "axios",
});
