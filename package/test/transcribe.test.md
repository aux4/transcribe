# transcribe

## with nonexistent file

### should show file not found error

```execute
aux4 transcribe /tmp/nonexistent-audio-file.mp3 2>&1 || true
```

```expect:partial
Error: File not found: /tmp/nonexistent-audio-file.mp3
```
