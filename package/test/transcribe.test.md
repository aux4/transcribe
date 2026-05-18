# transcribe

## without arguments

### should show error

```execute
aux4 transcribe 2>&1 || true
```

```error:partial
Usage: aux4 transcribe *?
```

## with nonexistent file

### should show file not found error

```execute
aux4 transcribe /tmp/nonexistent-audio-file.mp3 2>&1 || true
```

```error:partial
Error: File not found*?
```
