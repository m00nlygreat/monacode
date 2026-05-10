import '../shared/styles.css';
import { createEditor, monaco, updateEditorModel } from '../shared/editor.js';

const editorElement = document.querySelector('#editor');

let fileHandle = null;
const editor = createEditor(editorElement, undefined, undefined, [
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

function openUri(uri) {
  chrome.runtime.sendMessage({ type: 'OPEN_URI', uri });
}

function setCurrentFile(fileName, text) {
  updateEditorModel(editor, text, fileName);
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
  if (!fileHandle) return;
  const writable = await fileHandle.createWritable();
  await writable.write(editor.getValue());
  await writable.close();
}
