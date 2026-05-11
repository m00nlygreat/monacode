# Requirements

- Use Monaco Editor to open and edit local PC files in Chrome/PWA.
- Support most common file extensions by default through PWA file handlers and file associations.
- Use GitHub Pages static hosting and PWA file handlers for opening files from the OS.
- Support opening a local file in the PWA by drag-and-drop.
- Support saving edited local files in the PWA when a writable file handle is available.
- Build the browser extension package to `/dist`.
- Build the GitHub Pages PWA to `/docs`.

## Decisions

- Keep the extension and PWA as separate deployment targets from one codebase.
- Use the extension only for Chrome-side `http://` and `https://` link workflows.
- Use the PWA for OS workflows: installed app, file handlers, double-click/open-with, editing, and saving local files.
- Keep the UI command-palette first; avoid a persistent top toolbar.
- Build settings into Monacode for editor options and file associations.
- Do not request `file:///*` in the extension manifest and do not use extension content scripts for local files.
- Use Save As to adopt a writable file handle when a document was opened without one.
- Prevent the browser's default page-save behavior for editor save shortcuts.
