import '../shared/styles.css';
import { applyEditorSettings, createEditor, monaco, updateEditorModel } from '../shared/editor.js';
import { openSettingsDialog } from '../shared/settings-ui.js';

const editorElement = document.querySelector('#editor');
const fileInput = document.querySelector('#fileInput');
const appElement = document.querySelector('.app');

const filePickerTypes = [
  {
    description: 'Code and text files',
    accept: {
      'text/*': [
        '.bash',
        '.babelrc',
        '.bat',
        '.c',
        '.cc',
        '.cjs',
        '.cmd',
        '.config',
        '.conf',
        '.cpp',
        '.cs',
        '.css',
        '.csv',
        '.cxx',
        '.dockerignore',
        '.dockerfile',
        '.editorconfig',
        '.env',
        '.eslintrc',
        '.gql',
        '.go',
        '.graphql',
        '.h',
        '.hcl',
        '.hpp',
        '.htm',
        '.html',
        '.ini',
        '.java',
        '.js',
        '.json',
        '.jsonl',
        '.jsx',
        '.kt',
        '.kts',
        '.less',
        '.lock',
        '.log',
        '.markdown',
        '.md',
        '.mdx',
        '.mjs',
        '.ndjson',
        '.php',
        '.postcss',
        '.prettierrc',
        '.properties',
        '.proto',
        '.ps1',
        '.py',
        '.pyw',
        '.rb',
        '.rs',
        '.rst',
        '.sass',
        '.scala',
        '.scss',
        '.sh',
        '.sql',
        '.svg',
        '.svelte',
        '.swift',
        '.tf',
        '.tfvars',
        '.toml',
        '.ts',
        '.tsx',
        '.txt',
        '.vue',
        '.xml',
        '.yaml',
        '.yml',
        '.zsh',
      ],
    },
  },
];

function installManifestLink() {
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = new URL('manifest.webmanifest', document.baseURI).href;
  document.head.append(link);
}

const isBlankDocumentLaunch = new URLSearchParams(window.location.search).has('new');
const isStandaloneApp =
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

function takeFirstLaunchWelcome() {
  if (!isStandaloneApp || isBlankDocumentLaunch) return false;

  try {
    const storageKey = 'monacode.welcomeShown';
    if (window.localStorage.getItem(storageKey)) return false;
    window.localStorage.setItem(storageKey, 'true');
    return true;
  } catch {
    return false;
  }
}

const shouldShowWelcome = takeFirstLaunchWelcome();

let currentDocument = {
  name: shouldShowWelcome ? 'monacode-welcome.md' : 'Untitled',
  handle: null,
  source: shouldShowWelcome ? 'sample' : 'new',
  dirty: false,
  lastModified: null,
};

let statusTimer = 0;

const editor = createEditor(
  editorElement,
  shouldShowWelcome ? undefined : '',
  shouldShowWelcome ? undefined : currentDocument.name,
  [
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
    {
      id: 'monacode.save',
      label: 'Monacode: Save',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: saveFile,
    },
    {
      id: 'monacode.saveAs',
      label: 'Monacode: Save As...',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS],
      run: saveFileAs,
    },
  ],
);

document.title = `${currentDocument.name} - Monacode`;

editor.onDidChangeModelContent(() => {
  setDirty(true);
});

function openBlankDocumentWindow() {
  const appUrl = new URL('./index.html?new=1', window.location.href);
  window.open(appUrl, '_blank', 'noopener');
}

document.addEventListener('keydown', (event) => {
  const hasCommandModifier = event.ctrlKey || event.metaKey;
  const isNewDocumentShortcut =
    hasCommandModifier &&
    !event.altKey &&
    !event.shiftKey &&
    (event.code === 'KeyN' || event.code === 'KeyT');
  const isSaveShortcut = hasCommandModifier && event.code === 'KeyS';

  if (isNewDocumentShortcut) {
    event.preventDefault();
    event.stopPropagation();

    if (!event.repeat) {
      openBlankDocumentWindow();
    }
    return;
  }

  if (!isSaveShortcut) return;

  event.preventDefault();
  event.stopPropagation();

  if (event.shiftKey) {
    saveFileAs();
    return;
  }

  saveFile();
}, true);

window.addEventListener('beforeunload', (event) => {
  if (!currentDocument.dirty) return;

  event.preventDefault();
  event.returnValue = '';
});

function openSettings() {
  openSettingsDialog({
    editor,
    onSave: (settings) => applyEditorSettings(editor, settings),
  });
}

function setDirty(dirty) {
  currentDocument.dirty = dirty;
  document.title = `${dirty ? '* ' : ''}${currentDocument.name} - Monacode`;
}

function showStatus(message) {
  let statusElement = document.querySelector('.status-toast');

  if (!statusElement) {
    statusElement = document.createElement('div');
    statusElement.className = 'status-toast';
    statusElement.setAttribute('role', 'status');
    document.body.append(statusElement);
  }

  statusElement.textContent = message;
  statusElement.classList.add('status-toast-visible');
  window.clearTimeout(statusTimer);
  statusTimer = window.setTimeout(() => {
    statusElement.classList.remove('status-toast-visible');
  }, 2400);
}

