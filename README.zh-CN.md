# Jiao Translator

**语言：** [English](README.md) | 简体中文 | [Español](README.es.md) | [Català](README.ca.md)

Jiao Translator 是一个本地优先的 Chrome 划词翻译扩展，主要面向论文阅读场景。你可以在普通网页或内置的 Jiao PDF Reader 中选中英文文本，扩展会把选中文本发送到本地 FastAPI 后端，并通过本地 Ollama 中运行的 Qwen 模型完成翻译。

这个项目默认不调用云端翻译 API。选中文本会在你的电脑本地处理，适合对隐私、稳定性和论文阅读效率有要求的场景。

## 功能

- 在普通网页中划词翻译。
- 使用内置 Jiao PDF Reader 打开 PDF。
- 像 Chrome 原生 PDF 阅读器一样纵向滚动阅读 PDF。
- 在 PDF Reader 中选中文本并翻译。
- 在扩展弹窗中启用或关闭划词翻译。
- 使用 Ollama 和 `qwen3:4b-instruct` 在本地运行翻译模型。

## 架构

```text
Chrome 网页或 Jiao PDF Reader
        ↓
Chrome 扩展脚本
        ↓
background.js
        ↓
http://127.0.0.1:8000/translate
        ↓
FastAPI 本地后端
        ↓
http://127.0.0.1:11434/api/chat
        ↓
Ollama + qwen3:4b-instruct
```

## 项目结构

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

## 环境要求

- Google Chrome 或其他 Chromium 内核浏览器
- Python 3.10+
- Ollama
- 通过 Ollama 下载好的 `qwen3:4b-instruct`

当前扩展版本是 `0.2.0`。

## 安装 Ollama

从 Ollama 官方网站下载安装：

