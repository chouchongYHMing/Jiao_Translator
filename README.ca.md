# Jiao Translator

**Idioma:** [English](README.md) | [简体中文](README.zh-CN.md) | [Español](README.es.md) | Català

Jiao Translator és una extensió de Chrome local-first per llegir articles acadèmics i traduir text seleccionat. Permet seleccionar text en pàgines web normals o al lector integrat Jiao PDF Reader, enviar el text seleccionat a un backend local amb FastAPI i traduir-lo amb un model Qwen executat localment mitjançant Ollama.

El projecte està pensat per a la privadesa i per a fluxos de lectura estables: per defecte, el text seleccionat es processa al teu propi ordinador sense utilitzar cap API de traducció al núvol.

## Funcions

- Traducció de text seleccionat en pàgines web normals.
- Obertura de PDF amb el lector integrat Jiao PDF Reader.
- Lectura de PDF amb desplaçament vertical, semblant al visor PDF natiu de Chrome.
- Traducció de text seleccionat dins del PDF Reader.
- Activació o desactivació de la traducció des del popup de l'extensió.
- Traducció local amb Ollama i `qwen3:4b-instruct`.

## Arquitectura

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

## Estructura del projecte

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

## Requisits

- Google Chrome o un altre navegador basat en Chromium
- Python 3.10+
- Ollama
- `qwen3:4b-instruct` descarregat amb Ollama

La versió actual de l'extensió és `0.2.0`.

## Instal·lar Ollama

Descarrega Ollama des del lloc web oficial:

