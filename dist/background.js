chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('editor.html') });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'OPEN_URI' || typeof message.uri !== 'string') return;
  if (!/^https?:\/\//i.test(message.uri)) {
    sendResponse({ ok: false, error: 'Only http and https links are supported.' });
    return true;
  }

  chrome.tabs.create({ url: message.uri }, () => {
    if (chrome.runtime.lastError) {
      sendResponse({ ok: false, error: chrome.runtime.lastError.message });
      return;
    }

    sendResponse({ ok: true });
  });

  return true;
});
