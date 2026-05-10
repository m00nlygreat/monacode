(() => {
  if (window.__MONACODE_BOOTSTRAPPED__) return;
  window.__MONACODE_BOOTSTRAPPED__ = true;

  const extensionSettingsStorageKey = 'monacode:settings';
  const defaultAutoOpenExtensions = [
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

  const defaultAutoOpenFileNames = [
    '.env',
    '.gitignore',
    'dockerfile',
    'makefile',
  ];

  async function getAutoOpenSettings() {
    try {
      const stored = await chrome.storage.local.get(extensionSettingsStorageKey);
      const settings = stored[extensionSettingsStorageKey] || {};
      return {
        extensions: Array.isArray(settings.autoOpenExtensions)
          ? settings.autoOpenExtensions
          : defaultAutoOpenExtensions,
        fileNames: Array.isArray(settings.autoOpenFileNames)
          ? settings.autoOpenFileNames
          : defaultAutoOpenFileNames,
      };
    } catch {
      return {
        extensions: defaultAutoOpenExtensions,
        fileNames: defaultAutoOpenFileNames,
      };
    }
  }

  function shouldOpenFile(fileName, settings) {
    const autoOpenExtensions = new Set(settings.extensions.map((extension) => extension.toLowerCase().replace(/^\./, '')));
    const autoOpenFileNames = new Set(settings.fileNames.map((name) => name.toLowerCase()));
    const normalizedName = fileName.toLowerCase();
    if (autoOpenFileNames.has(normalizedName)) return true;

    const extension = normalizedName.includes('.') ? normalizedName.split('.').pop() : '';
    return autoOpenExtensions.has(extension);
  }

  function getFileName() {
    try {
      const parts = new URL(location.href).pathname.split(/[\\/]/).filter(Boolean);
      return decodeURIComponent(parts.at(-1) || 'Untitled.txt');
    } catch {
      return 'Untitled.txt';
    }
  }

  function readDocumentText() {
    return document.body?.querySelector('pre')?.textContent
      || document.body?.innerText
      || document.documentElement.textContent
      || '';
  }

  async function main() {
    const fileName = getFileName();
    const settings = await getAutoOpenSettings();
    if (!shouldOpenFile(fileName, settings)) return;

    chrome.runtime.sendMessage({
      type: 'OPEN_EDITOR_WITH_CONTENT',
      text: readDocumentText(),
      fileName,
      sourceUrl: location.href,
    });
  }

  main();
})();