[https://ollama.com/download](https://ollama.com/download)

A macOS, descarrega i instal·la l'aplicació des de la pàgina oficial d'Ollama. La pàgina oficial indica actualment que cal macOS 14 Sonoma o una versió posterior.

A Linux, l'ordre oficial d'instal·lació és:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

A Windows, utilitza l'instal·lador disponible a la mateixa pàgina de descàrrega.

Després d'instal·lar-lo, comprova que Ollama està disponible:

```bash
ollama --version
```

Comprova que l'API local d'Ollama està funcionant:

```bash
curl http://127.0.0.1:11434/api/version
```

Si l'API no està en execució, obre l'aplicació d'Ollama o inicia el servei manualment:

```bash
ollama serve
```

## Descarregar el model Qwen

Aquest projecte utilitza la versió instruct sense thinking:

```bash
ollama pull qwen3:4b-instruct
```

Pots provar el model directament:

```bash
ollama run qwen3:4b-instruct
```

Després escriu:

```text
请将以下英文翻译成简体中文，只输出译文，不要解释：
This paper proposes a novel framework for efficient retrieval-augmented generation.
```

Pàgina del model a Ollama:

[https://ollama.com/library/qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct)

## Iniciar el backend local

Des de l'arrel del projecte:

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Inicia el backend amb FastAPI:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Obre una altra terminal i prova l'endpoint de salut:

```bash
curl -s http://127.0.0.1:8000/health
```

Resposta esperada:

```json
{"ok":true,"model":"qwen3:4b-instruct"}
```

Prova la traducció:

```bash
curl -s http://127.0.0.1:8000/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"This paper proposes a novel framework for efficient retrieval-augmented generation."}'
```

Resposta esperada:

```json
{"translation":"本文提出了一种用于高效检索增强生成的新型框架。"}
```

Mantén oberta aquesta terminal del backend mentre utilitzis l'extensió de Chrome.

## Carregar l'extensió a Chrome

La documentació oficial de Chrome anomena aquest procés carregar una extensió sense empaquetar en mode desenvolupador.

1. Obre Chrome.
2. Escriu aquesta adreça:

```text
chrome://extensions
```

3. Activa `Developer mode` a la cantonada superior dreta.
4. Fes clic a `Load unpacked`.
5. Selecciona la carpeta de l'extensió:

```text
Jiao_Translator/extension
```

6. Si vols accedir-hi ràpidament, fixa `Jiao Translator` des del menú d'extensions de Chrome.

Important: selecciona la carpeta `extension/`, no el fitxer `manifest.json` i no l'arrel del projecte.

Després de modificar fitxers de l'extensió, torna a `chrome://extensions` i fes clic al botó de recàrrega de la targeta `Jiao Translator`. Si has modificat `content.js`, refresca també la pàgina web on estàs fent proves.

## Ús en pàgines web

1. Assegura't que Ollama està en execució.
2. Assegura't que el backend FastAPI funciona a `127.0.0.1:8000`.
3. Obre una pàgina web normal, per exemple un article en anglès o una pàgina HTML d'un paper.
4. Selecciona una frase curta.
5. Espera que aparegui la bombolla de traducció.

Les pàgines internes de Chrome, com ara `chrome://extensions`, no serveixen per provar content scripts.

## Utilitzar el PDF Reader

El visor PDF natiu de Chrome no exposa de manera fiable la selecció de text als scripts normals d'una extensió. Per això aquest projecte inclou un lector PDF propi basat en PDF.js.

Mode d'ús:

1. Fes clic a la icona `Jiao Translator` a la barra d'eines de Chrome.
2. Fes clic a `打开 PDF 阅读器`.
3. A la pàgina del lector, fes clic a `打开 PDF`.
4. Tria un fitxer PDF local.
5. Llegeix el PDF amb desplaçament vertical.
6. Selecciona text en anglès dins del PDF.
7. Espera que aparegui la bombolla de traducció.

El PDF s'obre localment al navegador. L'extensió no puja el fitxer PDF.

## Controls del popup

El popup de l'extensió inclou:

- `启用划词翻译`: activar o desactivar la traducció de text seleccionat.
- `打开 PDF 阅读器`: obrir el lector integrat Jiao PDF Reader.

Si la traducció està desactivada, l'extensió no traduirà seleccions fins que la tornis a activar.

## Privadesa

Jiao Translator està dissenyat amb un enfocament local-first.

- El text seleccionat s'envia al backend local a `http://127.0.0.1:8000/translate`.
- El backend envia el text a Ollama local a `http://127.0.0.1:11434/api/chat`.
- Per defecte no s'utilitza cap API de traducció al núvol.
- No cal iniciar sessió.
- No es recopila historial de navegació de manera intencionada.
- Els PDF locals oberts al PDF Reader no es pugen des de l'extensió.

Si modifiques el backend per utilitzar una API al núvol, actualitza aquesta secció abans de distribuir el projecte.

## Dependències

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

## Solució de problemes

### Falla `curl http://127.0.0.1:8000/health`

El backend no està en execució. Inicia'l:

```bash
cd server
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### L'extensió apareix, però la traducció falla

Comprova Ollama:

```bash
curl http://127.0.0.1:11434/api/version
```

Comprova el model:

```bash
ollama list
```

Si cal:

```bash
ollama pull qwen3:4b-instruct
```

### L'extensió no s'actualitza després d'editar fitxers

Obre:

```text
chrome://extensions
```

Fes clic al botó de recàrrega de la targeta `Jiao Translator`. Si has canviat un content script, refresca també la pàgina web de prova.

### No funciona al visor PDF natiu de Chrome

Utilitza el Jiao PDF Reader integrat des del popup. El visor PDF natiu de Chrome no es comporta com una pàgina web normal per als scripts de selecció.

### El popup indica que el service worker no és vàlid

Obre `chrome://extensions`, busca `Jiao Translator` i entra a l'enllaç del service worker o dels errors per inspeccionar els logs. Les causes habituals són errors de sintaxi JavaScript o fitxers inexistents referenciats per `manifest.json`.

## Notes de desenvolupament

Abans de pujar-ho a GitHub, no incloguis:

- `.venv/`
- `.idea/`
- `__pycache__/`
- `.DS_Store`
- fitxers de models descarregats
- fitxers zip generats

El model Qwen es descarrega i es gestiona amb Ollama, no amb aquest repositori.

## Empaquetatge manual

Per a GitHub Releases, pots comprimir només la carpeta de l'extensió:

```bash
zip -r jiao-translator-extension-v0.2.0.zip extension \
  -x "*.DS_Store"
```

Els usuaris encara hauran d'instal·lar Ollama, descarregar el model i iniciar el backend local.

## Notes sobre Chrome Web Store

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

## Roadmap

- Afegir memòria cau de traduccions.
- Afegir un botó de copiar a la bombolla de traducció.
- Afegir selecció de model a la configuració.
- Afegir opcions d'idioma de destinació.
- Afegir una eina auxiliar per iniciar el backend amb un clic.
- Afegir scripts d'empaquetatge per a GitHub i Chrome Web Store.

## Referències

- Descàrrega d'Ollama: [https://ollama.com/download](https://ollama.com/download)
- Qwen3 4B instruct a Ollama: [https://ollama.com/library/qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct)
- Guia de Chrome per carregar extensions sense empaquetar: [https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- Publicació a Chrome Web Store: [https://developer.chrome.com/docs/webstore/publish/](https://developer.chrome.com/docs/webstore/publish/)

## Llicència

Aquest projecte està llicenciat sota MIT License. Consulta [LICENSE](LICENSE).
