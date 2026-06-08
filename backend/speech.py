"""
speech.py - Speech-to-text module using OpenAI Whisper.

Uses imageio-ffmpeg to provide a bundled ffmpeg binary so no system-level
ffmpeg installation or PATH configuration is needed.
"""

import os
import imageio_ffmpeg
import whisper

# ---------------------------------------------------------------------------
# Point Whisper's audio decoder at the bundled ffmpeg from imageio-ffmpeg.
# This avoids any dependency on ffmpeg being installed system-wide or on PATH.
# ---------------------------------------------------------------------------
os.environ["PATH"] = (
    os.path.dirname(imageio_ffmpeg.get_ffmpeg_exe())
    + os.pathsep
    + os.environ.get("PATH", "")
)

# Whisper uses the name "ffmpeg" to find the binary — create a symlink-style
# workaround by copying the exe name into the environment so subprocess finds it.
_FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
_FFMPEG_DIR = os.path.dirname(_FFMPEG_EXE)

# If the bundled exe has a versioned name (e.g. ffmpeg-win-x86_64-v7.1.exe),
# create a copy named ffmpeg.exe in the same folder so Whisper can find it.
_FFMPEG_PLAIN = os.path.join(_FFMPEG_DIR, "ffmpeg.exe")
if not os.path.exists(_FFMPEG_PLAIN):
    import shutil
    shutil.copy2(_FFMPEG_EXE, _FFMPEG_PLAIN)

# ---------------------------------------------------------------------------
# Module-level model cache
# ---------------------------------------------------------------------------
_MODEL_NAME = "base"
_model: whisper.Whisper | None = None


def _get_model() -> whisper.Whisper:
    """Return the cached Whisper model, loading it on first call."""
    global _model
    if _model is None:
        _model = whisper.load_model(_MODEL_NAME)
    return _model


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def speech_to_text(audio_path: str) -> str:
    """
    Convert speech in an audio file to a plain-text transcript.

    Args:
        audio_path: Path to a .wav or .mp3 file.

    Returns:
        Transcribed text as a stripped plain string.

    Raises:
        FileNotFoundError: If the audio file does not exist.
        ValueError: If the file extension is not .wav or .mp3.
    """
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    if os.path.getsize(audio_path) == 0:
        raise ValueError(f"Audio file is empty: {audio_path}")

    ext = os.path.splitext(audio_path)[1].lower()
    if ext not in (".wav", ".mp3"):
        raise ValueError(
            f"Unsupported file format '{ext}'. Use .wav or .mp3."
        )

    model = _get_model()
    result = model.transcribe(audio_path, fp16=False)
    return result["text"].strip()


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python speech.py <audio_file>")
        sys.exit(1)

    print(speech_to_text(sys.argv[1]))
