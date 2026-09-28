# Jiao Translator

**Idioma:** [English](README.md) | [简体中文](README.zh-CN.md) | Español | [Català](README.ca.md)

Jiao Translator es una extensión de Chrome local-first para leer artículos académicos y traducir texto seleccionado. Permite seleccionar texto en páginas web normales o en el lector integrado Jiao PDF Reader, enviar el texto seleccionado a un backend local con FastAPI y traducirlo con un modelo Qwen ejecutado localmente mediante Ollama.

El proyecto está diseñado para privacidad y estabilidad: por defecto, el texto seleccionado se procesa en tu propio ordenador sin usar una API de traducción en la nube.

## Funciones

- Traducción de texto seleccionado en páginas web normales.
- Apertura de PDF con el lector integrado Jiao PDF Reader.
- Lectura de PDF con desplazamiento vertical, similar al visor PDF nativo de Chrome.
- Traducción de texto seleccionado dentro del PDF Reader.
- Activación o desactivación de la traducción desde el popup de la extensión.
- Traducción local con Ollama y `qwen3:4b-instruct`.

## Arquitectura

```text
Página de Chrome o Jiao PDF Reader
        ↓
Scripts de la extensión de Chrome
        ↓
background.js
        ↓
http://127.0.0.1:8000/translate
        ↓
Backend local con FastAPI
        ↓
http://127.0.0.1:11434/api/chat
        ↓
Ollama + qwen3:4b-instruct
```

## Estructura del proyecto

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

## Requisitos

- Google Chrome u otro navegador basado en Chromium
- Python 3.10+
- Ollama
- `qwen3:4b-instruct` descargado con Ollama

La versión actual de la extensión es `0.2.0`.

## Instalar Ollama

Descarga Ollama desde la web oficial:

