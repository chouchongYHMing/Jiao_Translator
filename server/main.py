from fastapi import FastAPI
from pydantic import BaseModel
import httpx

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL = "qwen3:4b-instruct"

app = FastAPI(title="Jiao Translator")


class TranslateRequest(BaseModel):
    text: str


@app.get("/health")
async def health():
    return {"ok": True, "model": MODEL}


@app.post("/translate")
async def translate(req: TranslateRequest):
    text = req.text.strip()

    if not text:
        return {"translation": ""}

    if len(text) > 3000:
        return {"translation": "选中文本过长，请分段翻译。"}

    payload = {
        "model": MODEL,
        "think": False,
        "stream": False,
        "messages": [
            {
                "role": "system",
                "content": (
                    "你是论文翻译助手。请把英文论文文本翻译成简体中文，"
                    "保留公式、变量、引用编号和专业术语。只输出译文，不要解释。"
                ),
            },
            {
                "role": "user",
                "content": text,
            },
        ],
        "options": {
            "temperature": 0.2,
            "num_predict": 1024,
        },
    }

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        data = response.json()

    return {"translation": data["message"]["content"].strip()}