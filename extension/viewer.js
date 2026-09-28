import * as pdfjsLib from "./pdfjs/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("pdfjs/pdf.worker.mjs");

const fileInput = document.getElementById("fileInput");
const emptyOpenButton = document.getElementById("emptyOpenButton");
const emptyState = document.getElementById("emptyState");
const pdfStage = document.getElementById("pdfStage");
const pagesContainer = document.getElementById("pages");
const pageReadout = document.getElementById("pageReadout");
const zoomOutButton = document.getElementById("zoomOut");
const zoomInButton = document.getElementById("zoomIn");
const zoomLabel = document.getElementById("zoomLabel");
const readerStatus = document.getElementById("readerStatus");

let pdfDocument = null;
let currentFileName = "";
let currentPage = 0;
let scale = 1.2;
let renderGeneration = 0;
let pageObserver = null;
let pageRecords = new Map();
let selectionTimer = null;
let translationSerial = 0;
let lastText = "";
let bubble = null;
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

fileInput.addEventListener("change", () => {
  const [file] = fileInput.files;
  if (file) {
    openPdfFile(file);
  }
});

emptyOpenButton.addEventListener("click", () => {
  fileInput.click();
});

zoomOutButton.addEventListener("click", () => {
  setScale(scale - 0.1);
});

zoomInButton.addEventListener("click", () => {
  setScale(scale + 0.1);
});

document.addEventListener("selectionchange", () => {
  clearTimeout(selectionTimer);
  selectionTimer = setTimeout(handleSelection, 450);
});

window.addEventListener("scroll", scheduleCurrentPageUpdate, { passive: true });
window.addEventListener("resize", scheduleCurrentPageUpdate);

async function openPdfFile(file) {
  const generation = ++renderGeneration;
  currentFileName = file.name;
  setStatus(`正在打开：${file.name}`);
  hideBubble();
  clearSelection();
  pdfDocument = null;
  resetPages();

  try {
    const data = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data,
      cMapUrl: chrome.runtime.getURL("pdfjs/cmaps/"),
      cMapPacked: true,
      standardFontDataUrl: chrome.runtime.getURL("pdfjs/standard_fonts/")
    });

    pdfDocument = await loadingTask.promise;
    if (generation !== renderGeneration) return;

    emptyState.hidden = true;
    pdfStage.hidden = false;
    window.scrollTo({ top: 0, left: 0 });

    await buildPages(generation);
    setStatus(`${file.name} · ${pdfDocument.numPages} 页`);
  } catch (error) {
    if (generation !== renderGeneration) return;
    pdfDocument = null;
    emptyState.hidden = false;
    pdfStage.hidden = true;
    updateControls();
    setStatus(`PDF 打开失败：${error.message || error}`);
  }
}

async function buildPages(generation) {
  if (!pdfDocument) return;

  resetPages();
  pageObserver = new IntersectionObserver(handlePageIntersections, {
    root: null,
    rootMargin: "900px 0px",
    threshold: 0.01
  });

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    if (generation !== renderGeneration) return;

    const page = await pdfDocument.getPage(pageNumber);
    if (generation !== renderGeneration) return;

    const viewport = page.getViewport({ scale });
    const shell = document.createElement("article");
    shell.className = "page-shell";
    shell.dataset.pageNumber = String(pageNumber);

    const pageElement = document.createElement("div");
    pageElement.className = "pdf-page";
    pageElement.style.width = `${viewport.width}px`;
    pageElement.style.height = `${viewport.height}px`;
    pageElement.style.setProperty("--scale-factor", scale);
    pageElement.style.setProperty("--user-unit", viewport.userUnit || 1);

    const loading = document.createElement("div");
    loading.className = "page-loading";
    loading.textContent = `正在加载第 ${pageNumber} 页`;

    const badge = document.createElement("div");
    badge.className = "page-number";
    badge.textContent = String(pageNumber);

    pageElement.appendChild(loading);
    shell.append(pageElement, badge);
    pagesContainer.appendChild(shell);

    pageRecords.set(pageNumber, {
      pageNumber,
      page,
      viewport,
      shell,
      pageElement,
      rendered: false,
      rendering: false
    });

    pageObserver.observe(shell);
  }

  currentPage = pdfDocument.numPages > 0 ? 1 : 0;
  updateControls();
  renderPagesNearViewport();
  scheduleCurrentPageUpdate();
}

function handlePageIntersections(entries) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;

    const pageNumber = Number(entry.target.dataset.pageNumber);
    renderPage(pageNumber, renderGeneration);
  }

  scheduleCurrentPageUpdate();
}

function renderPagesNearViewport() {
  const viewportBottom = window.innerHeight + 900;

  for (const record of pageRecords.values()) {
    const rect = record.shell.getBoundingClientRect();
    if (rect.bottom >= -900 && rect.top <= viewportBottom) {
      renderPage(record.pageNumber, renderGeneration);
    }
  }
}

