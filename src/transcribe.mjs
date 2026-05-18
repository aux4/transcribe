#!/usr/bin/env node
import { createReadStream, unlinkSync, existsSync, readFileSync } from "fs";
import { execSync } from "child_process";
import { extname, join } from "path";
import { tmpdir, homedir } from "os";
import OpenAI from "openai";
import { load } from "js-yaml";

const file = process.argv[2];
const configFile = process.argv[3] || "";
const configName = process.argv[4] || "";

if (!file) {
  console.error("Usage: aux4 transcribe <file> [--configFile <path>] [--config <name>]");
  process.exit(1);
}

function loadConfig(configFile, configName) {
  if (!configFile) return {};
  try {
    const yaml = readFileSync(configFile, "utf8");
    const parsed = load(yaml);
    if (configName && parsed.config?.[configName]?.model) {
      return parsed.config[configName].model;
    }
    return parsed.config || {};
  } catch {
    return {};
  }
}

function resolveApiKey(config) {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;

  const api = config?.api || "";
  if (api === "codex" && process.env.CODEX_API_KEY) return process.env.CODEX_API_KEY;

  // Read from ~/.codex/auth.json (same as aux4/ai-agent)
  const codexAuthPath = join(homedir(), ".codex", "auth.json");
  if (existsSync(codexAuthPath)) {
    try {
      const auth = JSON.parse(readFileSync(codexAuthPath, "utf8"));
      if (auth.OPENAI_API_KEY) return auth.OPENAI_API_KEY;
      if (auth.tokens?.access_token) return auth.tokens.access_token;
    } catch {}
  }

  return null;
}

function resolveBaseURL(config) {
  const api = config?.api || "";
  if (api === "codex") return "https://api.openai.com/v1";
  return undefined;
}

async function downloadFile(url) {
  const ext = extname(new URL(url).pathname) || ".audio";
  const tmp = join(tmpdir(), `transcribe-${Date.now()}${ext}`);
  execSync(`curl -sL -o "${tmp}" "${url}"`, { stdio: ["pipe", "pipe", "pipe"] });
  return tmp;
}

async function transcribe(filePath, config) {
  const apiKey = resolveApiKey(config);
  if (!apiKey) {
    console.error("Error: No API key found. Set OPENAI_API_KEY or provide a config file.");
    process.exit(1);
  }

  const openai = new OpenAI({
    apiKey,
    baseURL: resolveBaseURL(config),
  });

  const fileHandle = await OpenAI.toFile(readFileSync(filePath), filePath.split("/").pop());
  const response = await openai.audio.transcriptions.create({
    file: fileHandle,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  const transcript = (response.segments || []).map((seg) => {
    const sec = Math.floor(seg.start);
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return {
      time: `${mins}:${secs.toString().padStart(2, "0")}`,
      seconds: sec,
      text: seg.text.trim(),
    };
  }).filter((e) => e.text);

  return transcript;
}

async function main() {
  const config = loadConfig(configFile, configName);
  let localFile = file;
  let isTemp = false;

  if (file.startsWith("http://") || file.startsWith("https://")) {
    localFile = await downloadFile(file);
    isTemp = true;
  }

  if (!existsSync(localFile)) {
    console.error(`Error: File not found: ${localFile}`);
    process.exit(1);
  }

  try {
    const result = await transcribe(localFile, config);
    console.log(JSON.stringify(result));
  } finally {
    if (isTemp) {
      try { unlinkSync(localFile); } catch {}
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
