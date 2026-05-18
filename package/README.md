# aux4/transcribe

Transcribe audio and video files to text with timestamps. Accepts local files or URLs and outputs a JSON array of timestamped text segments.

## Installation

```bash
aux4 aux4 pkger install aux4/transcribe
```

## Quick Start

```bash
aux4 transcribe recording.mp3
```

```bash
aux4 transcribe https://example.com/audio.wav
```

## Configuration

The package uses the OpenAI Whisper API for transcription. Provide credentials via environment variable or a config file:

### Environment Variable

```bash
export OPENAI_API_KEY=sk-...
aux4 transcribe recording.mp3
```

### Config File

```yaml
config:
  transcribe:
    model:
      type: openai
      api: default
```

```bash
aux4 transcribe recording.mp3 --configFile config.yaml --config transcribe
```

The `api` field supports:
- `default` — Uses the standard OpenAI API (`OPENAI_API_KEY`)
- `codex` — Uses the Codex API endpoint (`CODEX_API_KEY`)

## Output Format

The output is a JSON array of timestamped segments:

```json
[
  {
    "time": "0:00",
    "seconds": 0,
    "text": "Welcome to the assembly guide."
  },
  {
    "time": "0:15",
    "seconds": 15,
    "text": "Start by laying out all the parts."
  }
]
```

## Supported Formats

Any audio or video format supported by the OpenAI Whisper API:
- Audio: mp3, mp4, mpeg, mpga, m4a, wav, webm
- Video: mp4, webm (audio track is extracted)

## Commands

### `aux4 transcribe <file>`

Transcribe an audio or video file to text with timestamps.

| Flag | Description | Default |
|------|-------------|---------|
| `file` | Path or URL to the audio/video file | (required) |
| `--configFile` | Configuration file path | |
| `--config` | Configuration profile name | |
