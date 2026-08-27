import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Language } from "./platform";

const execFileAsync = promisify(execFile);
const images: Record<Language, string> = { Python: "python:3.12-alpine", JavaScript: "node:20-alpine", "C++": "gcc:13", Java: "eclipse-temurin:21-jdk" };

export async function executeInDocker(language: Language, source: string) {
  const image = images[language];
  const command = language === "Python" ? ["python", "-c", source] : language === "JavaScript" ? ["node", "-e", source] : ["sh", "-c", "echo 'compile and execute through the configured language adapter'"];
  try {
    const { stdout, stderr } = await execFileAsync("docker", ["run", "--rm", "--network=none", "--memory=256m", "--cpus=1", "--pids-limit=64", "--read-only", image, ...command], { timeout: 2000, maxBuffer: 1024 * 1024 });
    return { mode: "docker", stdout, stderr };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sandbox execution failed";
    return { mode: "docker", stdout: "", stderr: message };
  }
}
