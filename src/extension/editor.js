import '../shared/styles.css';
import { applyEditorSettings, createEditor, monaco, updateEditorModel } from '../shared/editor.js';
import { openSettingsDialog } from '../shared/settings-ui.js';
import { EXTENSION_SETTINGS_STORAGE_KEY, loadSettings } from '../shared/settings.js';

const editorElement = document.querySelector('#editor');

let fileHandle = null;
let currentFileName = 'Untitled.txt';
const editor = createEditor(editorElement, undefined, undefined, [
  {
    id: 'monacode.openSettings',
    label: 'Open Settings',
    run: openSettings,
  },
  {
    id: 'monacode.openFile',
    label: 'Open File',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO],
    run: openFile,
  },
  {
    id: 'monacode.saveFile',
    label: 'Save File',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    run: saveFile,
  },
], openUri);

function openSettings() {
  openSettingsDialog({
    editor,
    onSave: async (settings) => {
      applyEditorSettings(editor, settings);
      await syncExtensionSettings(settings);
    },
  });
}

async function syncExtensionSettings(settings = loadSettings()) {
  await chrome.storage.local.set({ [EXTENSION_SETTINGS_STORAGE_KEY]: settings });
}

async function openUri(uri) {
  const response = await chrome.runtime.sendMessage({ type: 'OPEN_URI', uri });
  if (response?.ok !== false) return;

  const message = [
    'Could not open link.',
    '',
    response.error,
    '',
    'For file:// links, open chrome://extensions, select Monacode, and enable "Allow access to file URLs".',
  ].join('\n');

  alert(message);
}

function setCurrentFile(fileName, text) {
  currentFileName = fileName || 'Untitled.txt';
  updateEditorModel(editor, text, currentFileName);
}

async function loadBootstrappedFile() {
  const key = new URLSearchParams(location.search).get('bootstrap');
  if (!key) return;

  const stored = await chrome.storage.local.get(key);
  const file = stored[key];
  await chrome.storage.local.remove(key);
  if (!file) return;

  fileHandle = null;
  setCurrentFile(file.fileName, file.text || '');
}

async function openFile() {
  const [handle] = await window.showOpenFilePicker({
    multiple: false,
    types: [
      {
        description: 'Code and text files',
        accept: {
          'text/*': ['.css', '.csv', '.html', '.js', '.json', '.md', '.ts', '.txt', '.xml', '.yaml', '.yml'],
        },
      },
    ],
  });
  const file = await handle.getFile();
  fileHandle = handle;
  setCurrentFile(file.name, await file.text());
}

async function saveFile() {
  if (!fileHandle) {
    downloadCurrentFile();
    return;
  }

  const writable = await fileHandle.createWritable();
  await writable.write(editor.getValue());
  await writable.close();
}

function downloadCurrentFile() {
  const blob = new Blob([editor.getValue()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = currentFileName || 'Untitled.txt';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

loadBootstrappedFile();
syncExtensionSettings();
