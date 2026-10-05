# Jiao Translator

**Idioma:** [English](README.md) | [简体中文](README.zh-CN.md) | [Español](README.es.md) | Català

**Selecciona text en anglès en una web o un PDF per veure'n la traducció al xinès.** Jiao Translator és una extensió de Chrome per llegir articles acadèmics. Per defecte, tradueix al teu ordinador i no cal tenir cap compte.

Versió: **0.3.0** · Traducció predeterminada: **xinès simplificat** · Inici amb un clic: **Windows + Chrome**

[Funcions](#features) · [Instal·lació](#install) · [Ús diari](#usage) · [Problemes freqüents](#help) · [Detalls del projecte](#details)

<a id="features"></a>

## Què pots fer

| Tasca | Com funciona |
| --- | --- |
| Llegir pàgines en anglès | Selecciona un fragment per veure la traducció en una finestra flotant |
| Llegir PDF locals | Obre un fitxer al lector integrat, desplaça't i selecciona text per traduir |
| Pausar la traducció | Desmarca “启用划词翻译” a la finestra de l'extensió |
| Iniciar el servei | A Windows, configura l'inici una vegada i després prem “启动本地后端” |

Ollama i el backend local han d'estar en execució per traduir. La instal·lació inicial requereix internet per descarregar programari, dependències i el model. Per defecte, la traducció no utilitza cap API al núvol. Els controls de l'extensió són actualment en xinès; aquesta guia n'explica les etiquetes.

<a id="install"></a>

## Instal·lació inicial

Completa els passos 1–4 per començar a traduir. A Windows, el pas 5 permet activar l'inici amb un clic.

### 1. Prepara el programari i descarrega el projecte

| Programari | Per a què serveix |
| --- | --- |
| Google Chrome | Instal·lar i utilitzar l'extensió |
| [Python 3.10+](https://www.python.org/downloads/) | Executar el servei local de traducció |
| [Ollama](https://ollama.com/download) | Executar el model a l'ordinador |

Obre el [repositori de GitHub](https://github.com/chouchongYHMing/Jiao_Translator), prem **Code → Download ZIP** i descomprimeix-lo en una ubicació que vulguis conservar. La carpeta que conté `server`, `extension` i `native-host` és l'**arrel del projecte** esmentada en aquesta guia.

Si utilitzes Git, també pots executar:

```bash
git clone https://github.com/chouchongYHMing/Jiao_Translator.git
```

### 2. Descarrega el model de traducció

Instal·la i obre Ollama. Després obre un terminal nou i executa:

```bash
ollama pull qwen3:4b-instruct
```

Espera que acabi la descàrrega i mantén Ollama en execució. Si no s'hi pot connectar, obre l'aplicació d'Ollama o executa `ollama serve` en un altre terminal i torna-ho a provar.

### 3. Instal·la i inicia el backend local

Obre un terminal a l'**arrel del projecte**. Desplega les instruccions del teu sistema i executa-les en ordre. Creen un entorn de Python independent, instal·len les dependències i inicien el servei.

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

**Mantén aquest terminal obert.** Visita la [pàgina d'estat del backend](http://127.0.0.1:8000/health) al navegador. Aquesta resposta indica que està funcionant:

```json
{"ok":true,"model":"qwen3:4b-instruct"}
```

### 4. Carrega l'extensió a Chrome

1. Introdueix `chrome://extensions` a la barra d'adreces de Chrome.
2. Activa el **Mode de desenvolupador** a la cantonada superior dreta.
3. Prem **Carrega una extensió desempaquetada** (Load unpacked) i selecciona la carpeta **`extension`** del projecte.
4. Fixa **Jiao Translator** des del menú d'extensions de Chrome.
5. Obre una pàgina normal en anglès i selecciona una frase per comprovar que apareix la traducció.

Per als PDF, utilitza “打开 PDF 阅读器” (Obrir el lector PDF) a la finestra de l'extensió. Les pàgines internes de Chrome, com ara `chrome://extensions`, no admeten la traducció de text seleccionat.

### 5. Activa l'inici amb un clic (opcional, només Windows / Chrome)

Configura'l una vegada per iniciar el backend des del botó de l'extensió en els usos posteriors.

1. Busca Jiao Translator a `chrome://extensions` i copia'n l'**ID de 32 caràcters**.
2. **Obre una altra finestra de PowerShell a l'arrel del projecte.** Substitueix `YOUR_32_CHARACTER_EXTENSION_ID` entre les cometes pel teu ID i executa:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\native-host\windows\install.ps1 -ExtensionId "YOUR_32_CHARACTER_EXTENSION_ID"
```

3. Torna a `chrome://extensions` i prem **Recarrega** a la targeta de Jiao Translator.
4. Quan el backend estigui aturat, prem **启动本地后端** (Iniciar el backend local). S'obrirà un terminal, s'activarà l'entorn virtual i s'iniciarà el servei.

El botó està desactivat mentre el backend està funcionant. Ollama també ha d'estar en execució. Repeteix l'instal·lador si mous el projecte o canvia l'ID de l'extensió.

<a id="usage"></a>

## Ús diari

Després de la instal·lació: **obre Ollama → inicia el backend → llegeix i tradueix**. No cal tornar a crear l'entorn virtual ni descarregar el model cada vegada.

A Windows, utilitza el botó “启动本地后端” si ja l'has configurat. En els altres casos, obre un terminal nou a l'arrel del projecte i executa:

<details>
<summary>Inici manual (Windows / macOS / Linux)</summary>

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

- **Pàgines web:** selecciona un fragment curt i espera la traducció.
- **PDF:** prem la icona de l'extensió → 打开 PDF 阅读器 (Obrir el lector PDF) → 打开 PDF (Obrir PDF) → tria un fitxer local i selecciona text.
- **Pausar la traducció:** desmarca 启用划词翻译 (Activar la traducció de text seleccionat).
- **Aturar el backend:** prem `Ctrl+C` al seu terminal.

<a id="help"></a>

## Problemes freqüents

| Problema | Solució |
| --- | --- |
| No es troba `py` o `python3` | Comprova que Python estigui instal·lat i obre un terminal nou |
| No s'obre la pàgina d'estat | Revisa els errors al terminal del backend i segueix els passos d'inici diari |
| El backend funciona, però falla la traducció | Mantén Ollama en execució i comprova amb `ollama list` que hi ha `qwen3:4b-instruct` |
| La finestra indica que falta el component d'inici | Completa el pas 5 amb l'ID actual i recarrega l'extensió |
| Falta `.venv` o Uvicorn | Repeteix el pas 3 i instal·la les dependències a `server/.venv` |
| Device Guard bloqueja `uvicorn.exe` en iniciar amb un clic | Actualitza el projecte i repeteix l'instal·lador del pas 5. Ara s'utilitza `python.exe -m uvicorn` de l'entorn virtual; si la política també bloqueja Python, consulta l'administrador de l'equip sobre una manera autoritzada d'executar-lo |
| El port 8000 està ocupat | Comprova si ja hi ha un backend obert; atura una altra aplicació que ocupi el port si cal |
| No tradueix al visor PDF de Chrome | Obre el fitxer a Jiao PDF Reader |
| No apareixen els canvis després d'actualitzar | Recarrega l'extensió a `chrome://extensions`, actualitza la pàgina i torna a obrir el lector PDF |

La pàgina d'estat només confirma que el backend és accessible. Per traduir també calen Ollama i el model descarregat.

<a id="details"></a>

## Detalls del projecte

Aquestes seccions expliquen el funcionament, el flux de dades i el desenvolupament per a qui vulgui conèixer o modificar el projecte.

### Arquitectura

```text
Pàgina de Chrome o Jiao PDF Reader
        ↓
Scripts de l'extensió de Chrome
        ↓
background.js
        ↓
http://127.0.0.1:8000/translate
        ↓
Backend local amb FastAPI
        ↓
http://127.0.0.1:11434/api/chat
        ↓
Ollama + qwen3:4b-instruct
```

### Estructura del projecte

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

### Privadesa

Jiao Translator està dissenyat amb un enfocament local-first.

- El text seleccionat s'envia al backend local a `http://127.0.0.1:8000/translate`.
- El backend envia el text a Ollama local a `http://127.0.0.1:11434/api/chat`.
- Per defecte no s'utilitza cap API de traducció al núvol.
- No cal iniciar sessió.
- No es recopila historial de navegació de manera intencionada.
- Els PDF locals oberts al PDF Reader no es pugen des de l'extensió.

Si modifiques el backend per utilitzar una API al núvol, actualitza aquesta secció abans de distribuir el projecte.

### Dependències

Backend:

- FastAPI
- Uvicorn
- httpx
- Pydantic

Extensió:

- Chrome Extension Manifest V3
- JavaScript
- CSS
- PDF.js

Runtime del model:

- Ollama
- `qwen3:4b-instruct`

El renderitzat de PDF està basat en PDF.js. La llicència inclosa de PDF.js es conserva a:

```text
extension/pdfjs/LICENSE
```

### Component d'inici per a Windows

L'extensió crida un component local mitjançant Chrome Native Messaging. L'instal·lador utilitza el compilador C# de .NET Framework de Windows, escriu els fitxers generats a `build/native-host` i registra el component per a l'usuari actual. L'accés queda limitat a l'ID d'extensió indicat durant la instal·lació.

El component obre un terminal, activa `server/.venv` i executa `.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload`. Així carrega el mòdul Uvicorn amb l'intèrpret Python de l'entorn virtual. macOS i Linux utilitzen de moment l'inici manual.

### Notes de desenvolupament

Abans de pujar-ho a GitHub, no incloguis:

- `.venv/`
- `.idea/`
- `__pycache__/`
- `.DS_Store`
- fitxers de models descarregats
- fitxers zip generats

El model Qwen es descarrega i es gestiona amb Ollama, no amb aquest repositori.

### Empaquetatge manual

Per a GitHub Releases, empaqueta només la carpeta `extension`.

macOS / Linux:

```bash
zip -r jiao-translator-extension-v0.3.0.zip extension \
  -x "*.DS_Store"
```

Windows PowerShell:

```powershell
Compress-Archive -Path extension -DestinationPath jiao-translator-extension-v0.3.0.zip -Force
```

El ZIP de l'extensió només conté la part del navegador. La instal·lació completa necessita `server/` i `native-host/windows/` en l'estructura original; distribueix també el codi font complet del projecte. Cada usuari instal·la el model i l'entorn virtual localment.

### Notes sobre Chrome Web Store

Aquest projecte es pot enviar a Chrome Web Store, però el paquet de la botiga hauria de contenir només l'extensió del navegador. Els usuaris hauran d'executar el backend local i Ollama per separat.

Abans d'enviar-lo, prepara:

- Paquet ZIP de l'extensió
- Captures per a la botiga
- Icones
- Política de privadesa
- Una explicació clara que l'extensió es connecta a `127.0.0.1:8000`
- Una explicació clara que el backend local crida `127.0.0.1:11434`

Documentació de publicació a Chrome Web Store:

[https://developer.chrome.com/docs/webstore/publish/](https://developer.chrome.com/docs/webstore/publish/)

### Roadmap

- Afegir memòria cau de traduccions.
- Afegir un botó de copiar a la bombolla de traducció.
- Afegir selecció de model a la configuració.
- Afegir opcions d'idioma de destinació.
- Afegir scripts d'empaquetatge per a GitHub i Chrome Web Store.

### Referències

- Descàrrega d'Ollama: [https://ollama.com/download](https://ollama.com/download)
- Qwen3 4B instruct a Ollama: [https://ollama.com/library/qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct)
- Guia de Chrome per carregar extensions sense empaquetar: [https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- Publicació a Chrome Web Store: [https://developer.chrome.com/docs/webstore/publish/](https://developer.chrome.com/docs/webstore/publish/)

### Llicència

Aquest projecte està llicenciat sota MIT License. Consulta [LICENSE](LICENSE).
