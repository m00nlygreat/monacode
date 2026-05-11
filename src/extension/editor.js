import '../shared/styles.css';
import { applyEditorSettings, createEditor } from '../shared/editor.js';
import { openSettingsDialog } from '../shared/settings-ui.js';

const editorElement = document.querySelector('#editor');

const EXTENSION_WELCOME = `/*
Monacode extension opens http and https links only.

Open the Command Palette with Ctrl+K or Ctrl+Shift+P.
On macOS, use Cmd+K or Cmd+Shift+P.

Commands:
- Monacode: Open Settings
- Monacode: Open Link Under Cursor

Link:
- https://example.com
*/
`;

const editor = createEditor(editorElement, EXTENSION_WELCOME, 'monacode-extension.js', [
  {
    id: 'monacode.openSettings',
    label: 'Monacode: Open Settings',
    run: openSettings,
  },
], openUri);

function openSettings() {
  openSettingsDialog({
    editor,
    onSave: (settings) => {
      applyEditorSettings(editor, settings);
    },
  });
}

async function openUri(uri) {
  if (!/^https?:\/\//i.test(uri)) return;
  const response = await chrome.runtime.sendMessage({ type: 'OPEN_URI', uri });
  if (response?.ok !== false) return;

  const message = [
    'Could not open link.',
    '',
    response.error,
  ].join('\n');

  alert(message);
}
