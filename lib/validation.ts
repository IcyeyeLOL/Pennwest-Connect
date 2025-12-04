// Frontend validation utilities

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []
  
  if (!email) {
    errors.push('Email is required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []
  
  if (!password) {
    errors.push('Password is required')
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  } else if (password.length > 200) {
    errors.push('Password must be less than 200 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateUsername(username: string): ValidationResult {
  const errors: string[] = []
  
  if (!username) {
    errors.push('Username is required')
  } else if (username.trim().length === 0) {
    errors.push('Username cannot be empty')
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters long')
  } else if (username.length > 30) {
    errors.push('Username must be less than 30 characters')
  } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateRegistrationForm(
  username: string,
  email: string,
  password: string
): ValidationResult {
  const errors: string[] = []
  
  const usernameValidation = validateUsername(username)
  const emailValidation = validateEmail(email)
  const passwordValidation = validatePassword(password)
  
  errors.push(...usernameValidation.errors)
  errors.push(...emailValidation.errors)
  errors.push(...passwordValidation.errors)
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