function setCurrentFile({ fileName, text, handle = null, source = 'unknown', lastModified = null }) {
  currentDocument = {
    name: fileName || 'Untitled',
    handle,
    source,
    dirty: false,
    lastModified,
  };
  updateEditorModel(editor, text, currentDocument.name);
  setDirty(false);
  editor.focus();
}

async function openFileObject(file, { handle = null, source = 'unknown' } = {}) {
  if (!file) return;
  setCurrentFile({
    fileName: file.name,
    text: await file.text(),
    handle,
    source,
    lastModified: file.lastModified,
  });
  showStatus(`Opened ${file.name}`);
}

async function openWithFileSystemAccess() {
  const [handle] = await window.showOpenFilePicker({
    multiple: false,
    types: filePickerTypes,
  });
  const file = await handle.getFile();
  await openFileObject(file, { handle, source: 'picker' });
}

function openWithInput() {
  fileInput.value = '';
  fileInput.click();
}

async function openFile() {
  try {
    if ('showOpenFilePicker' in window) {
      await openWithFileSystemAccess();
      return;
    }

    openWithInput();
  } catch (error) {
    if (!isAbortError(error)) {
      showStatus('Could not open file.');
      throw error;
    }
  }
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  await openFileObject(file, { source: 'input' });
});

if ('launchQueue' in window && 'LaunchParams' in window) {
  window.launchQueue.setConsumer(async (launchParams) => {
    const [handle] = launchParams.files || [];
    if (!handle) return;
    const file = await handle.getFile();
    await openFileObject(file, { handle, source: 'launch' });
  });
}

async function verifyPermission(handle, mode = 'readwrite') {
  if (!handle) return false;
  if (typeof handle.queryPermission !== 'function' || typeof handle.requestPermission !== 'function') return true;

  const options = { mode };

  if ((await handle.queryPermission?.(options)) === 'granted') {
    return true;
  }

  return (await handle.requestPermission?.(options)) === 'granted';
}

async function getSaveHandle() {
  if (!('showSaveFilePicker' in window)) return null;

  return window.showSaveFilePicker({
    suggestedName: currentDocument.name,
    types: filePickerTypes,
  });
}

function isAbortError(error) {
  return error?.name === 'AbortError';
}

async function writeFile(handle, text) {
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
}

function downloadFile(text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = currentDocument.name;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

async function confirmOverwriteIfChanged(handle) {
  if (!currentDocument.lastModified) return true;

  const file = await handle.getFile();
  if (file.lastModified === currentDocument.lastModified) return true;

  return window.confirm(`${currentDocument.name} changed outside Monacode. Overwrite it?`);
}

async function saveToHandle(handle, { checkExternalChange = false } = {}) {
  if (!(await verifyPermission(handle))) {
    showStatus('Save permission was not granted.');
    return false;
  }

  if (checkExternalChange && !(await confirmOverwriteIfChanged(handle))) {
    showStatus('Save canceled.');
    return false;
  }

  await writeFile(handle, editor.getValue());
  const file = await handle.getFile();
  currentDocument.handle = handle;
  currentDocument.name = file.name || currentDocument.name;
  currentDocument.lastModified = file.lastModified;
  setDirty(false);
  showStatus(`Saved ${currentDocument.name}`);
  return true;
}

async function saveFile() {
  try {
    if (currentDocument.handle) {
      await saveToHandle(currentDocument.handle, { checkExternalChange: true });
      return;
    }

    await saveFileAs();
  } catch (error) {
    if (!isAbortError(error)) {
      showStatus('Could not save file.');
      throw error;
    }
  }
}

async function saveFileAs() {
  try {
    if (!('showSaveFilePicker' in window)) {
      downloadFile(editor.getValue());
      setDirty(false);
      showStatus(`Downloaded ${currentDocument.name}`);
      return;
    }

    const handle = await getSaveHandle();
    await saveToHandle(handle);
  } catch (error) {
    if (!isAbortError(error)) {
      showStatus('Could not save file.');
      throw error;
    }
  }
}

function getDroppedFileHandle(event) {
  const item = Array.from(event.dataTransfer?.items || []).find(({ kind }) => kind === 'file');

  if (!item || typeof item.getAsFileSystemHandle !== 'function') {
    return null;
  }

  return item.getAsFileSystemHandle();
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

  const droppedHandle = await getDroppedFileHandle(event);
  if (droppedHandle?.kind === 'file') {
    const file = await droppedHandle.getFile();
    await openFileObject(file, { handle: droppedHandle, source: 'drop' });
    return;
  }

  const [file] = event.dataTransfer.files || [];
  await openFileObject(file, { source: 'drop' });
}, true);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

installManifestLink();
