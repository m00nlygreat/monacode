import '../shared/styles.css';
import { applyEditorSettings, createEditor, monaco, updateEditorModel } from '../shared/editor.js';
import { openSettingsDialog } from '../shared/settings-ui.js';

const editorElement = document.querySelector('#editor');
const fileInput = document.querySelector('#fileInput');

function installManifestLink() {
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = new URL('manifest.webmanifest', document.baseURI).href;
  document.head.append(link);
}

let fileHandle = null;
let currentFileName = '';

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
]);

function openSettings() {
  openSettingsDialog({
    editor,
    onSave: (settings) => applyEditorSettings(editor, settings),
  });
}

function setCurrentFile(fileName, text) {
  currentFileName = fileName || 'Untitled';
  updateEditorModel(editor, text, currentFileName);
}

async function openWithFileSystemAccess() {
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

function openWithInput() {
  fileInput.value = '';
  fileInput.click();
}

async function openFile() {
  if ('showOpenFilePicker' in window) {
    await openWithFileSystemAccess();
    return;
  }

  openWithInput();
}

async function saveFile() {
  if (!fileHandle) return;
  const writable = await fileHandle.createWritable();
  await writable.write(editor.getValue());
  await writable.close();
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  fileHandle = null;
  setCurrentFile(file.name, await file.text());
});

if ('launchQueue' in window && 'LaunchParams' in window) {
  window.launchQueue.setConsumer(async (launchParams) => {
    const [handle] = launchParams.files || [];
    if (!handle) return;
    const file = await handle.getFile();
    fileHandle = handle;
    setCurrentFile(file.name, await file.text());
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

installManifestLink();
