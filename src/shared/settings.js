export const SETTINGS_STORAGE_KEY = 'monacode.settings.v1';

export const defaultSettings = {
  theme: 'vs-dark',
  fontSize: 14,
  wordWrap: 'off',
  minimap: true,
  links: true,
  fileAssociations: {
    css: 'css',
    html: 'html',
    htm: 'html',
    js: 'javascript',
    json: 'json',
    jsx: 'javascript',
    md: 'markdown',
    mjs: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    xml: 'xml',
    yml: 'yaml',
    yaml: 'yaml',
  },
};

export function loadSettings() {
  try {
    const storedSettings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
    return normalizeSettings(storedSettings);
  } catch {
    return { ...defaultSettings, fileAssociations: { ...defaultSettings.fileAssociations } };
  }
}

export function saveSettings(settings) {
  const normalizedSettings = normalizeSettings(settings);
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalizedSettings));
  return normalizedSettings;
}

export function normalizeSettings(settings = {}) {
  return {
    theme: ['vs-dark', 'vs', 'hc-black'].includes(settings.theme) ? settings.theme : defaultSettings.theme,
    fontSize: clampNumber(settings.fontSize, 10, 28, defaultSettings.fontSize),
    wordWrap: ['off', 'on', 'wordWrapColumn', 'bounded'].includes(settings.wordWrap)
      ? settings.wordWrap
      : defaultSettings.wordWrap,
    minimap: typeof settings.minimap === 'boolean' ? settings.minimap : defaultSettings.minimap,
    links: typeof settings.links === 'boolean' ? settings.links : defaultSettings.links,
    fileAssociations: normalizeFileAssociations(settings.fileAssociations),
  };
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function normalizeFileAssociations(fileAssociations = {}) {
  const normalizedAssociations = {};
  const source = { ...defaultSettings.fileAssociations, ...fileAssociations };

  for (const [extension, language] of Object.entries(source)) {
    const normalizedExtension = extension.trim().replace(/^\./, '').toLowerCase();
    const normalizedLanguage = String(language || '').trim();
    if (!normalizedExtension || !normalizedLanguage) continue;
    normalizedAssociations[normalizedExtension] = normalizedLanguage;
  }

  return normalizedAssociations;
}
