#### Description

The `transcribe` command converts an audio or video file into text with timestamps. It uses the OpenAI Whisper API to perform speech-to-text transcription and outputs a JSON array of timestamped segments.

The file can be a local path or a URL. When a URL is provided, the file is downloaded to a temporary location before transcription and cleaned up afterward.

API credentials can be provided via:
- **Environment variable** — `OPENAI_API_KEY` or `CODEX_API_KEY`
- **Config file** — using `--configFile` and `--config` flags

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

Configuration file:

```yaml
config:
  transcribe:
    model:
      type: openai
      api: default
```
