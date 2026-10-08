#### Description

The `transcribe` command converts an audio or video file into text with timestamps. It delegates transcription to `aux4 whisper transcribe`, so any provider configured for the aux4/whisper package (OpenAI, OpenAI-compatible, local whisper.cpp, mlx) can be used, and outputs a JSON array of timestamped segments.

The file can be a local path or a URL. When a URL is provided, the file is downloaded to a temporary location before transcription and cleaned up afterward.

Provider and credentials are configured as for `aux4 whisper transcribe`:
- **Environment variable** — `OPENAI_API_KEY` (or `CODEX_API_KEY`) for the default OpenAI provider
- **Config file** — `--configFile` and `--config` select a section with `provider`, `model`, `apiKey`, `baseUrl`, `binary` (see `aux4 whisper transcribe`)

Supported audio formats: mp3, mp4, mpeg, mpga, m4a, wav, webm.

#### Usage

```bash
aux4 transcribe <file> [--configFile <path>] [--config <name>]
```

file          Path or URL to the audio/video file (required)
--configFile  Configuration file with API credentials
--config      Configuration profile name to use

#### Example

Transcribe a local file:

```bash
aux4 transcribe recording.mp3
```

```text
[{"time":"0:00","seconds":0,"text":"Welcome to the assembly guide."},{"time":"0:15","seconds":15,"text":"Start by laying out all the parts."}]
```

Transcribe from a URL with config:

```bash
aux4 transcribe https://example.com/audio.wav --configFile config.yaml --config transcribe
```

Configuration file (local whisper.cpp):

```yaml
config:
  transcribe:
    provider: local
    binary: /opt/homebrew/bin/whisper-cli
    model: /path/to/ggml-large-v3-turbo.bin
```
