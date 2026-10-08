#!/usr/bin/env node
import { unlinkSync, existsSync } from "fs";
import { execFileSync } from "child_process";
import { extname, join } from "path";
import { tmpdir } from "os";

const file = process.argv[2];
const configFile = process.argv[3] || "";
const configName = process.argv[4] || "";

if (!file) {
  console.error("Usage: aux4 transcribe <file> [--configFile <path>] [--config <name>]");
  process.exit(1);
}

function downloadFile(url) {
  const ext = extname(new URL(url).pathname) || ".audio";
  const tmp = join(tmpdir(), `transcribe-${Date.now()}${ext}`);
  execFileSync("curl", ["-sfL", "-o", tmp, url], { stdio: ["ignore", "pipe", "pipe"] });
  return tmp;
}

function runWhisper(filePath) {
  const args = ["whisper", "transcribe", filePath, "--format", "json"];
  if (configFile) args.push("--configFile", configFile);
  if (configName) args.push("--config", configName);

  const env = { ...process.env };
  if (!env.OPENAI_API_KEY && env.CODEX_API_KEY) env.OPENAI_API_KEY = env.CODEX_API_KEY;

  try {
    return execFileSync("aux4", args, {
      env,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const detail = (err.stderr || err.stdout || err.message || "").toString().trim();
    throw new Error(detail.replace(/^Error:\s*/, "") || "aux4 whisper transcribe failed");
  }
}

function toTranscript(output) {
  const result = JSON.parse(output);
  return (result.segments || [])
    .map((seg) => {
      const sec = Math.floor(seg.start);
      return {
        time: `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`,
        seconds: sec,
        text: (seg.text || "").trim(),
      };
    })
    .filter((e) => e.text);
}

function main() {
  let localFile = file;
  let isTemp = false;

  if (file.startsWith("http://") || file.startsWith("https://")) {
    localFile = downloadFile(file);
    isTemp = true;
  }

  if (!existsSync(localFile)) {
    console.error(`Error: File not found: ${localFile}`);
    process.exit(1);
  }

  try {
    console.log(JSON.stringify(toTranscript(runWhisper(localFile))));
  } finally {
    if (isTemp) {
      try { unlinkSync(localFile); } catch {}
    }
  }
}

try {
  main();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
