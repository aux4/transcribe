# 1.1.0

- Transcription now runs through `aux4/whisper`: OpenAI, OpenAI-compatible APIs, local whisper.cpp and mlx-whisper are selectable via `--configFile`/`--config`.
- Large files are compressed and split by whisper instead of the previous ad-hoc ffmpeg call.
- Output format is unchanged (JSON array of `time`, `seconds`, `text`).
- Removed the direct `openai` and `js-yaml` dependencies. The legacy `~/.codex/auth.json` key lookup is gone; use `OPENAI_API_KEY`, `CODEX_API_KEY` or `apiKey` in config.
