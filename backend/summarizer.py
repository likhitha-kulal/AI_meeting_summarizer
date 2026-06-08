"""
summarizer.py - Offline summarization using sumy + NLTK.
No OpenAI API key or internet connection required.

Extracts a summary and action items directly from the transcript text.
"""

import re
import nltk
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

# Download required NLTK data on first import
for resource in ('tokenizers/punkt_tab', 'tokenizers/punkt'):
    try:
        nltk.data.find(resource)
    except LookupError:
        nltk.download(resource.split('/')[-1], quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

LANGUAGE       = "english"
SUMMARY_SENTENCES = 5   # number of sentences in the summary

# Keywords that suggest a sentence contains an action item
ACTION_KEYWORDS = [
    "will", "need to", "needs to", "should", "must", "going to",
    "action", "follow up", "follow-up", "assign", "assigned",
    "deadline", "due", "complete", "finish", "send", "submit",
    "schedule", "review", "update", "prepare", "create", "fix",
    "resolve", "implement", "discuss", "confirm", "check",
    "make sure", "ensure", "please", "task", "responsible",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_summary(transcript: str) -> str:
    """Use LSA extractive summarization to pick the most important sentences."""
    parser    = PlaintextParser.from_string(transcript, Tokenizer(LANGUAGE))
    stemmer   = Stemmer(LANGUAGE)
    summarizer = LsaSummarizer(stemmer)
    summarizer.stop_words = get_stop_words(LANGUAGE)

    sentences = summarizer(parser.document, SUMMARY_SENTENCES)
    return " ".join(str(s) for s in sentences).strip()


def _extract_action_items(transcript: str) -> list[str]:
    """
    Scan each sentence for action-oriented keywords and return them
    as a deduplicated list of action items.
    """
    # Split on sentence boundaries
    sentences = re.split(r"(?<=[.!?])\s+", transcript.strip())

    items = []
    seen  = set()

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        lower = sentence.lower()
        if any(kw in lower for kw in ACTION_KEYWORDS):
            # Normalise whitespace and deduplicate
            clean = re.sub(r"\s+", " ", sentence)
            if clean not in seen and len(clean) > 15:
                seen.add(clean)
                items.append(clean)

    return items[:10]   # cap at 10 items


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_summary(transcript: str) -> dict:
    """
    Summarize a transcript and extract action items — fully offline.

    Args:
        transcript: Plain-text transcript string.

    Returns:
        dict with keys:
            "summary"      – str, concise extractive summary
            "action_items" – list[str], sentences containing action keywords

    Raises:
        ValueError: If transcript is empty.
    """
    transcript = transcript.strip()
    if not transcript:
        raise ValueError("Transcript is empty.")

    summary      = _extract_summary(transcript)
    action_items = _extract_action_items(transcript)

    return {
        "summary":      summary,
        "action_items": action_items,
    }


# ---------------------------------------------------------------------------
# CLI demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    sample = """
    Good morning everyone. Today we reviewed the Q3 product roadmap.
    Sarah confirmed the new onboarding flow will be ready by June 15th.
    John mentioned the API rate-limiting bug is still open and needs to be
    fixed before the next release. We agreed to move the release date to
    June 20th to give the team more buffer. Marketing needs the updated
    feature list by end of this week so they can prepare the launch blog post.
    David will set up a follow-up meeting for next Tuesday to review the QA
    report. Everyone agreed that the mobile performance issues flagged last
    sprint should be prioritized in the next cycle.
    """

    result = generate_summary(sample)
    print("=== SUMMARY ===")
    print(result["summary"])
    print("\n=== ACTION ITEMS ===")
    for i, item in enumerate(result["action_items"], 1):
        print(f"  {i}. {item}")
