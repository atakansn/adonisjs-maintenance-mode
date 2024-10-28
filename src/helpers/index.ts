/**
 * Checks if a string value matches one or more patterns. Supports exact matching
 * and wildcard matching where `*` acts as a wildcard that can replace any number
 * of characters.
 *
 * ## Features:
 * - Allows a single string pattern or an array of string patterns to match against.
 * - Supports exact matching and wildcard matching using `*` (which translates to `.*` in regex).
 * - Handles special regex characters by escaping them to avoid unintended behavior.
 *
 * @param {string | string[]} pattern - A single string pattern or an array of string patterns to match against.
 *                                      If it's an array, the function will check each pattern for a match.
 *                                      The `*` character can be used as a wildcard.
 * @param {string} value - The string value to be checked against the pattern(s). This value will be
 *                         coerced into a string if it's not already a string.
 *
 * @returns {boolean} Returns `true` if the value matches any of the patterns, either as an exact match
 *                    or using a wildcard pattern. Returns `false` if no patterns match.
 *
 * ## Example Usage:
 *
 * // Example 1: Exact match
 * stringMatcher('hello', 'hello');
 * // Returns: true
 *
 * // Example 2: Wildcard match
 * stringMatcher('foo*', 'foobar');
 * // Returns: true
 *
 * // Example 3: Array of patterns
 * stringMatcher(['foo', 'bar'], 'baz');
 * // Returns: false
 *
 * // Example 4: Special characters in pattern
 * stringMatcher('hello$', 'hello');
 * // Returns: false (special characters in pattern are escaped)
 */
export function stringMatcher(pattern: string | string[], value: string): boolean {
  value = String(value)

  if (!Array.isArray(pattern)) {
    pattern = [pattern]
  }

  for (let singlePattern of pattern) {
    singlePattern = String(singlePattern)

    // If the value is an exact match, return true
    if (singlePattern === value) {
      return true
    }

    // Escape special regex characters
    singlePattern = singlePattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&')

    // Replace '*' with '.*' to act as a wildcard in regex
    singlePattern = singlePattern.replace(/\*/g, '.*')

    // Check if the pattern matches the entire value
    const regex = new RegExp(`^${singlePattern}$`, 'u')

    if (regex.test(value)) {
      return true
    }
  }

  return false
}
