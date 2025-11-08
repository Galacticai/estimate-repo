/**
 * JsonWriter class for generating JSON output files
 */

import fs from "fs";
import path from "path";
import { sanitizeFilename, ensureDirectory } from "../utils/fileUtils.js";

export class JsonWriter {
  // Properties
  outputDir;

  /**
   * Create a new JsonWriter instance
   * @param {string} outputDir - Directory to write output files to
   */
  constructor(outputDir) {
    this.outputDir = outputDir;
    ensureDirectory(outputDir);
  }

  /**
   * Generate JSON file for a single developer
   * @param {string} author - Developer name
   * @param {Array} commits - Array of commits with estimation
   * @param {string} [filenameBase=null] - Optional filename base (uses author name if not provided)
   * @returns {Object} Summary data with total hours
   */
  generateDeveloperJson(author, commits, filenameBase = null) {
    const summaryData = [];
    let totalHours = 0.0;

    commits.forEach(commit => {
      totalHours += commit.estimatedHours;

      summaryData.push({
        hash: commit.hash,
        date: commit.date,
        message: commit.message,
        additions: commit.additions,
        deletions: commit.deletions,
        filesChanged: commit.files.length,
        estimatedHours: parseFloat(commit.estimatedHours.toFixed(2)),
        changeValue: commit.changeValue,
      });
    });

    // Extract email from first commit
    const email = commits.length > 0 ? commits[0].email : "";

    const output = {
      developer: author,
      email: email,
      totalCommits: commits.length,
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalDays: parseFloat((totalHours / 8).toFixed(2)),
      totalWeeks: parseFloat((totalHours / 40).toFixed(2)),
      commits: summaryData,
    };

    // Use provided filename base or sanitize author name
    const safeFilename = sanitizeFilename(filenameBase || author);
    const outputFile = path.join(this.outputDir, `${safeFilename}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), "utf-8");

    return {
      filename: `${safeFilename}.json`,
      email: email,
      totalHours: totalHours,
      totalCommits: commits.length,
    };
  }

  /**
   * Generate summary file with all developers
   * @param {Array} developers - Array of developer summaries
   * @param {number} grandTotalHours - Total hours across all developers
   */
  generateSummary(developers, grandTotalHours) {
    const summaryFile = path.join(this.outputDir, "_summary.json");

    const summary = {
      generatedAt: new Date().toISOString(),
      totalDevelopers: developers.length,
      grandTotalHours: parseFloat(grandTotalHours.toFixed(2)),
      grandTotalDays: parseFloat((grandTotalHours / 8).toFixed(2)),
      grandTotalWeeks: parseFloat((grandTotalHours / 40).toFixed(2)),
      developers: developers,
    };

    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), "utf-8");

    return "_summary.json";
  }

  /**
   * Get the output directory path
   * @returns {string} Output directory path
   */
  get outputDirPath() {
    return path.resolve(this.outputDir);
  }
}
