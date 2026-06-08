"""
main.py - FastAPI backend for the AI Meeting Processor.
Pipeline: audio upload → speech_to_text() → generate_summary() → JSON
"""

import asyncio
import os
import sys
import tempfile
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Path fix — makes `from speech import ...` work whether uvicorn is run from
# the project root or from inside backend/
# ---------------------------------------------------------------------------
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from speech import _get_model, speech_to_text   # noqa: E402
from summarizer import generate_summary          # noqa: E402

# ---------------------------------------------------------------------------
# Lifespan — pre-warm Whisper model at startup
# Uses asyncio.get_running_loop() (correct for Python 3.10+)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, _get_model)
    print("✅ Whisper model loaded and ready.")
    yield
    # nothing to tear down


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Meeting Processor API",
    description="Upload a meeting audio file → transcript + summary + action items.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # tighten to your frontend origin in production
    allow_credentials=False,   # must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

class MeetingResponse(BaseModel):
    transcript: str
    summary: str
    action_items: list[str]


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ALLOWED_EXTENSIONS = {".wav", ".mp3"}
MAX_FILE_SIZE_MB   = 25


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@app.post("/process-meeting", response_model=MeetingResponse)
async def process_meeting(
    file: UploadFile = File(..., description="Audio file (.wav or .mp3)"),
) -> MeetingResponse:

    # 1. Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext}'. Please upload a .wav or .mp3 file.",
        )

    # 2. Read & size-check
    audio_bytes = await file.read()
    size_mb = len(audio_bytes) / (1024 * 1024)
    if len(audio_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty. Please upload a valid .wav or .mp3 recording.",
        )
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Max is {MAX_FILE_SIZE_MB} MB.",
        )

    # 3. Save to temp file (Whisper needs a real path on disk)
    tmp_path = os.path.join(
        tempfile.gettempdir(), f"meeting_{uuid.uuid4().hex}{ext}"
    )

    try:
        with open(tmp_path, "wb") as f:
            f.write(audio_bytes)

        # 4. Transcribe in thread pool (CPU-bound, must not block event loop)
        loop = asyncio.get_running_loop()
        try:
            transcript: str = await loop.run_in_executor(
                None, speech_to_text, tmp_path
            )
        except FileNotFoundError as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500, detail=f"Transcription failed: {exc}"
            ) from exc

        # 5. Summarise in thread pool (blocking HTTP call to OpenAI)
        try:
            summary_data: dict = await loop.run_in_executor(
                None, generate_summary, transcript
            )
        except EnvironmentError as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500, detail=f"Summarization failed: {exc}"
            ) from exc

        # 6. Return (inside try — guarantees transcript/summary_data are bound)
        return MeetingResponse(
            transcript=transcript,
            summary=summary_data["summary"],
            action_items=summary_data["action_items"],
        )

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
