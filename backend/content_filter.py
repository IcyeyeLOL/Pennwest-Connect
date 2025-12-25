"""Content filtering utility for profanity and inappropriate content."""
import re
import logging
from typing import Tuple, List

logger = logging.getLogger(__name__)

# Try to import better-profanity, fallback to basic filter if not available
try:
    from better_profanity import profanity
    PROFANITY_AVAILABLE = True
    # Load the profanity filter
    profanity.load_censor_words()
except ImportError:
    PROFANITY_AVAILABLE = False
    logger.warning("better-profanity not installed. Using basic content filter.")

# Common inappropriate words/phrases (basic fallback if library not available)
BASIC_BLOCKED_WORDS = [
    # Add common inappropriate terms here as a fallback
    # This is a basic list - the library is much more comprehensive
]

# Hate speech patterns (basic detection)
HATE_SPEECH_PATTERNS = [
    r'\b(kill|murder|die)\s+(yourself|urself|u)\b',
    r'\b(go\s+)?(kill|die)\s+(yourself|urself)\b',
    # Add more patterns as needed
]

def contains_profanity(text: str) -> bool:
    """Check if text contains profanity."""
    if not text:
        return False
    
    text_lower = text.lower().strip()
    
    if PROFANITY_AVAILABLE:
        try:
            return profanity.contains_profanity(text_lower)
        except Exception as e:
            logger.error(f"Error checking profanity: {e}")
            # Fallback to basic check
            pass
    
    # Basic fallback check
    for word in BASIC_BLOCKED_WORDS:
        if word.lower() in text_lower:
            return True
    
    return False

def contains_hate_speech(text: str) -> bool:
    """Check if text contains hate speech patterns."""
    if not text:
        return False
    
    text_lower = text.lower()
    
    # Check against hate speech patterns
    for pattern in HATE_SPEECH_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            return True
    
    return False

def contains_inappropriate_content(text: str) -> Tuple[bool, str]:
    """
    Check if text contains inappropriate content.
    Returns: (is_inappropriate, reason)
    """
    if not text:
        return False, ""
    
    # Check for profanity
    if contains_profanity(text):
        return True, "profanity"
    
    # Check for hate speech
    if contains_hate_speech(text):
        return True, "hate_speech"
    
    # Check for excessive capitalization (potential spam/aggressive content)
    if len(text) > 10:
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text)
        if caps_ratio > 0.7:  # More than 70% caps
            return True, "excessive_caps"
    
    # Check for repeated characters (potential spam)
    if re.search(r'(.)\1{4,}', text):  # Same character repeated 5+ times
        return True, "spam_pattern"
    
    return False, ""

def filter_content(text: str, field_name: str = "content") -> Tuple[str, List[str]]:
    """
    Filter content and return filtered text with list of issues found.
    Returns: (filtered_text, issues)
    """
    if not text:
        return text, []
    
    issues = []
    filtered_text = text
    
    # Check for inappropriate content
    is_inappropriate, reason = contains_inappropriate_content(text)
    
    if is_inappropriate:
        if reason == "profanity":
            issues.append("Profanity is not allowed. Please use respectful language.")
        elif reason == "hate_speech":
            issues.append("Hate speech is not allowed. Please be respectful to others.")
        elif reason == "excessive_caps":
            issues.append("Please avoid using excessive capitalization.")
        elif reason == "spam_pattern":
            issues.append("Spam-like patterns are not allowed.")
    
    return filtered_text, issues

def validate_content(text: str, field_name: str = "content") -> Tuple[bool, str]:
    """
    Validate content and return (is_valid, error_message).
    """
    if not text:
        return True, ""
    
    is_inappropriate, reason = contains_inappropriate_content(text)
    
    if is_inappropriate:
        if reason == "profanity":
            return False, f"Your {field_name} contains inappropriate language. Please use respectful and community-friendly language."
        elif reason == "hate_speech":
            return False, f"Your {field_name} contains hate speech. Please be respectful to all members of our community."
        elif reason == "excessive_caps":
            return False, f"Your {field_name} contains excessive capitalization. Please use normal capitalization."
        elif reason == "spam_pattern":
            return False, f"Your {field_name} appears to contain spam. Please provide meaningful content."
    
    return True, ""

