import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const apiPort = process.env.API_PORT ?? "8787";
const webPort = process.env.WEB_PORT ?? process.env.PORT ?? "8080";
const apiProxyTarget =
  process.env.API_PROXY_TARGET ?? `http://127.0.0.1:${apiPort}`;

let shuttingDown = false;

function run(name, args, extraEnv) {
  const child = spawn("corepack", ["pnpm", ...args], {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown || signal) return;
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
}

console.log(`Starting API on http://127.0.0.1:${apiPort}`);
console.log(`Starting UI on http://127.0.0.1:${webPort}`);

const api = run("api", ["--filter", "@workspace/api-server", "run", "dev"], {
  PORT: apiPort,
  NODE_ENV: "development",
});

const web = run("web", ["--filter", "@workspace/ai-support-assistant", "run", "dev"], {
  PORT: webPort,
  BASE_PATH: process.env.BASE_PATH ?? "/",
  API_PROXY_TARGET: apiProxyTarget,
});

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  api.kill();
  web.kill();
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
