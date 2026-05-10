import { defaultSettings, loadSettings, saveSettings } from './settings.js';

let dialogElement = null;

export function openSettingsDialog({ editor, onSave } = {}) {
  if (dialogElement) {
    dialogElement.showModal();
    return;
  }

  const settings = loadSettings();
  dialogElement = document.createElement('dialog');
  dialogElement.className = 'settings-dialog';
  dialogElement.innerHTML = `
    <form method="dialog" class="settings-panel">
      <header class="settings-header">
        <h2>Settings</h2>
        <button class="settings-icon-button" type="submit" value="cancel" aria-label="Close">x</button>
      </header>
      <section class="settings-section">
        <label class="settings-field">
          <span>Theme</span>
          <select name="theme">
            <option value="vs-dark">Dark</option>
            <option value="vs">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </label>
        <label class="settings-field">
          <span>Font size</span>
          <input name="fontSize" type="number" min="10" max="28" step="1" />
        </label>
        <label class="settings-field">
          <span>Word wrap</span>
          <select name="wordWrap">
            <option value="off">Off</option>
            <option value="on">On</option>
            <option value="wordWrapColumn">Column</option>
            <option value="bounded">Bounded</option>
          </select>
        </label>
        <label class="settings-check">
          <input name="minimap" type="checkbox" />
          <span>Show minimap</span>
        </label>
        <label class="settings-check">
          <input name="links" type="checkbox" />
          <span>Enable links</span>
        </label>
      </section>
      <section class="settings-section">
        <label class="settings-field settings-field-full">
          <span>File associations</span>
          <textarea name="fileAssociations" spellcheck="false"></textarea>
        </label>
      </section>
      <footer class="settings-footer">
        <button type="button" data-reset>Reset</button>
        <button type="submit" value="cancel">Cancel</button>
        <button type="submit" value="save">Save</button>
      </footer>
    </form>
  `;

  document.body.append(dialogElement);
  const form = dialogElement.querySelector('form');

  writeSettingsToForm(form, settings);

  dialogElement.addEventListener('close', () => {
    if (dialogElement.returnValue !== 'save') return;
    const updatedSettings = saveSettings(readSettingsFromForm(form));
    onSave?.(updatedSettings);
    editor?.focus();
  });

  form.querySelector('[data-reset]').addEventListener('click', () => {
    writeSettingsToForm(form, defaultSettings);
  });

  dialogElement.showModal();
}

function writeSettingsToForm(form, settings) {
  form.elements.theme.value = settings.theme;
  form.elements.fontSize.value = settings.fontSize;
  form.elements.wordWrap.value = settings.wordWrap;
  form.elements.minimap.checked = settings.minimap;
  form.elements.links.checked = settings.links;
  form.elements.fileAssociations.value = Object.entries(settings.fileAssociations)
    .map(([extension, language]) => `${extension}: ${language}`)
    .join('\n');
}

function readSettingsFromForm(form) {
  return {
    theme: form.elements.theme.value,
    fontSize: Number(form.elements.fontSize.value),
    wordWrap: form.elements.wordWrap.value,
    minimap: form.elements.minimap.checked,
    links: form.elements.links.checked,
    fileAssociations: parseFileAssociations(form.elements.fileAssociations.value),
  };
}

function parseFileAssociations(value) {
  const fileAssociations = {};

  for (const line of value.split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    const separatorIndex = trimmedLine.indexOf(':');
    if (separatorIndex === -1) continue;
    const extension = trimmedLine.slice(0, separatorIndex).trim().replace(/^\./, '');
    const language = trimmedLine.slice(separatorIndex + 1).trim();
    if (!extension || !language) continue;
    fileAssociations[extension] = language;
  }

  return fileAssociations;
}
