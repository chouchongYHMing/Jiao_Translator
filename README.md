# Jiao Translator

**Language:** English | [简体中文](README.zh-CN.md) | [Español](README.es.md) | [Català](README.ca.md)

Jiao Translator is a local-first Chrome extension for paper reading and selected-text translation. It lets you select English text in normal web pages or in the built-in Jiao PDF Reader, sends the selected text to a local FastAPI backend, and translates it with a local Qwen model running through Ollama.

The project is designed for privacy and stable reading workflows: selected text is processed on your own computer by default, without using a cloud translation API.

## Features

- Translate selected text on normal web pages.
- Open PDFs in the built-in Jiao PDF Reader.
- Read PDFs with vertical scrolling, similar to Chrome's native PDF viewer.
- Translate selected PDF text through the same local translation backend.
- Toggle selected-text translation from the extension popup.
- Run translation locally with Ollama and `qwen3:4b-instruct`.

## Architecture

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

## Project Structure

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

## Requirements

- Google Chrome or another Chromium-based browser
- Python 3.10+
- Ollama
- `qwen3:4b-instruct` downloaded through Ollama

The current extension version is `0.2.0`.

## Install Ollama

Download Ollama from the official website:

[https://ollama.com/download](https://ollama.com/download)

### macOS

Download and install the Ollama app from the official download page. Ollama's official page currently lists macOS 14 Sonoma or later as the requirement.

After installation, open the Ollama app once, then check:

```bash
ollama --version
curl http://127.0.0.1:11434/api/version
```

### Linux

Use Ollama's official install command:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Then check:

```bash
ollama --version
curl http://127.0.0.1:11434/api/version
```

If the service is not running, start it manually:

```bash
ollama serve
```

### Windows

Download and run the Windows installer from the official download page. After installation, open PowerShell and check:

```powershell
ollama --version
curl.exe http://127.0.0.1:11434/api/version
```

If the API is not running, open the Ollama app from the Start menu, or run:

```powershell
ollama serve
```

## Download The Qwen Model

This project uses the non-thinking Qwen instruct model:

```bash
ollama pull qwen3:4b-instruct
```

You can test it directly:

```bash
ollama run qwen3:4b-instruct
```

Then enter:

```text
请将以下英文翻译成简体中文，只输出译文，不要解释：
This paper proposes a novel framework for efficient retrieval-augmented generation.
```

The Ollama model page is here:

[https://ollama.com/library/qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct)

## Start The Local Backend

From the project root, use the commands for your operating system.

### macOS / Linux

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Windows PowerShell

```powershell
cd server
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

If PowerShell blocks virtual environment activation, run this in the same PowerShell window and then activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### Windows Command Prompt

```bat
cd server
py -3 -m venv .venv
.\.venv\Scripts\activate.bat
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Open another terminal and test the health endpoint:

```bash
curl -s http://127.0.0.1:8000/health
```

On Windows PowerShell, use `curl.exe` if `curl` behaves like a PowerShell alias.

Expected response:

```json
{"ok":true,"model":"qwen3:4b-instruct"}
```

Test translation:

```bash
curl -s http://127.0.0.1:8000/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"This paper proposes a novel framework for efficient retrieval-augmented generation."}'
```

On Windows PowerShell, the same command works with `curl.exe` instead of `curl`.

Expected response:

```json
{"translation":"本文提出了一种用于高效检索增强生成的新型框架。"}
```

Keep this backend terminal open while using the Chrome extension.

## Load The Chrome Extension

Chrome official documentation calls this loading an unpacked extension in Developer Mode.

1. Open Chrome.
2. Enter this address:

```text
chrome://extensions
```

3. Turn on `Developer mode` in the top-right corner.
4. Click `Load unpacked`.
5. Select the project folder below:

```text
Jiao_Translator/extension
```

6. Pin `Jiao Translator` from Chrome's extension puzzle menu if you want quick access.

Important: select the `extension/` folder itself, not `manifest.json` and not the project root.

After changing extension files, go back to `chrome://extensions` and click the reload button on the `Jiao Translator` card. If you changed `content.js`, also refresh the web page you are testing.

## Use On Web Pages

1. Make sure Ollama is running.
2. Make sure the FastAPI backend is running on `127.0.0.1:8000`.
3. Open a normal web page, for example an English article or paper HTML page.
4. Select a short sentence.
5. Wait for the translation bubble.

Chrome internal pages such as `chrome://extensions` cannot be used for testing content scripts.

## Use The PDF Reader

Chrome's native PDF viewer does not reliably expose PDF text selection to normal extension content scripts, so this project includes its own PDF reader built with PDF.js.

To use it:

1. Click the `Jiao Translator` icon in the Chrome toolbar.
2. Click `打开 PDF 阅读器`.
3. In the reader page, click `打开 PDF`.
4. Choose a local PDF file.
5. Scroll vertically through the PDF.
6. Select English text in the PDF.
7. Wait for the translation bubble.

The PDF file is opened locally in the browser page. It is not uploaded by the extension.

## Popup Controls

The extension popup contains:

- `启用划词翻译`: turn selected-text translation on or off.
- `打开 PDF 阅读器`: open the built-in Jiao PDF Reader.

If selected-text translation is off, the extension will not translate selections until you turn it on again.

## Privacy

Jiao Translator is designed to be local-first.

- Selected text is sent to the local backend at `http://127.0.0.1:8000/translate`.
- The backend sends text to local Ollama at `http://127.0.0.1:11434/api/chat`.
- No cloud translation API is used by default.
- No account login is required.
- No browsing history is intentionally collected.
- Local PDF files opened in the PDF Reader are not uploaded by the extension.

If you modify the backend to call a cloud API, update this section before distributing the project.

## Dependencies

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

## Troubleshooting

### `curl http://127.0.0.1:8000/health` fails

The backend is not running. Start it with the command for your system.

macOS / Linux:

```bash
cd server
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Windows PowerShell:

```powershell
cd server
.\.venv\Scripts\Activate.ps1
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Translation fails but the extension appears

Check Ollama:

```bash
curl http://127.0.0.1:11434/api/version
```

Check the model:

```bash
ollama list
```

If needed:

```bash
ollama pull qwen3:4b-instruct
```

### The extension does not update after editing files

Open:

```text
chrome://extensions
```

Then click the reload button on the `Jiao Translator` card. For content script changes, refresh the target web page as well.

### It does not work in Chrome's native PDF viewer

Use the built-in Jiao PDF Reader from the extension popup. Chrome's native PDF viewer does not behave like a normal web page for selection scripts.

### The popup says the service worker is invalid

Open `chrome://extensions`, find `Jiao Translator`, and click the service worker or error link to inspect logs. Common causes are invalid JavaScript syntax or a missing file referenced by `manifest.json`.

## Development Notes

Before committing to GitHub, do not commit:

- `.venv/`
- `.idea/`
- `__pycache__/`
- `.DS_Store`
- downloaded model files
- generated zip files

The Qwen model is downloaded and managed by Ollama, not by this repository.

## Packaging For Manual Distribution

For GitHub releases, package only the `extension` folder.

macOS / Linux:

```bash
zip -r jiao-translator-extension-v0.2.0.zip extension \
  -x "*.DS_Store"
```

Windows PowerShell:

```powershell
Compress-Archive -Path extension -DestinationPath jiao-translator-extension-v0.2.0.zip -Force
```

Users still need to install Ollama, pull the model, and start the backend.

## Chrome Web Store Notes

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

## Roadmap

- Add translation cache.
- Add copy button in the translation bubble.
- Add model selection in settings.
- Add target language options.
- Add one-click backend startup helper.
- Add release scripts for GitHub and Chrome Web Store packaging.

## References

- Ollama download: [https://ollama.com/download](https://ollama.com/download)
- Qwen3 4B instruct on Ollama: [https://ollama.com/library/qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct)
- Chrome load unpacked extension guide: [https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- Chrome Web Store publishing: [https://developer.chrome.com/docs/webstore/publish/](https://developer.chrome.com/docs/webstore/publish/)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