[https://ollama.com/download](https://ollama.com/download)

### macOS

从 Ollama 下载页安装 Ollama App。Ollama 官方页面目前标注 macOS 需要 macOS 14 Sonoma 或更新版本。

安装后先打开一次 Ollama App，然后检查：

```bash
ollama --version
curl http://127.0.0.1:11434/api/version
```

### Linux

使用 Ollama 官方安装命令：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

然后检查：

```bash
ollama --version
curl http://127.0.0.1:11434/api/version
```

如果服务没有运行，手动启动：

```bash
ollama serve
```

### Windows

从 Ollama 下载页下载 Windows 安装程序并安装。安装后打开 PowerShell，检查：

```powershell
ollama --version
curl.exe http://127.0.0.1:11434/api/version
```

如果 API 没有运行，从开始菜单打开 Ollama App，或执行：

```powershell
ollama serve
```

## 下载 Qwen 模型

本项目推荐使用非 thinking 版本的 Qwen instruct 模型：

```bash
ollama pull qwen3:4b-instruct
```

你可以先在命令行中测试模型：

```bash
ollama run qwen3:4b-instruct
```

进入模型后输入：

```text
请将以下英文翻译成简体中文，只输出译文，不要解释：
This paper proposes a novel framework for efficient retrieval-augmented generation.
```

Ollama 模型页面：

[https://ollama.com/library/qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct)

## 启动本地后端

在项目根目录中，根据你的操作系统选择对应命令。

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

如果 PowerShell 阻止激活虚拟环境，在同一个 PowerShell 窗口中先执行：

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### Windows 命令提示符

```bat
cd server
py -3 -m venv .venv
.\.venv\Scripts\activate.bat
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

新开一个终端，测试健康检查接口：

```bash
curl -s http://127.0.0.1:8000/health
```

在 Windows PowerShell 中，如果 `curl` 被当作 PowerShell 别名处理，请改用 `curl.exe`。

期望返回：

```json
{"ok":true,"model":"qwen3:4b-instruct"}
```

测试翻译接口：

```bash
curl -s http://127.0.0.1:8000/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"This paper proposes a novel framework for efficient retrieval-augmented generation."}'
```

在 Windows PowerShell 中，同样可以把命令里的 `curl` 换成 `curl.exe`。

期望返回类似：

```json
{"translation":"本文提出了一种用于高效检索增强生成的新型框架。"}
```

使用 Chrome 扩展时，需要保持这个后端终端处于运行状态。

## 在 Chrome 中加载扩展

Chrome 官方把这种方式称为在开发者模式下加载未打包扩展。

1. 打开 Chrome。
2. 在地址栏输入：

```text
chrome://extensions
```

3. 打开右上角的 `开发者模式`。
4. 点击 `加载已解压的扩展程序` 或 `Load unpacked`。
5. 选择项目里的扩展目录：

```text
Jiao_Translator/extension
```

6. 如果需要快速访问，可以从 Chrome 右上角的扩展菜单中固定 `Jiao Translator`。

注意：请选择 `extension/` 文件夹本身，不要选择 `manifest.json`，也不要选择项目根目录。

修改扩展文件后，需要回到 `chrome://extensions`，点击 `Jiao Translator` 卡片上的刷新按钮。如果修改了 `content.js`，还需要刷新正在测试的网页。

## 在普通网页中使用

1. 确认 Ollama 正在运行。
2. 确认 FastAPI 后端正在 `127.0.0.1:8000` 运行。
3. 打开普通英文网页，例如英文文章或论文 HTML 页面。
4. 选中一小段英文句子。
5. 等待翻译浮窗出现。

Chrome 内部页面，例如 `chrome://extensions`，不能用于测试 content script。

## 使用 PDF Reader

Chrome 原生 PDF 阅读器不会稳定地把 PDF 文本选区暴露给普通扩展脚本，所以本项目内置了基于 PDF.js 的 PDF Reader。

使用方式：

1. 点击 Chrome 工具栏里的 `Jiao Translator` 图标。
2. 点击 `打开 PDF 阅读器`。
3. 在阅读器页面中点击 `打开 PDF`。
4. 选择本地 PDF 文件。
5. 纵向滚动阅读 PDF。
6. 在 PDF 中选中英文文本。
7. 等待翻译浮窗出现。

PDF 文件会在浏览器本地页面中打开，扩展不会上传 PDF 文件。

## 弹窗控制

扩展弹窗包含：

- `启用划词翻译`：开启或关闭划词翻译。
- `打开 PDF 阅读器`：打开内置 Jiao PDF Reader。

如果关闭划词翻译，扩展不会翻译选中文本，直到你重新启用。

## 隐私说明

Jiao Translator 采用本地优先设计。

- 选中文本会发送到本地后端：`http://127.0.0.1:8000/translate`。
- 后端会调用本地 Ollama：`http://127.0.0.1:11434/api/chat`。
- 默认不使用云端翻译 API。
- 不需要账号登录。
- 不主动收集浏览历史。
- PDF Reader 打开的本地 PDF 文件不会被扩展上传。

如果你修改后端，让它调用云端 API，请在发布前同步更新这一节。

## 技术依赖

后端：

- FastAPI
- Uvicorn
- httpx
- Pydantic

扩展：

- Chrome Extension Manifest V3
- JavaScript
- CSS
- PDF.js

模型运行时：

- Ollama
- `qwen3:4b-instruct`

PDF 渲染由 PDF.js 提供。随项目打包的 PDF.js 许可证保存在：

```text
extension/pdfjs/LICENSE
```

## 常见问题

### `curl http://127.0.0.1:8000/health` 失败

说明后端没有运行。按你的系统启动后端。

macOS / Linux：

```bash
cd server
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Windows PowerShell：

```powershell
cd server
.\.venv\Scripts\Activate.ps1
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 扩展出现了，但翻译失败

检查 Ollama：

```bash
curl http://127.0.0.1:11434/api/version
```

检查模型：

```bash
ollama list
```

如果没有模型，执行：

```bash
ollama pull qwen3:4b-instruct
```

### 修改文件后扩展没有更新

打开：

```text
chrome://extensions
```

点击 `Jiao Translator` 卡片上的刷新按钮。如果修改了 content script，还需要刷新目标网页。

### 在 Chrome 原生 PDF 阅读器中不工作

请使用扩展弹窗中的内置 Jiao PDF Reader。Chrome 原生 PDF 阅读器不等同于普通网页，扩展脚本无法稳定读取其中的选中文本。

### popup 显示 service worker 无效

打开 `chrome://extensions`，找到 `Jiao Translator`，点击 service worker 或错误链接查看日志。常见原因是 JavaScript 语法错误，或 `manifest.json` 引用了不存在的文件。

## 开发说明

提交到 GitHub 前，请不要提交：

- `.venv/`
- `.idea/`
- `__pycache__/`
- `.DS_Store`
- 下载好的模型文件
- 生成的 zip 文件

Qwen 模型由 Ollama 下载和管理，不应该放进这个仓库。

## 手动打包扩展

如果要在 GitHub Releases 中发布扩展压缩包，只需要打包 `extension` 目录。

macOS / Linux：

```bash
zip -r jiao-translator-extension-v0.2.0.zip extension \
  -x "*.DS_Store"
```

Windows PowerShell：

```powershell
Compress-Archive -Path extension -DestinationPath jiao-translator-extension-v0.2.0.zip -Force
```

用户仍然需要单独安装 Ollama、拉取模型，并启动本地后端。

## Chrome Web Store 说明

这个项目可以提交到 Chrome Web Store，但商店包应该只包含浏览器扩展部分。用户仍然需要单独运行本地后端和 Ollama。

提交前需要准备：

- 扩展 ZIP 包
- 商店截图
- 图标
- 隐私政策
- 明确说明扩展会连接 `127.0.0.1:8000`
- 明确说明本地后端会调用 `127.0.0.1:11434`

Chrome Web Store 发布文档：

[https://developer.chrome.com/docs/webstore/publish/](https://developer.chrome.com/docs/webstore/publish/)

## Roadmap

- 添加翻译缓存。
- 在翻译浮窗中添加复制按钮。
- 添加模型选择页面。
- 添加目标语言选项。
- 添加一键启动后端的辅助工具。
- 添加 GitHub 和 Chrome Web Store 打包脚本。

## 参考资料

- Ollama 下载：[https://ollama.com/download](https://ollama.com/download)
- Qwen3 4B instruct on Ollama：[https://ollama.com/library/qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct)
- Chrome 加载未打包扩展文档：[https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- Chrome Web Store 发布文档：[https://developer.chrome.com/docs/webstore/publish/](https://developer.chrome.com/docs/webstore/publish/)

## 许可证

本项目使用 MIT License。详见 [LICENSE](LICENSE)。
