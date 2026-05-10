chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('editor.html') });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== 'OPEN_URI' || typeof message.uri !== 'string') return;
  chrome.tabs.create({ url: message.uri });
});
