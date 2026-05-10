# Requirements

- Use Monaco Editor to open and edit local PC files in Chrome.
- Support most common file extensions by default, with configurable extension handling.
- Use GitHub Pages static hosting and PWA file handlers for opening files from the OS.
- Build the browser extension package to `/dist`.
- Build the GitHub Pages PWA to `/docs`.

## Decisions

- Keep the extension and PWA as separate deployment targets from one codebase.
- Use the extension for Chrome workflows: launch editor, handle dropped `file://` code/text files, and open links.
- Use the PWA for OS workflows: installed app, file handlers, double-click/open-with, and direct save through file handles.
- Keep the UI command-palette first; avoid a persistent top toolbar.
- Build settings into Monacode for editor options, file associations, and auto-open file types.
- Keep `file:///*` in the extension manifest, but decide auto-open behavior in the content script using Monacode settings.
- Do not auto-open `.html`/`.htm` by default; let Chrome render HTML files.
- Do not auto-open `.md`/`.markdown` by default so Tourmaline can handle Markdown drops first. Monacode still supports Markdown via file picker or settings.
- Treat files opened through extension content scripts as read-only handles; save them by download fallback unless opened with the File System Access API or PWA file handler.
