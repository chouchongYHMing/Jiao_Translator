# Jiao Translator

**Idioma:** [English](README.md) | [简体中文](README.zh-CN.md) | Español | [Català](README.ca.md)

**Selecciona texto en inglés en una web o un PDF para ver su traducción al chino.** Jiao Translator es una extensión de Chrome para leer artículos académicos. Por defecto, traduce en tu propio ordenador y no requiere una cuenta.

Versión: **0.3.0** · Traducción predeterminada: **chino simplificado** · Inicio con un clic: **Windows + Chrome**

[Funciones](#features) · [Instalación](#install) · [Uso diario](#usage) · [Problemas frecuentes](#help) · [Detalles del proyecto](#details)

<a id="features"></a>

## Qué puedes hacer

| Tarea | Cómo funciona |
| --- | --- |
| Leer páginas en inglés | Selecciona un fragmento para ver la traducción en una ventana flotante |
| Leer PDF locales | Abre un archivo en el lector integrado, desplázate y selecciona texto para traducir |
| Pausar la traducción | Desmarca “启用划词翻译” en el popup de la extensión |
| Iniciar el servicio | En Windows, configura el inicio una vez y después pulsa “启动本地后端” |

Ollama y el backend local deben estar funcionando para traducir. La instalación inicial requiere internet para descargar software, dependencias y el modelo. Por defecto, la traducción no utiliza una API en la nube. Los controles de la extensión están actualmente en chino; esta guía explica sus etiquetas.

<a id="install"></a>

## Instalación inicial

Completa los pasos 1–4 para empezar a traducir. En Windows, el paso 5 permite activar el inicio con un clic.

### 1. Prepara el software y descarga el proyecto

| Software | Para qué sirve |
| --- | --- |
| Google Chrome | Instalar y usar la extensión |
| [Python 3.10+](https://www.python.org/downloads/) | Ejecutar el servicio local de traducción |
| [Ollama](https://ollama.com/download) | Ejecutar el modelo en tu ordenador |

Abre el [repositorio de GitHub](https://github.com/chouchongYHMing/Jiao_Translator), pulsa **Code → Download ZIP** y descomprímelo en una ubicación que vayas a conservar. La carpeta que contiene `server`, `extension` y `native-host` es la **raíz del proyecto** mencionada en esta guía.

Si utilizas Git, también puedes ejecutar:

```bash
git clone https://github.com/chouchongYHMing/Jiao_Translator.git
```

### 2. Descarga el modelo de traducción

Instala y abre Ollama. Después abre una nueva terminal y ejecuta:

```bash
ollama pull qwen3:4b-instruct
```

Espera a que termine la descarga y mantén Ollama en ejecución. Si no se puede conectar, abre la aplicación de Ollama o ejecuta `ollama serve` en otra terminal y vuelve a intentarlo.

### 3. Instala e inicia el backend local

Abre una terminal en la **raíz del proyecto**. Despliega las instrucciones de tu sistema y ejecútalas en orden. Crean un entorno de Python independiente, instalan las dependencias e inician el servicio.

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

**Mantén esta terminal abierta.** Visita la [página de estado del backend](http://127.0.0.1:8000/health) en el navegador. Esta respuesta indica que está funcionando:

```json
{"ok":true,"model":"qwen3:4b-instruct"}
```

### 4. Carga la extensión en Chrome

1. Introduce `chrome://extensions` en la barra de direcciones de Chrome.
2. Activa el **Modo de desarrollador** en la esquina superior derecha.
3. Pulsa **Cargar descomprimida** (Load unpacked) y selecciona la carpeta **`extension`** del proyecto.
4. Fija **Jiao Translator** desde el menú de extensiones de Chrome.
5. Abre una página normal en inglés y selecciona una frase para comprobar que aparece la traducción.

Para los PDF, utiliza “打开 PDF 阅读器” (Abrir lector PDF) en el popup. Las páginas internas de Chrome, como `chrome://extensions`, no admiten traducción de texto seleccionado.

### 5. Activa el inicio con un clic (opcional, solo Windows / Chrome)

Configúralo una vez para iniciar el backend desde el botón de la extensión en los usos posteriores.

1. Busca Jiao Translator en `chrome://extensions` y copia su **ID de 32 caracteres**.
2. **Abre otra ventana de PowerShell en la raíz del proyecto.** Sustituye `YOUR_32_CHARACTER_EXTENSION_ID` entre las comillas por tu ID y ejecuta:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\native-host\windows\install.ps1 -ExtensionId "YOUR_32_CHARACTER_EXTENSION_ID"
```

3. Vuelve a `chrome://extensions` y pulsa **Recargar** en la tarjeta de Jiao Translator.
4. Cuando el backend esté detenido, pulsa **启动本地后端** (Iniciar backend local). Se abrirá una terminal, se activará el entorno virtual y se iniciará el servicio.

El botón está desactivado mientras el backend está funcionando. Ollama también debe estar en ejecución. Repite el instalador si mueves el proyecto o cambia el ID de la extensión.

<a id="usage"></a>

## Uso diario

Después de instalar: **abre Ollama → inicia el backend → lee y traduce**. No es necesario volver a crear el entorno virtual ni descargar el modelo cada vez.

En Windows, utiliza el botón “启动本地后端” si ya lo has configurado. En los demás casos, abre una nueva terminal en la raíz del proyecto y ejecuta:

<details>
<summary>Inicio manual (Windows / macOS / Linux)</summary>

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

- **Páginas web:** selecciona un fragmento corto y espera la traducción.
- **PDF:** pulsa el icono de la extensión → 打开 PDF 阅读器 (Abrir lector PDF) → 打开 PDF (Abrir PDF) → elige un archivo local y selecciona texto.
- **Pausar la traducción:** desmarca 启用划词翻译 (Activar traducción de texto seleccionado).
- **Detener el backend:** pulsa `Ctrl+C` en su terminal.

<a id="help"></a>

## Problemas frecuentes

| Problema | Solución |
| --- | --- |
| No se encuentra `py` o `python3` | Comprueba que Python esté instalado y abre una nueva terminal |
| No se abre la página de estado | Revisa los errores en la terminal del backend y sigue los pasos de inicio diario |
| El backend funciona, pero falla la traducción | Mantén Ollama funcionando y comprueba con `ollama list` que existe `qwen3:4b-instruct` |
| El popup indica que falta el componente de inicio | Completa el paso 5 con el ID actual y recarga la extensión |
| Falta `.venv` o Uvicorn | Repite el paso 3 e instala las dependencias en `server/.venv` |
| Device Guard bloquea `uvicorn.exe` al iniciar con un clic | Actualiza el proyecto y repite el instalador del paso 5. Ahora se utiliza `python.exe -m uvicorn` del entorno virtual; si la política también bloquea Python, consulta al administrador del equipo sobre una forma autorizada de ejecutarlo |
| El puerto 8000 está ocupado | Comprueba si ya hay un backend abierto; detén otra aplicación que ocupe el puerto si es necesario |
| No traduce en el visor PDF de Chrome | Abre el archivo en Jiao PDF Reader |
| No aparecen los cambios tras actualizar | Recarga la extensión en `chrome://extensions`, refresca la página y vuelve a abrir el lector PDF |

La página de estado solo confirma que el backend es accesible. Para traducir también hacen falta Ollama y el modelo descargado.

<a id="details"></a>

## Detalles del proyecto

Estas secciones explican el funcionamiento, el flujo de datos y el desarrollo para quienes quieran conocer o modificar el proyecto.

### Arquitectura

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

### Estructura del proyecto

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

### Privacidad

Jiao Translator está diseñado con un enfoque local-first.

- El texto seleccionado se envía al backend local en `http://127.0.0.1:8000/translate`.
- El backend envía el texto a Ollama local en `http://127.0.0.1:11434/api/chat`.
- Por defecto no se usa ninguna API de traducción en la nube.
- No se requiere inicio de sesión.
- No se recopila historial de navegación de forma intencionada.
- Los PDF locales abiertos en el PDF Reader no se suben desde la extensión.

Si modificas el backend para usar una API en la nube, actualiza esta sección antes de distribuir el proyecto.

### Dependencias

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

### Componente de inicio para Windows

La extensión llama a un componente local mediante Chrome Native Messaging. El instalador utiliza el compilador C# de .NET Framework de Windows, escribe los archivos generados en `build/native-host` y registra el componente para el usuario actual. El acceso queda limitado al ID de extensión indicado durante la instalación.

El componente abre una terminal, activa `server/.venv` y ejecuta `.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload`. Así carga el módulo Uvicorn con el intérprete Python del entorno virtual. macOS y Linux utilizan por ahora el inicio manual.

### Notas de desarrollo

Antes de subir a GitHub, no incluyas:

- `.venv/`
- `.idea/`
- `__pycache__/`
- `.DS_Store`
- archivos de modelos descargados
- archivos zip generados

El modelo Qwen se descarga y gestiona con Ollama, no con este repositorio.

### Empaquetado manual

Para GitHub Releases, empaqueta solo la carpeta `extension`.

macOS / Linux:

```bash
zip -r jiao-translator-extension-v0.3.0.zip extension \
  -x "*.DS_Store"
```

Windows PowerShell:

```powershell
Compress-Archive -Path extension -DestinationPath jiao-translator-extension-v0.3.0.zip -Force
```

El ZIP de la extensión solo contiene la parte del navegador. La instalación completa necesita `server/` y `native-host/windows/` en su estructura original; distribuye también el código fuente completo del proyecto. Cada usuario instala el modelo y el entorno virtual localmente.

### Notas sobre Chrome Web Store

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

### Roadmap

- Añadir caché de traducción.
- Añadir botón de copiar en la burbuja de traducción.
- Añadir selección de modelo en configuración.
- Añadir opciones de idioma de destino.
- Añadir scripts de empaquetado para GitHub y Chrome Web Store.

### Referencias

- Descarga de Ollama: [https://ollama.com/download](https://ollama.com/download)
- Qwen3 4B instruct en Ollama: [https://ollama.com/library/qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct)
- Guía de Chrome para cargar extensiones sin empaquetar: [https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- Publicación en Chrome Web Store: [https://developer.chrome.com/docs/webstore/publish/](https://developer.chrome.com/docs/webstore/publish/)

### Licencia

Este proyecto está licenciado bajo MIT License. Consulta [LICENSE](LICENSE).
