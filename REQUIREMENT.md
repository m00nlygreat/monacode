# Requirements

- Use Monaco Editor to open local PC files in Chrome/PWA as read-only content.
- Support most common file extensions by default through PWA file handlers and file associations.
- Use GitHub Pages static hosting and PWA file handlers for opening files from the OS.
- Support opening a local file in the PWA by drag-and-drop as read-only content.
- Build the browser extension package to `/dist`.
- Build the GitHub Pages PWA to `/docs`.

## Decisions

- Keep the extension and PWA as separate deployment targets from one codebase.
- Use the extension only for Chrome-side `http://` and `https://` link workflows.
- Use the PWA for OS workflows: installed app, file handlers, and double-click/open-with for read-only local file viewing.
- Keep the UI command-palette first; avoid a persistent top toolbar.
- Build settings into Monacode for editor options and file associations.
- Do not request `file:///*` in the extension manifest and do not use extension content scripts for local files.
- Do not provide local-file save behavior in the PWA; opened files are read-only.
