const checkbox = document.getElementById("enabled");
const openReaderButton = document.getElementById("openReader");
const status = document.getElementById("status");

chrome.storage.local.get({ enabled: true }, (result) => {
  checkbox.checked = result.enabled;
  updateStatus(result.enabled);
});

checkbox.addEventListener("change", () => {
  const enabled = checkbox.checked;
  chrome.storage.local.set({ enabled });
  updateStatus(enabled);
});

openReaderButton.addEventListener("click", () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("viewer.html")
  });
});

function updateStatus(enabled) {
  status.textContent = enabled ? "当前：已启用" : "当前：已关闭";
}
