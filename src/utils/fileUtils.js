/**
 * File utility functions
 */

import fs from 'fs';

/**
 * Sanitize a filename for cross-platform compatibility
 * Preserves spaces but removes/replaces problematic characters
 * @param {string} name - The filename to sanitize
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(name) {
  return name
    .replace(/[\/\\]/g, '-')           // Replace path separators
    .replace(/[\[\]]/g, '')            // Remove brackets
    .replace(/[<>:"|?*@]/g, '')        // Remove Windows-incompatible chars + @
    .replace(/\s+/g, ' ')              // Normalize multiple spaces to single space
    .trim();                           // Remove leading/trailing spaces
}

/**
 * Ensure a directory exists, creating it if necessary
 * @param {string} dirPath - The directory path to ensure exists
 */
export function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Check if a path exists
 * @param {string} path - The path to check
 * @returns {boolean} True if path exists
 */
export function pathExists(path) {
  return fs.existsSync(path);
}
