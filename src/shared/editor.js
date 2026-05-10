import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { loadSettings } from './settings.js';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker();
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

const fallbackLanguageByExtension = new Map([
  ['css', 'css'],
  ['csv', 'plaintext'],
  ['html', 'html'],
  ['htm', 'html'],
  ['js', 'javascript'],
  ['json', 'json'],
  ['jsx', 'javascript'],
  ['md', 'markdown'],
  ['mjs', 'javascript'],
  ['ts', 'typescript'],
  ['tsx', 'typescript'],
  ['txt', 'plaintext'],
  ['xml', 'xml'],
  ['yml', 'yaml'],
  ['yaml', 'yaml'],
]);

export function languageForFileName(fileName = '', settings = loadSettings()) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return settings.fileAssociations[extension] || fallbackLanguageByExtension.get(extension) || 'plaintext';
}

export { monaco };

export const DEFAULT_EDITOR_VALUE = `/*
Open the Command Palette with Ctrl+K or Ctrl+Shift+P.
On macOS, use Cmd+K or Cmd+Shift+P.

Commands:
- Open File
- Open Link Under Cursor

Links:
- https://example.com
*/
`;

const urlPattern = /\bhttps?:\/\/[^\s<>"'`)}\]]+/g;

function defaultOpenUri(uri) {
  window.open(uri, '_blank', 'noopener');
}

function getLinkAtPosition(editor, position) {
  const model = editor.getModel();
  if (!model || !position) return null;

  const line = model.getLineContent(position.lineNumber);
  const columnIndex = position.column - 1;

  for (const match of line.matchAll(urlPattern)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (columnIndex >= start && columnIndex <= end) {
      return match[0];
    }
  }

  return null;
}

function enableLinkOpening(editor, openUri) {
  editor.onMouseDown((event) => {
    if (!loadSettings().links) return;

    const mouseEvent = event.event.browserEvent;
    const isOpenGesture = mouseEvent.ctrlKey || mouseEvent.metaKey || mouseEvent.button === 1;
    if (!isOpenGesture) return;

    const uri = getLinkAtPosition(editor, event.target.position);
    if (!uri) return;

    event.event.preventDefault();
    event.event.stopPropagation();
    openUri(uri);
  });

  editor.addAction({
    id: 'monacode.openLinkUnderCursor',
    label: 'Open Link Under Cursor',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    run: () => {
      if (!loadSettings().links) return;
      const uri = getLinkAtPosition(editor, editor.getPosition());
      if (uri) openUri(uri);
    },
  });
}

export function createEditor(
  container,
  value = DEFAULT_EDITOR_VALUE,
  fileName = 'monacode-welcome.js',
  actions = [],
  openUri = defaultOpenUri
) {
  const settings = loadSettings();
  const editor = monaco.editor.create(container, {
    value,
    language: languageForFileName(fileName, settings),
    automaticLayout: true,
    minimap: { enabled: settings.minimap },
    theme: settings.theme,
    fontSize: settings.fontSize,
    wordWrap: settings.wordWrap,
    links: settings.links,
    scrollBeyondLastLine: false,
  });

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
    editor.trigger('keyboard', 'editor.action.quickCommand');
  });

  for (const action of actions) {
    editor.addAction(action);
  }

  enableLinkOpening(editor, openUri);

  const handleCommandPaletteShortcut = (event) => {
    const isCommandPaletteShortcut =
      (event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'KeyP';

    if (!isCommandPaletteShortcut || !editor.hasTextFocus()) return;

    event.preventDefault();
    event.stopPropagation();
    editor.trigger('keyboard', 'editor.action.quickCommand');
  };

  container.ownerDocument.addEventListener('keydown', handleCommandPaletteShortcut, true);
  editor.onDidDispose(() => {
    container.ownerDocument.removeEventListener('keydown', handleCommandPaletteShortcut, true);
  });

  return editor;
}

export function updateEditorModel(editor, value, fileName = '') {
  const model = monaco.editor.createModel(value, languageForFileName(fileName));
  const previousModel = editor.getModel();
  editor.setModel(model);
  previousModel?.dispose();
}

export function applyEditorSettings(editor, settings = loadSettings()) {
  monaco.editor.setTheme(settings.theme);
  editor.updateOptions({
    fontSize: settings.fontSize,
    wordWrap: settings.wordWrap,
    minimap: { enabled: settings.minimap },
    links: settings.links,
  });
}