[https://ollama.com/download](https://ollama.com/download)

En macOS, descarga e instala la aplicación desde la página oficial de Ollama. La página oficial indica actualmente que se requiere macOS 14 Sonoma o una versión posterior.

En Linux, el comando oficial de instalación es:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

En Windows, usa el instalador disponible en la misma página de descarga.

Después de instalar, comprueba que Ollama está disponible:

```bash
ollama --version
```

Comprueba que la API local de Ollama está funcionando:

```bash
curl http://127.0.0.1:11434/api/version
```

Si la API no está en ejecución, abre la aplicación de Ollama o inicia el servicio manualmente:

```bash
ollama serve
```

## Descargar el modelo Qwen

Este proyecto usa la versión instruct sin thinking:

```bash
ollama pull qwen3:4b-instruct
```

Puedes probar el modelo directamente:

```bash
ollama run qwen3:4b-instruct
```

Luego escribe:

```text
请将以下英文翻译成简体中文，只输出译文，不要解释：
This paper proposes a novel framework for efficient retrieval-augmented generation.
```

Página del modelo en Ollama:

[https://ollama.com/library/qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct)

## Iniciar el backend local

Desde la raíz del proyecto:

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Inicia el backend con FastAPI:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Abre otra terminal y prueba el endpoint de salud:

```bash
curl -s http://127.0.0.1:8000/health
```

Respuesta esperada:

```json
{"ok":true,"model":"qwen3:4b-instruct"}
```

Prueba la traducción:

```bash
curl -s http://127.0.0.1:8000/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"This paper proposes a novel framework for efficient retrieval-augmented generation."}'
```

Respuesta esperada:

```json
{"translation":"本文提出了一种用于高效检索增强生成的新型框架。"}
```

Mantén abierta esta terminal del backend mientras uses la extensión de Chrome.

## Cargar la extensión en Chrome

La documentación oficial de Chrome llama a esto cargar una extensión sin empaquetar en modo desarrollador.

1. Abre Chrome.
2. Escribe esta dirección:

```text
chrome://extensions
```

3. Activa `Developer mode` en la esquina superior derecha.
4. Haz clic en `Load unpacked`.
5. Selecciona la carpeta de la extensión:

```text
Jiao_Translator/extension
```

6. Si quieres acceder rápidamente, fija `Jiao Translator` desde el menú de extensiones de Chrome.

Importante: selecciona la carpeta `extension/`, no el archivo `manifest.json` y no la raíz del proyecto.

Después de modificar archivos de la extensión, vuelve a `chrome://extensions` y haz clic en el botón de recarga de la tarjeta `Jiao Translator`. Si modificaste `content.js`, refresca también la página web donde estás probando.

## Uso en páginas web

1. Asegúrate de que Ollama está en ejecución.
2. Asegúrate de que el backend FastAPI está funcionando en `127.0.0.1:8000`.
3. Abre una página web normal, por ejemplo un artículo en inglés o una página HTML de un paper.
4. Selecciona una frase corta.
5. Espera a que aparezca la burbuja de traducción.

Las páginas internas de Chrome, como `chrome://extensions`, no sirven para probar content scripts.

## Usar el PDF Reader

El visor PDF nativo de Chrome no expone de forma fiable la selección de texto a scripts normales de extensión. Por eso este proyecto incluye un lector PDF propio basado en PDF.js.

Modo de uso:

1. Haz clic en el icono `Jiao Translator` en la barra de herramientas de Chrome.
2. Haz clic en `打开 PDF 阅读器`.
3. En la página del lector, haz clic en `打开 PDF`.
4. Elige un archivo PDF local.
5. Lee el PDF con desplazamiento vertical.
6. Selecciona texto en inglés dentro del PDF.
7. Espera a que aparezca la burbuja de traducción.

El PDF se abre localmente en el navegador. La extensión no sube el archivo PDF.

## Controles del popup

El popup de la extensión incluye:

- `启用划词翻译`: activar o desactivar la traducción de texto seleccionado.
- `打开 PDF 阅读器`: abrir el lector integrado Jiao PDF Reader.

Si la traducción está desactivada, la extensión no traducirá selecciones hasta que la vuelvas a activar.

## Privacidad

Jiao Translator está diseñado con un enfoque local-first.

- El texto seleccionado se envía al backend local en `http://127.0.0.1:8000/translate`.
- El backend envía el texto a Ollama local en `http://127.0.0.1:11434/api/chat`.
- Por defecto no se usa ninguna API de traducción en la nube.
- No se requiere inicio de sesión.
- No se recopila historial de navegación de forma intencionada.
- Los PDF locales abiertos en el PDF Reader no se suben desde la extensión.

Si modificas el backend para usar una API en la nube, actualiza esta sección antes de distribuir el proyecto.

## Dependencias

Backend:

- FastAPI
- Uvicorn
- httpx
- Pydantic

Extensión:

- Chrome Extension Manifest V3
- JavaScript
- CSS
- PDF.js

Runtime del modelo:

- Ollama
- `qwen3:4b-instruct`

El renderizado de PDF está basado en PDF.js. La licencia incluida de PDF.js se conserva en:

```text
extension/pdfjs/LICENSE
```

## Solución de problemas

### Falla `curl http://127.0.0.1:8000/health`

El backend no está en ejecución. Inícialo:

```bash
cd server
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### La extensión aparece, pero la traducción falla

Comprueba Ollama:

```bash
curl http://127.0.0.1:11434/api/version
```

Comprueba el modelo:

```bash
ollama list
```

Si hace falta:

```bash
ollama pull qwen3:4b-instruct
```

### La extensión no se actualiza después de editar archivos

Abre:

```text
chrome://extensions
```

Haz clic en el botón de recarga de la tarjeta `Jiao Translator`. Si cambiaste un content script, refresca también la página web de prueba.

### No funciona en el visor PDF nativo de Chrome

Usa el Jiao PDF Reader integrado desde el popup. El visor PDF nativo de Chrome no se comporta como una página web normal para los scripts de selección.

### El popup indica que el service worker no es válido

Abre `chrome://extensions`, busca `Jiao Translator` y entra en el enlace del service worker o de errores para inspeccionar los logs. Las causas habituales son errores de sintaxis JavaScript o archivos ausentes referenciados por `manifest.json`.

## Notas de desarrollo

Antes de subir a GitHub, no incluyas:

- `.venv/`
- `.idea/`
- `__pycache__/`
- `.DS_Store`
- archivos de modelos descargados
- archivos zip generados

El modelo Qwen se descarga y gestiona con Ollama, no con este repositorio.

## Empaquetado manual

Para GitHub Releases, puedes comprimir solo la carpeta de la extensión:

```bash
zip -r jiao-translator-extension-v0.2.0.zip extension \
  -x "*.DS_Store"
```

Los usuarios seguirán necesitando instalar Ollama, descargar el modelo e iniciar el backend local.

## Notas sobre Chrome Web Store

Este proyecto se puede enviar a Chrome Web Store, pero el paquete de la tienda debería contener solo la extensión del navegador. Los usuarios deberán ejecutar el backend local y Ollama por separado.

Antes de enviar, prepara:

- Paquete ZIP de la extensión
- Capturas para la tienda
- Iconos
- Política de privacidad
- Una explicación clara de que la extensión se conecta a `127.0.0.1:8000`
- Una explicación clara de que el backend local llama a `127.0.0.1:11434`

Documentación de publicación en Chrome Web Store:

[https://developer.chrome.com/docs/webstore/publish/](https://developer.chrome.com/docs/webstore/publish/)

## Roadmap

- Añadir caché de traducción.
- Añadir botón de copiar en la burbuja de traducción.
- Añadir selección de modelo en configuración.
- Añadir opciones de idioma de destino.
- Añadir un ayudante para iniciar el backend con un clic.
- Añadir scripts de empaquetado para GitHub y Chrome Web Store.

## Referencias

- Descarga de Ollama: [https://ollama.com/download](https://ollama.com/download)
- Qwen3 4B instruct en Ollama: [https://ollama.com/library/qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct)
- Guía de Chrome para cargar extensiones sin empaquetar: [https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- Publicación en Chrome Web Store: [https://developer.chrome.com/docs/webstore/publish/](https://developer.chrome.com/docs/webstore/publish/)

## Licencia

Este proyecto está licenciado bajo MIT License. Consulta [LICENSE](LICENSE).
