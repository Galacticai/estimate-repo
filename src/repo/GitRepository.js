/**
 * GitRepository class for handling git operations
 */

import { execSync } from 'child_process';
import path from 'path';
import { pathExists } from '../utils/fileUtils.js';

export class GitRepository {
  // Properties
  repoPath;

  /**
   * Create a new GitRepository instance
   * @param {string} repoPath - Path to the git repository
   */
  constructor(repoPath) {
      this.repoPath = path.resolve(repoPath);
  }

  /**
   * Validate that the repository exists and is a git repository
   * @throws {Error} If repository is invalid
   */
  validateRepo() {
      if (!pathExists(this.repoPath)) {
      throw new Error(`Repository path does not exist: ${this.repoPath}`);
      }

      const gitDir = path.join(this.repoPath, '.git');
      if (!pathExists(gitDir)) {
      throw new Error(`Not a git repository: ${this.repoPath}`);
      }
  }

  /**
   * Get all unique authors from the repository
   * @returns {string[]} Array of author names
   */
  getAllAuthors() {
      try {
      const output = execSync(
          'git log --all --no-merges --pretty=format:"%an" | sort -u',
          { cwd: this.repoPath, encoding: 'utf-8' }
      );
      return output.split('\n').filter(name => name.trim() !== '');
      } catch (error) {
      console.error('Error getting authors:', error.message);
      return [];
      }
  }

  /**
   * Get all unique authors with their emails
   * @returns {Array<Object>} Array of {name, email} objects
   */
  getAllAuthorsWithEmails() {
      try {
      const output = execSync(
          'git log --all --no-merges --pretty=format:"%an|%ae" | sort -u',
          { cwd: this.repoPath, encoding: 'utf-8' }
      );
      return output.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          const [name, email] = line.split('|');
          return { name: name.trim(), email: email.trim() };
        });
      } catch (error) {
      console.error('Error getting authors with emails:', error.message);
      return [];
      }
  }

  /**
   * Get git commits for a specific author
   * @param {string} author - Author name to filter by
   * @returns {string} Raw git log output
   */
  getCommitsForAuthor(author) {
      try {
      const output = execSync(
          `git log --all --no-merges --author="${author}" --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso --numstat`,
          { cwd: this.repoPath, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
      );
      return output;
      } catch (error) {
      console.error(`Error getting commits for ${author}:`, error.message);
      return '';
      }
  }

  /**
   * Get the repository path
   * @returns {string} Repository path
   */
  get path() {
      return this.repoPath;
  }
}
