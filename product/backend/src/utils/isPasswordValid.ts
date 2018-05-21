// Checks whether a password meets the following criteria:
// - Minimum length of passwords should be 10 characters
// - Passwords should contain a combination of three out of the following four categories:
// uppercase alphabetic, lowercase alphabetic, numeric, and special characters
export const PASSWORD_MINIMUM_LENGTH = 10
export const PASSWORD_MAXIMUM_LENGTH = 2048
export const ALL_UPPERCASE_LETTERS = /[A-Z]/
export const ALL_LOWERCASE_LETTERS = /[a-z]/
export const ALL_NUMBERS = /[0-9]/
export const ALL_SPECIAL_CHARACTERS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/

export function isPasswordValid(password: string) {
  if (!password) {
    return false
  }
  if (password.length < PASSWORD_MINIMUM_LENGTH) {
    return false
  }
  if (password.length > PASSWORD_MAXIMUM_LENGTH) {
    return false
  }

  // Passwords should contain a combination of three out of the following four categories:
  // uppercase alphabetic, lowercase alphabetic, numeric, and special characters
  let categoryCount = 0
  if (password.search(ALL_UPPERCASE_LETTERS) >= 0) {
    categoryCount++
  }
  if (password.search(ALL_LOWERCASE_LETTERS) >= 0) {
    categoryCount++
  }
  if (password.search(ALL_NUMBERS) >= 0) {
    categoryCount++
  }
  if (password.search(ALL_SPECIAL_CHARACTERS) >= 0) {
    categoryCount++
  }
  return (categoryCount >= 3)
}
