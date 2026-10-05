# Jiao Translator

**语言：** [English](README.md) | 简体中文 | [Español](README.es.md) | [Català](README.ca.md)

**在网页和 PDF 中选中英文，即可查看中文翻译。** Jiao Translator 是面向论文阅读的 Chrome 扩展，默认在你的电脑上完成翻译，无需登录账号。

当前版本：**0.3.0** · 默认译为**简体中文** · 一键启动支持 **Windows + Chrome**

[功能](#features) · [首次安装](#install) · [日常使用](#usage) · [常见问题](#help) · [项目详细介绍](#details)

<a id="features"></a>

## 可以做什么

| 场景 | 使用方式 |
| --- | --- |
| 阅读英文网页 | 选中一段文字，在浮窗中查看译文 |
| 阅读本地 PDF | 用内置 PDF 阅读器打开文件，滚动阅读并划词翻译 |
| 临时关闭翻译 | 在扩展弹窗中取消勾选“启用划词翻译” |
| 启动翻译服务 | Windows 用户完成一次配置后，可点击“启动本地后端” |

翻译需要电脑上的 Ollama 和本地后端同时运行。首次安装需要联网下载软件、依赖和模型；默认翻译流程不调用云端翻译 API。

<a id="install"></a>

## 首次安装

依次完成下面四步，就可以开始翻译。Windows 用户还可以完成第五步，启用一键启动。

### 1. 准备软件并下载项目

| 需要准备 | 用途 |
| --- | --- |
| Google Chrome | 安装和使用扩展 |
| [Python 3.10+](https://www.python.org/downloads/) | 运行本地翻译服务 |
| [Ollama](https://ollama.com/download) | 在电脑上运行翻译模型 |

打开 [GitHub 项目页面](https://github.com/chouchongYHMing/Jiao_Translator)，点击 **Code → Download ZIP**，解压到一个准备长期保留的位置。包含 `server`、`extension` 和 `native-host` 的文件夹就是下文所说的**项目根目录**。

熟悉 Git 的用户也可以执行：

```bash
git clone https://github.com/chouchongYHMing/Jiao_Translator.git
```

### 2. 下载翻译模型

安装并打开 Ollama，然后新开一个终端，执行：

```bash
ollama pull qwen3:4b-instruct
```

等待下载完成，并保持 Ollama 运行。如果提示无法连接 Ollama，先打开 Ollama 应用，或在另一个终端运行 `ollama serve`，再重试。

### 3. 安装并启动本地后端

在**项目根目录**打开终端，展开对应系统的命令并依次执行。这会创建独立的 Python 环境、安装依赖，并启动翻译服务。

<details open>
<summary>Windows（PowerShell）</summary>

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

**保持这个终端打开。** 在浏览器访问 [后端状态页面](http://127.0.0.1:8000/health)，看到下面的内容，说明后端已启动：

```json
{"ok":true,"model":"qwen3:4b-instruct"}
```

### 4. 加载 Chrome 扩展

1. 在 Chrome 地址栏输入 `chrome://extensions`。
2. 打开右上角的**开发者模式**。
3. 点击**加载已解压的扩展程序**（Load unpacked），选择项目中的 **`extension` 文件夹**。
4. 在 Chrome 工具栏的扩展菜单中固定 **Jiao Translator**。
5. 打开一个普通英文网页，选中一句英文，确认出现翻译浮窗。

PDF 请通过扩展弹窗中的“打开 PDF 阅读器”进行阅读。Chrome 内部页面（如 `chrome://extensions`）不支持划词翻译。

### 5. 配置一键启动（可选，仅 Windows / Chrome）

这一步只需设置一次，完成后每次使用都可以通过扩展按钮启动后端。

1. 在 `chrome://extensions` 找到 Jiao Translator，复制卡片上的 **32 位扩展 ID**。
2. **新开一个 PowerShell 窗口，进入项目根目录**。将下面引号中的 `YOUR_32_CHARACTER_EXTENSION_ID` 替换为你的扩展 ID，再执行：

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\native-host\windows\install.ps1 -ExtensionId "YOUR_32_CHARACTER_EXTENSION_ID"
```

3. 回到 `chrome://extensions`，点击 Jiao Translator 卡片上的**重新加载**按钮。
4. 下次后端尚未运行时，打开扩展弹窗，点击**启动本地后端**。系统会打开终端、激活虚拟环境并启动服务。

如果后端已经运行，启动按钮会禁用。这个按钮只负责启动后端；Ollama 仍需保持运行。移动项目目录或更换扩展 ID 后，需要重新执行安装命令。

<a id="usage"></a>

## 日常使用

安装完成后，日常只需**打开 Ollama → 启动后端 → 开始阅读**，不必重复创建虚拟环境或下载模型。

Windows 用户可使用已配置的“启动本地后端”按钮。其他情况，在项目根目录新开终端，执行对应命令：

<details>
<summary>手动启动命令（Windows / macOS / Linux）</summary>

Windows PowerShell：

```powershell
cd server
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

macOS / Linux：

```bash
cd server
.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

</details>

- **网页翻译：** 打开英文网页，选中一小段文字，等待译文出现。
- **PDF 翻译：** 点击扩展图标 → 打开 PDF 阅读器 → 打开 PDF → 选择本地文件，再选中文字。
- **暂停翻译：** 在扩展弹窗中取消勾选“启用划词翻译”。
- **停止后端：** 在运行服务的终端按 `Ctrl+C`。

<a id="help"></a>

## 常见问题

| 遇到的问题 | 处理方式 |
| --- | --- |
| `py` 或 `python3` 命令不存在 | 确认 Python 已安装，重新打开终端后再试 |
| 无法访问后端状态页面 | 查看后端终端是否报错，并按上面的日常启动步骤启动服务 |
| 后端正常，但翻译失败 | 确认 Ollama 正在运行；执行 `ollama list` 检查是否有 `qwen3:4b-instruct` |
| 提示“未安装本机启动组件” | 按第五步安装，确认使用的是当前扩展 ID，然后重新加载扩展 |
| 提示缺少 `.venv` 或 Uvicorn | 重新完成第三步，确认依赖安装在 `server/.venv` 中 |
| 一键启动提示 `uvicorn.exe` 被 Device Guard 阻止 | 更新项目后重新执行第五步的安装命令，以更新本机启动组件。新版通过虚拟环境的 `python.exe -m uvicorn` 启动；若 Python 也被策略阻止，请联系设备管理员确认允许的运行方式 |
| 提示 8000 端口被占用 | 检查是否已有后端终端；如果是其他程序，请先停止占用端口的程序 |
| 在 Chrome 自带 PDF 阅读器中不能翻译 | 使用扩展内置的 Jiao PDF Reader 打开 PDF |
| 更新代码后没有变化 | 在 `chrome://extensions` 重新加载扩展，并刷新目标网页；PDF 阅读器请重新打开 |

后端状态页面只确认后端可访问；完整翻译还依赖 Ollama 和已下载的模型。

<a id="details"></a>

## 项目详细介绍

下面介绍工作原理、数据流和开发资料，供希望了解或修改项目的读者参考。

### 架构

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

### 项目结构

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

### 隐私说明

Jiao Translator 采用本地优先设计。

- 选中文本会发送到本地后端：`http://127.0.0.1:8000/translate`。
- 后端会调用本地 Ollama：`http://127.0.0.1:11434/api/chat`。
- 默认不使用云端翻译 API。
- 不需要账号登录。
- 不主动收集浏览历史。
- PDF Reader 打开的本地 PDF 文件不会被扩展上传。

如果你修改后端，让它调用云端 API，请在发布前同步更新这一节。

### 技术依赖

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

### Windows 启动组件

扩展通过 Chrome Native Messaging 调用本机组件。安装脚本使用 Windows 的 .NET Framework C# 编译器构建程序，将文件写入 `build/native-host`，并为当前用户注册 Chrome 主机。允许调用的扩展由安装时提供的 ID 限定。

点击启动按钮后，组件打开终端，激活 `server/.venv`，再运行 `.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload`。该命令使用虚拟环境中的 Python 加载 Uvicorn 模块。macOS 和 Linux 目前使用手动启动方式。

### 开发说明

提交到 GitHub 前，请不要提交：

- `.venv/`
- `.idea/`
- `__pycache__/`
- `.DS_Store`
- 下载好的模型文件
- 生成的 zip 文件

Qwen 模型由 Ollama 下载和管理，不应该放进这个仓库。

### 手动打包扩展

如果要在 GitHub Releases 中发布扩展压缩包，只需要打包 `extension` 目录。

macOS / Linux：

```bash
zip -r jiao-translator-extension-v0.3.0.zip extension \
  -x "*.DS_Store"
```

Windows PowerShell：

```powershell
Compress-Archive -Path extension -DestinationPath jiao-translator-extension-v0.3.0.zip -Force
```

扩展 ZIP 只包含浏览器端。完整安装需要保留项目中的 `server/` 和 `native-host/windows/` 及其目录关系；向用户分发时，请同时提供完整项目源码。模型和虚拟环境由用户在本机安装。

### Chrome Web Store 说明

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

### Roadmap

- 添加翻译缓存。
- 在翻译浮窗中添加复制按钮。
- 添加模型选择页面。
- 添加目标语言选项。
- 添加 GitHub 和 Chrome Web Store 打包脚本。

### 参考资料

- Ollama 下载：[https://ollama.com/download](https://ollama.com/download)
- Qwen3 4B instruct on Ollama：[https://ollama.com/library/qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct)
- Chrome 加载未打包扩展文档：[https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- Chrome Web Store 发布文档：[https://developer.chrome.com/docs/webstore/publish/](https://developer.chrome.com/docs/webstore/publish/)

### 许可证

本项目使用 MIT License。详见 [LICENSE](LICENSE)。
