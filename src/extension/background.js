chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('editor.html') });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'OPEN_EDITOR_WITH_CONTENT') {
    openEditorWithContent(message, sender).then(sendResponse, (error) => {
      sendResponse({ ok: false, error: error.message });
    });
    return true;
  }

  if (message?.type !== 'OPEN_URI' || typeof message.uri !== 'string') return;
  chrome.tabs.create({ url: message.uri }, () => {
    if (chrome.runtime.lastError) {
      sendResponse({ ok: false, error: chrome.runtime.lastError.message });
      return;
    }

    sendResponse({ ok: true });
  });

  return true;
});

async function openEditorWithContent(message, sender) {
  const key = `bootstrap:${crypto.randomUUID()}`;
  await chrome.storage.local.set({
    [key]: {
      text: String(message.text ?? ''),
      fileName: String(message.fileName || 'Untitled.txt'),
      sourceUrl: String(message.sourceUrl || ''),
      createdAt: Date.now(),
    },
  });

  const url = chrome.runtime.getURL(`editor.html?bootstrap=${encodeURIComponent(key)}`);

  if (sender.tab?.id) {
    await chrome.tabs.update(sender.tab.id, { url });
    return { ok: true };
  }

  await chrome.tabs.create({ url });
  return { ok: true };
}
