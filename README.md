# Jiao Translator

**Language:** English | [简体中文](README.zh-CN.md) | [Español](README.es.md) | [Català](README.ca.md)

**Select English text on a web page or in a PDF to see a Chinese translation.** Jiao Translator is a Chrome extension for reading research papers. It processes translations on your computer by default, with no account required.

Version: **0.3.0** · Default output: **Simplified Chinese** · One-click startup: **Windows + Chrome**

[Features](#features) · [First-time setup](#install) · [Everyday use](#usage) · [Troubleshooting](#help) · [Project details](#details)

<a id="features"></a>

## What you can do

| Task | How it works |
| --- | --- |
| Read English web pages | Select a passage to see its translation in a popup |
| Read local PDFs | Open a file in the built-in reader, scroll, and select text to translate |
| Pause translation | Turn off “启用划词翻译” in the extension popup |
| Start the translation service | On Windows, configure the launcher once, then click “启动本地后端” |

Ollama and the local backend must both be running to translate. Initial setup needs an internet connection to download software, dependencies, and the model. The default translation flow does not use a cloud translation API. The extension controls currently use Chinese labels; this guide explains them below.

<a id="install"></a>

## First-time setup

Complete steps 1–4 to start translating. Windows users can also complete step 5 to enable one-click startup.

### 1. Prepare your software and download the project

| Software | Purpose |
| --- | --- |
| Google Chrome | Install and use the extension |
| [Python 3.10+](https://www.python.org/downloads/) | Run the local translation service |
| [Ollama](https://ollama.com/download) | Run the translation model on your computer |

Open the [GitHub repository](https://github.com/chouchongYHMing/Jiao_Translator), click **Code → Download ZIP**, and extract it to a location you plan to keep. The folder containing `server`, `extension`, and `native-host` is the **project root** used throughout this guide.

If you use Git, you can clone it instead:

```bash
git clone https://github.com/chouchongYHMing/Jiao_Translator.git
```

### 2. Download the translation model

Install and open Ollama, then open a new terminal and run:

```bash
ollama pull qwen3:4b-instruct
```

Wait for the download to finish and keep Ollama running. If the command cannot connect to Ollama, open the Ollama app or run `ollama serve` in another terminal, then try again.

### 3. Install and start the local backend

Open a terminal at the **project root**. Expand the commands for your system and run them in order. They create an isolated Python environment, install dependencies, and start the service.

<details open>
<summary>Windows (PowerShell)</summary>

```powershell
cd server
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

</details>

<details>
<summary>macOS / Linux</summary>

```bash
cd server
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

</details>

**Keep this terminal open.** Visit the [backend status page](http://127.0.0.1:8000/health) in your browser. This response means the backend is running:

```json
{"ok":true,"model":"qwen3:4b-instruct"}
```

### 4. Load the Chrome extension

1. Enter `chrome://extensions` in Chrome's address bar.
2. Turn on **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the project's **`extension` folder**.
4. Pin **Jiao Translator** from Chrome's extensions menu.
5. Open a normal English web page and select a sentence to check that the translation popup appears.

For PDFs, use “打开 PDF 阅读器” (Open PDF reader) in the extension popup. Internal Chrome pages such as `chrome://extensions` do not support selected-text translation.

### 5. Enable one-click startup (optional, Windows / Chrome only)

Complete this setup once to start the backend from the extension button on subsequent visits.

1. Find Jiao Translator at `chrome://extensions` and copy its **32-character extension ID**.
2. **Open a new PowerShell window at the project root.** Replace `YOUR_32_CHARACTER_EXTENSION_ID` inside the quotes with your ID, then run:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\native-host\windows\install.ps1 -ExtensionId "YOUR_32_CHARACTER_EXTENSION_ID"
```

3. Return to `chrome://extensions` and click **Reload** on the Jiao Translator card.
4. When the backend is stopped, click **启动本地后端** (Start local backend) in the popup. It opens a terminal, activates the virtual environment, and starts the service.

The button is disabled while the backend is running. It starts the backend; Ollama must also be running. Repeat the installer if you move the project or the extension ID changes.

<a id="usage"></a>

## Everyday use

After setup, the routine is **open Ollama → start the backend → read and translate**. You do not need to recreate the virtual environment or download the model each time.

On Windows, use the configured “启动本地后端” button. Otherwise, open a new terminal at the project root and run the commands for your system:

<details>
<summary>Manual startup commands (Windows / macOS / Linux)</summary>

Windows PowerShell:

```powershell
cd server
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

macOS / Linux:

```bash
cd server
.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

</details>

- **Web pages:** select a short passage and wait for the translation.
- **PDFs:** click the extension icon → 打开 PDF 阅读器 (Open PDF reader) → 打开 PDF (Open PDF) → choose a local file, then select text.
- **Pause translation:** uncheck 启用划词翻译 (Enable selected-text translation) in the popup.
- **Stop the backend:** press `Ctrl+C` in its terminal.

<a id="help"></a>

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `py` or `python3` is not found | Check that Python is installed, then open a new terminal |
| The backend status page will not open | Check the backend terminal for errors and follow the everyday startup steps |
| The backend is running but translation fails | Keep Ollama running; use `ollama list` to check for `qwen3:4b-instruct` |
| The popup says the native launcher is not installed | Complete step 5 with the current extension ID and reload the extension |
| The launcher reports a missing `.venv` or Uvicorn | Repeat step 3 and ensure dependencies are installed in `server/.venv` |
| Device Guard blocks `uvicorn.exe` during one-click startup | Update the project and repeat the installer in step 5 to refresh the launcher. It now uses the virtual environment's `python.exe -m uvicorn`; if policy also blocks Python, ask your device administrator for an approved way to run it |
| Port 8000 is already in use | Check for an existing backend terminal; stop another application using the port if necessary |
| Translation does not work in Chrome's PDF viewer | Open the file in the extension's Jiao PDF Reader |
| Changes do not appear after updating | Reload the extension at `chrome://extensions`, refresh the web page, and reopen the PDF reader |

The status page confirms only that the backend is reachable. Translation also needs Ollama and the downloaded model.

<a id="details"></a>

## Project details

The following sections describe the implementation, data flow, and development workflow for readers who want to understand or modify the project.

### Architecture

```text
Chrome page or Jiao PDF Reader
        ↓
Chrome extension content/popup/viewer scripts
        ↓
background.js
        ↓
http://127.0.0.1:8000/translate
        ↓
FastAPI backend
        ↓
http://127.0.0.1:11434/api/chat
        ↓
Ollama + qwen3:4b-instruct
```

### Project Structure

```text
Jiao_Translator/
  README.md
  README.zh-CN.md
  README.es.md
  README.ca.md
  LICENSE
  .gitignore

  server/
    main.py
    requirements.txt

  native-host/windows/
    Host.cs
    install.ps1
    launch-server.cmd

  extension/
    manifest.json
    background.js
    content.js
    style.css
    popup.html
    popup.css
    popup.js
    viewer.html
    viewer.css
    viewer.js
    icons/
    pdfjs/
```

### Privacy

Jiao Translator is designed to be local-first.

- Selected text is sent to the local backend at `http://127.0.0.1:8000/translate`.
- The backend sends text to local Ollama at `http://127.0.0.1:11434/api/chat`.
- No cloud translation API is used by default.
- No account login is required.
- No browsing history is intentionally collected.
- Local PDF files opened in the PDF Reader are not uploaded by the extension.

If you modify the backend to call a cloud API, update this section before distributing the project.

### Dependencies

Backend:

- FastAPI
- Uvicorn
- httpx
- Pydantic

Extension:

- Chrome Extension Manifest V3
- JavaScript
- CSS
- PDF.js

Model runtime:

- Ollama
- `qwen3:4b-instruct`

PDF rendering is powered by PDF.js. The bundled PDF.js license is kept at:

```text
extension/pdfjs/LICENSE
```

### Windows launcher

The extension calls a local host through Chrome Native Messaging. The installer uses the Windows .NET Framework C# compiler, writes the generated files to `build/native-host`, and registers the host for the current user. Access is limited to the extension ID supplied during installation.

The host opens a terminal, activates `server/.venv`, and runs `.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload`. This loads the Uvicorn module with the virtual environment's Python interpreter. macOS and Linux currently use manual startup.

### Development Notes

Before committing to GitHub, do not commit:

- `.venv/`
- `.idea/`
- `__pycache__/`
- `.DS_Store`
- downloaded model files
- generated zip files

The Qwen model is downloaded and managed by Ollama, not by this repository.

### Packaging For Manual Distribution

For GitHub releases, package only the `extension` folder.

macOS / Linux:

```bash
zip -r jiao-translator-extension-v0.3.0.zip extension \
  -x "*.DS_Store"
```

Windows PowerShell:

```powershell
Compress-Archive -Path extension -DestinationPath jiao-translator-extension-v0.3.0.zip -Force
```

The extension ZIP contains only the browser component. A complete installation needs `server/` and `native-host/windows/` in their original project layout, so also provide the full project source. Users install the model and virtual environment locally.

### Chrome Web Store Notes

This project can be submitted to the Chrome Web Store, but the store package should contain the browser extension only. Users still need to run the local backend and Ollama separately.

Before submitting, prepare:

- Extension ZIP package
- Store screenshots
- Icons
- Privacy policy
- Clear note that the extension connects to `127.0.0.1:8000`
- Clear note that the local backend calls Ollama on `127.0.0.1:11434`

Chrome Web Store publishing documentation:

[https://developer.chrome.com/docs/webstore/publish/](https://developer.chrome.com/docs/webstore/publish/)

### Roadmap

- Add translation cache.
- Add copy button in the translation bubble.
- Add model selection in settings.
- Add target language options.
- Add release scripts for GitHub and Chrome Web Store packaging.

### References

- Ollama download: [https://ollama.com/download](https://ollama.com/download)
- Qwen3 4B instruct on Ollama: [https://ollama.com/library/qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct)
- Chrome load unpacked extension guide: [https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- Chrome Web Store publishing: [https://developer.chrome.com/docs/webstore/publish/](https://developer.chrome.com/docs/webstore/publish/)

### License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
