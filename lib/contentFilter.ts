// Frontend content filtering utility
// This provides client-side validation before submitting to backend

// Basic profanity and inappropriate content detection
const PROFANITY_WORDS = [
  // Common profanity - this is a basic list
  // The backend uses a more comprehensive library
  'damn', 'hell', 'crap', 'stupid', 'idiot', 'moron',
  // Add more as needed, but keep it minimal on frontend
]

const HATE_SPEECH_PATTERNS = [
  /kill\s+(yourself|urself|u)/i,
  /go\s+die/i,
  /(you|u)\s+should\s+die/i,
  // Add more patterns as needed
]

export function containsProfanity(text: string): boolean {
  if (!text) return false
  
  const textLower = text.toLowerCase()
  
  // Check against profanity list
  for (const word of PROFANITY_WORDS) {
    if (textLower.includes(word)) {
      return true
    }
  }
  
  return false
}

export function containsHateSpeech(text: string): boolean {
  if (!text) return false
  
  // Check against hate speech patterns
  for (const pattern of HATE_SPEECH_PATTERNS) {
    if (pattern.test(text)) {
      return true
    }
  }
  
  return false
}

export function hasExcessiveCaps(text: string): boolean {
  if (!text || text.length < 10) return false
  
  const capsCount = (text.match(/[A-Z]/g) || []).length
  const capsRatio = capsCount / text.length
  
  return capsRatio > 0.7 // More than 70% caps
}

export function hasSpamPattern(text: string): boolean {
  if (!text) return false
  
  // Check for repeated characters (e.g., "aaaaa", "!!!!!")
  return /(.)\1{4,}/.test(text)
}

export interface ContentValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateContent(
  text: string,
  fieldName: string = 'content'
): ContentValidationResult {
  const errors: string[] = []
  
  if (!text) {
    return { isValid: true, errors: [] }
  }
  
  // Check for profanity
  if (containsProfanity(text)) {
    errors.push(`Your ${fieldName} contains inappropriate language. Please use respectful and community-friendly language.`)
  }
  
  // Check for hate speech
  if (containsHateSpeech(text)) {
    errors.push(`Your ${fieldName} contains hate speech. Please be respectful to all members of our community.`)
  }
  
  // Check for excessive caps
  if (hasExcessiveCaps(text)) {
    errors.push(`Your ${fieldName} contains excessive capitalization. Please use normal capitalization.`)
  }
  
  // Check for spam patterns
  if (hasSpamPattern(text)) {
    errors.push(`Your ${fieldName} appears to contain spam. Please provide meaningful content.`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

