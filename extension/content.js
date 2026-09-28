let bubble = null;
let timer = null;
let lastText = "";
let translatorEnabled = true;

chrome.storage.local.get({ enabled: true }, (result) => {
  translatorEnabled = result.enabled;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    translatorEnabled = changes.enabled.newValue;
    if (!translatorEnabled) {
      hideBubble();
    }
  }
});


document.addEventListener("selectionchange", () => {
  clearTimeout(timer);
  timer = setTimeout(handleSelection, 500);
});

async function handleSelection() {
    if (!translatorEnabled) {
    hideBubble();
    return;
  }
  const selection = window.getSelection();
  const text = selection?.toString().trim();

  if (!text || text.length < 3) {
    hideBubble();
    return;
  }

  if (text === lastText) return;
  lastText = text;

  if (text.length > 3000) {
    showBubble(getSelectionRect(selection), "选中文本过长，请分段翻译。");
    return;
  }

  const rect = getSelectionRect(selection);
  if (!rect) return;

  showBubble(rect, "翻译中...");

  const response = await chrome.runtime.sendMessage({
    type: "translate",
    text
  });

  if (response?.ok) {
    showBubble(rect, response.translation);
  } else {
    showBubble(rect, "翻译失败，请确认本地服务正在运行。");
  }
}

function getSelectionRect(selection) {
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  if (!rect || rect.width === 0 || rect.height === 0) return null;
  return rect;
}

function showBubble(rect, text) {
  if (!bubble) {
    bubble = document.createElement("div");
    bubble.id = "jiao-translator-bubble";
    document.body.appendChild(bubble);
  }

  bubble.textContent = text;
  bubble.style.display = "block";

  const maxWidth = 440;
  const left = Math.min(
    window.innerWidth - maxWidth - 12,
    Math.max(12, rect.left)
  );

  const top = Math.max(12, rect.top - bubble.offsetHeight - 16);

  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;
}

function hideBubble() {
  if (bubble) {
    bubble.style.display = "none";
  }
}