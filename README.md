# dsh-composer-resize

Drag-to-resize for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) web composer.

A small handle sits on the **top edge** of the composer card:

- **Drag up** → the input box grows taller.
- **Drag down** → the input box shrinks.
- While resizing, the scroll area is **bottom-anchored**, so shrinking a long draft keeps the last lines in view (no clipped bottom lines).
- Range: 52 px to 75% of the viewport height (720 px cap).
- Pure browser-side plugin: no host commands, no LLM calls, nothing written to session logs.

## Compatibility

- DSH `0.1.0-rc.6` web UI (uses stable `data-composer-card` / `data-input-scroll` attributes).
- Chrome/Edge and other Chromium browsers recommended (Pointer Events).

## Install

### From GitHub (after publishing)

```sh
dsh plugin --profile web add github:<owner>/dsh-composer-resize
```

Then restart DSH, or hard-refresh the web page (`Ctrl+F5`) if the server is already running and serving `/plugins` with `Cache-Control: no-cache`.

### From npm (if published)

```sh
dsh plugin --profile web add dsh-composer-resize
```

### From a local tarball

```sh
dsh plugin --profile web add ./dsh-composer-resize-1.1.0.tgz
```

## Uninstall

```sh
dsh plugin --profile web remove dsh-composer-resize
```

## How it works

- The node half is a no-op; the browser half is served at `/plugins/dsh-composer-resize/client.js`.
- It injects a `<style>` block plus a `[data-resize-handle]` element per `[data-composer-card]`.
- Pointer drag sets inline `height`/`max-height` on `[data-input-scroll]` and pins `scrollTop` to the bottom on every frame.
- A `MutationObserver` re-attaches the handle if React re-renders the composer.

## License

MIT
