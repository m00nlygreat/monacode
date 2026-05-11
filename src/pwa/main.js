import '../shared/styles.css';
import { applyEditorSettings, createEditor, monaco, updateEditorModel } from '../shared/editor.js';
import { openSettingsDialog } from '../shared/settings-ui.js';

const editorElement = document.querySelector('#editor');
const fileInput = document.querySelector('#fileInput');
const appElement = document.querySelector('.app');

function installManifestLink() {
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = new URL('manifest.webmanifest', document.baseURI).href;
  document.head.append(link);
}

let currentFileName = '';

const editor = createEditor(editorElement, undefined, undefined, [
  {
    id: 'monacode.openSettings',
    label: 'Monacode: Open Settings',
    run: openSettings,
  },
  {
    id: 'monacode.openFile',
    label: 'Monacode: Open File',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO],
    run: openFile,
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

async function openFileObject(file) {
  if (!file) return;
  setCurrentFile(file.name, await file.text());
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
  await openFileObject(file);
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

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  await openFileObject(file);
});

if ('launchQueue' in window && 'LaunchParams' in window) {
  window.launchQueue.setConsumer(async (launchParams) => {
    const [handle] = launchParams.files || [];
    if (!handle) return;
    const file = await handle.getFile();
    await openFileObject(file);
  });
}

function isFileDrag(event) {
  return Array.from(event.dataTransfer?.types || []).includes('Files');
}

let fileDragDepth = 0;

document.addEventListener('dragenter', (event) => {
  if (!isFileDrag(event)) return;
  event.preventDefault();
  fileDragDepth += 1;
  appElement.classList.add('drag-over');
}, true);

document.addEventListener('dragover', (event) => {
  if (!isFileDrag(event)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
}, true);

document.addEventListener('dragleave', (event) => {
  if (!isFileDrag(event)) return;
  fileDragDepth = Math.max(0, fileDragDepth - 1);
  if (fileDragDepth === 0) {
    appElement.classList.remove('drag-over');
  }
}, true);

document.addEventListener('drop', async (event) => {
  if (!isFileDrag(event)) return;
  event.preventDefault();
  fileDragDepth = 0;
  appElement.classList.remove('drag-over');

  const [file] = event.dataTransfer.files || [];
  await openFileObject(file);
}, true);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

installManifestLink();