async function renderPage(pageNumber, generation) {
  const record = pageRecords.get(pageNumber);
  if (!record || record.rendered || record.rendering) return;

  record.rendering = true;

  try {
    const canvas = document.createElement("canvas");
    canvas.className = "pdf-canvas";
    const textLayerContainer = document.createElement("div");
    textLayerContainer.className = "textLayer";

    const outputScale = window.devicePixelRatio || 1;
    const context = canvas.getContext("2d");
    canvas.width = Math.floor(record.viewport.width * outputScale);
    canvas.height = Math.floor(record.viewport.height * outputScale);
    canvas.style.width = `${record.viewport.width}px`;
    canvas.style.height = `${record.viewport.height}px`;

    record.pageElement.append(canvas, textLayerContainer);

    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
    await record.page.render({
      canvasContext: context,
      viewport: record.viewport,
      transform
    }).promise;

    if (generation !== renderGeneration) return;

    const textContent = await record.page.getTextContent();
    if (generation !== renderGeneration) return;

    const textLayer = new pdfjsLib.TextLayer({
      textContentSource: textContent,
      container: textLayerContainer,
      viewport: record.viewport
    });

    await textLayer.render();
    if (generation !== renderGeneration) return;

    record.rendered = true;
    record.pageElement.classList.add("is-rendered");
  } catch (error) {
    if (generation === renderGeneration) {
      const loading = record.pageElement.querySelector(".page-loading");
      if (loading) {
        loading.textContent = `第 ${pageNumber} 页加载失败`;
      }
    }
  } finally {
    record.rendering = false;
  }
}

function setScale(nextScale) {
  if (!pdfDocument) return;

  scale = Math.min(2.6, Math.max(0.6, Number(nextScale.toFixed(2))));
  const pageToRestore = currentPage || 1;
  const generation = ++renderGeneration;

  hideBubble();
  clearSelection();
  setStatus(`${currentFileName} · 正在调整缩放`);

  buildPages(generation).then(() => {
    const target = pageRecords.get(pageToRestore)?.shell;
    if (target) {
      target.scrollIntoView({ block: "start" });
    }
    setStatus(`${currentFileName} · ${pdfDocument.numPages} 页`);
  });
}

function resetPages() {
  if (pageObserver) {
    pageObserver.disconnect();
    pageObserver = null;
  }

  pageRecords.clear();
  pagesContainer.textContent = "";
  currentPage = 0;
  updateControls();
}

function updateControls() {
  const totalPages = pdfDocument?.numPages || 0;
  pageReadout.textContent = `${currentPage || 0} / ${totalPages}`;
  zoomLabel.textContent = `${Math.round(scale * 100)}%`;
  zoomOutButton.disabled = !pdfDocument || scale <= 0.6;
  zoomInButton.disabled = !pdfDocument || scale >= 2.6;
}

let currentPageUpdateQueued = false;

function scheduleCurrentPageUpdate() {
  if (currentPageUpdateQueued) return;

  currentPageUpdateQueued = true;
  requestAnimationFrame(() => {
    currentPageUpdateQueued = false;
    updateCurrentPageFromScroll();
  });
}

function updateCurrentPageFromScroll() {
  if (!pdfDocument || pageRecords.size === 0) {
    updateControls();
    return;
  }

  const anchorY = window.innerHeight * 0.42;
  let bestPage = currentPage || 1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const record of pageRecords.values()) {
    const rect = record.shell.getBoundingClientRect();
    const pageMid = rect.top + rect.height / 2;
    const distance = Math.abs(pageMid - anchorY);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestPage = record.pageNumber;
    }
  }

  if (bestPage !== currentPage) {
    currentPage = bestPage;
    updateControls();
  }
}

async function handleSelection() {
  if (!translatorEnabled) {
    hideBubble();
    return;
  }

  const selection = window.getSelection();
  const text = selection?.toString().trim();

  if (!text || text.length < 2) {
    hideBubble();
    return;
  }

  if (!selectionBelongsToReader(selection)) {
    return;
  }

  const rect = getSelectionRect(selection);
  if (!rect) return;

  if (text === lastText) {
    return;
  }
  lastText = text;

  if (text.length > 3000) {
    showBubble(rect, "选中文本过长，请分段翻译。");
    return;
  }

  const serial = ++translationSerial;
  showBubble(rect, "翻译中...");

  try {
    const response = await chrome.runtime.sendMessage({
      type: "translate",
      text
    });

    if (serial !== translationSerial) return;

    if (response?.ok) {
      showBubble(rect, response.translation);
    } else {
      showBubble(rect, "翻译失败，请确认本地服务正在运行。");
    }
  } catch (error) {
    if (serial === translationSerial) {
      showBubble(rect, "翻译失败，请确认本地服务正在运行。");
    }
  }
}

function selectionBelongsToReader(selection) {
  const nodes = [selection.anchorNode, selection.focusNode].filter(Boolean);
  return nodes.some((node) => {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return element?.closest?.(".textLayer");
  });
}

function getSelectionRect(selection) {
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const rects = Array.from(range.getClientRects()).filter((rect) => {
    return rect.width > 0 && rect.height > 0;
  });

  if (rects.length > 0) {
    return rects[0];
  }

  const rect = range.getBoundingClientRect();
  if (!rect || rect.width === 0 || rect.height === 0) return null;
  return rect;
}

function showBubble(rect, text) {
  if (!bubble) {
    bubble = document.createElement("div");
    bubble.id = "jiao-reader-bubble";
    document.body.appendChild(bubble);
  }

  bubble.textContent = text;
  bubble.style.display = "block";

  const maxWidth = 460;
  const left = Math.min(
    window.innerWidth - maxWidth - 12,
    Math.max(12, rect.left)
  );
  const top = Math.max(64, rect.top - bubble.offsetHeight - 16);

  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;
}

function hideBubble() {
  if (bubble) {
    bubble.style.display = "none";
  }
}

function clearSelection() {
  window.getSelection()?.removeAllRanges();
  lastText = "";
}

function setStatus(message) {
  readerStatus.textContent = message;
}

updateControls();
