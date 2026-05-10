export const SETTINGS_STORAGE_KEY = 'monacode.settings.v1';

export const EXTENSION_SETTINGS_STORAGE_KEY = 'monacode:settings';

export const defaultAutoOpenExtensions = [
  'bat',
  'c',
  'cjs',
  'cpp',
  'cs',
  'css',
  'csv',
  'env',
  'go',
  'h',
  'hpp',
  'ini',
  'java',
  'js',
  'json',
  'jsx',
  'less',
  'log',
  'mjs',
  'php',
  'ps1',
  'py',
  'rb',
  'rs',
  'scss',
  'sh',
  'sql',
  'toml',
  'ts',
  'tsx',
  'txt',
  'xml',
  'yaml',
  'yml',
];

export const defaultAutoOpenFileNames = [
  '.env',
  '.gitignore',
  'dockerfile',
  'makefile',
];

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
  autoOpenExtensions: defaultAutoOpenExtensions,
  autoOpenFileNames: defaultAutoOpenFileNames,
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
    autoOpenExtensions: normalizeExtensionList(settings.autoOpenExtensions, defaultAutoOpenExtensions),
    autoOpenFileNames: normalizeFileNameList(settings.autoOpenFileNames, defaultAutoOpenFileNames),
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

function normalizeExtensionList(value, fallback) {
  const source = Array.isArray(value) ? value : fallback;
  return [...new Set(
    source
      .map((item) => String(item || '').trim().toLowerCase().replace(/^\./, ''))
      .filter(Boolean)
  )];
}

function normalizeFileNameList(value, fallback) {
  const source = Array.isArray(value) ? value : fallback;
  return [...new Set(
    source
      .map((item) => String(item || '').trim().toLowerCase())
      .filter(Boolean)
  )];
}
