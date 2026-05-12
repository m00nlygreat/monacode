export const SETTINGS_STORAGE_KEY = 'monacode.settings.v1';

export const defaultSettings = {
  theme: 'vs-dark',
  fontSize: 14,
  wordWrap: 'off',
  minimap: true,
  links: true,
  fileAssociations: {
    bash: 'shell',
    babelrc: 'json',
    bat: 'bat',
    c: 'cpp',
    cc: 'cpp',
    cjs: 'javascript',
    cmd: 'bat',
    config: 'ini',
    conf: 'ini',
    cpp: 'cpp',
    cs: 'csharp',
    css: 'css',
    csv: 'plaintext',
    cxx: 'cpp',
    dockerignore: 'plaintext',
    dockerfile: 'dockerfile',
    editorconfig: 'ini',
    env: 'ini',
    eslintrc: 'json',
    gitignore: 'plaintext',
    gql: 'graphql',
    go: 'go',
    graphql: 'graphql',
    h: 'cpp',
    hcl: 'hcl',
    hpp: 'cpp',
    html: 'html',
    htm: 'html',
    ini: 'ini',
    java: 'java',
    js: 'javascript',
    json: 'json',
    jsonl: 'json',
    jsx: 'javascript',
    kt: 'kotlin',
    kts: 'kotlin',
    less: 'less',
    lock: 'plaintext',
    log: 'plaintext',
    markdown: 'markdown',
    md: 'markdown',
    mdx: 'mdx',
    mjs: 'javascript',
    ndjson: 'json',
    php: 'php',
    postcss: 'css',
    prettierrc: 'json',
    properties: 'ini',
    proto: 'protobuf',
    ps1: 'powershell',
    py: 'python',
    pyw: 'python',
    rb: 'ruby',
    rs: 'rust',
    rst: 'restructuredtext',
    sass: 'scss',
    scala: 'scala',
    scss: 'scss',
    sh: 'shell',
    sql: 'sql',
    svg: 'xml',
    svelte: 'html',
    swift: 'swift',
    tf: 'hcl',
    tfvars: 'hcl',
    toml: 'ini',
    ts: 'typescript',
    tsx: 'typescript',
    txt: 'plaintext',
    vue: 'html',
    xml: 'xml',
    zsh: 'shell',
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
