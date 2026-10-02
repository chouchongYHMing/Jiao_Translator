const checkbox = document.getElementById("enabled");
const openReaderButton = document.getElementById("openReader");
const startServerButton = document.getElementById("startServer");
const serverStatus = document.getElementById("serverStatus");
const status = document.getElementById("status");
const SERVER_HEALTH_URL = "http://127.0.0.1:8000/health";
const NATIVE_HOST = "com.jiao_translator.launcher";
let isLaunching = false;

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

async function isServerRunning() {
  try {
    const response = await fetch(SERVER_HEALTH_URL, { cache: "no-store", signal: AbortSignal.timeout(1500) });
    const data = await response.json();
    return response.ok && data.ok === true && data.model === "qwen3:4b-instruct";
  } catch {
    return false;
  }
}

async function refreshServerStatus() {
  const running = await isServerRunning();
  if (!isLaunching) {
    startServerButton.disabled = running;
    serverStatus.textContent = running ? "本地后端正在运行" : "本地后端未运行";
  }
  return running;
}

startServerButton.addEventListener("click", async () => {
  if (isLaunching) return;
  isLaunching = true;
  startServerButton.disabled = true;
  serverStatus.textContent = "正在打开终端…";

  try {
    const response = await chrome.runtime.sendNativeMessage(NATIVE_HOST, { action: "start_server" });
    if (!response?.ok) {
      throw new Error(response?.error || "启动失败");
    }
    if (response.status === "already_running") {
      serverStatus.textContent = "本地后端正在运行";
      return;
    }
    serverStatus.textContent = "终端已打开，正在等待后端启动…";
    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (await isServerRunning()) {
        serverStatus.textContent = "本地后端正在运行";
        return;
      }
    }
    serverStatus.textContent = "终端已打开；请查看终端中的启动信息";
  } catch (error) {
    const detail = String(error?.message || error);
    serverStatus.textContent = detail.includes("native messaging host") || detail.includes("Native messaging host")
      ? "未安装本机启动组件；请查看 README 的 0.3.0 安装步骤"
      : `启动失败：${detail}`;
  } finally {
    isLaunching = false;
    startServerButton.disabled = await isServerRunning();
  }
});

refreshServerStatus();

function updateStatus(enabled) {
  status.textContent = enabled ? "当前：已启用" : "当前：已关闭";
}
