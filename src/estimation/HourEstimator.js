/**
 * HourEstimator class for estimating work hours from commits
 */

import { COMMIT_KEYWORDS, CODING_EXTENSIONS } from "./HourEstimator.consts.js";

export class HourEstimator {
  /**
   * Estimate hours worked based on commit data
   * @param {Object} commit - Parsed commit object
   * @returns {Object} Estimation result with hours and change value
   */
  estimateHours(commit) {
    const totalChanges = commit.totalChanges;
    const numFiles = commit.files.length;
    const message = commit.message.toLowerCase();

    // Base estimation from lines changed
    const { baseHours, changeSize } = this._calculateBaseHours(totalChanges);

    // Adjust based on commit type
    const { typeMultiplier, changeType } = this._determineCommitType(message);

    // Adjust based on number of files
    const fileMultiplier = this._calculateFileMultiplier(numFiles);

    // Check for complex file types
    const langMultiplier = this._calculateLanguageMultiplier(commit.files);

    // Calculate final estimate
    const multipliers = [
      baseHours,
      typeMultiplier,
      fileMultiplier,
      langMultiplier,
    ];
    let hoursTotal = multipliers.reduce((a, b) => a * b, 1);

    // Cap at reasonable max (single commit shouldn't be more than 16 hours)
    hoursTotal = Math.min(hoursTotal, 16.0);

    // Round to nearest 0.25 hours
    hoursTotal = Math.round(hoursTotal * 4) / 4;

    const changeValue = {
      size: changeSize,
      type: changeType,
      multipliers: multipliers,
      hoursTotal: hoursTotal,
    };

    return { hours: hoursTotal, changeValue };
  }

  /**
   * Calculate base hours from total changes using logarithmic scale
   * @private
   */
  _calculateBaseHours(totalChanges) {
    // Logarithmic formula: baseHours = 0.5 * log10(totalChanges + 1) + 0.2
    // This scales smoothly: 0 changes ≈ 0.2h, 10 changes ≈ 0.7h, 100 changes ≈ 1.2h, 1000 changes ≈ 1.7h
    const baseHours =
      totalChanges === 0 ? 0.1 : 0.5 * Math.log10(totalChanges + 1) + 0.2;

    // Size categories array indexed by floor of baseHours
    const sizeCategories = [
      "trivial", // 0.0 - 0.99
      "simple", // 1.0 - 1.99
      "medium", // 2.0 - 2.99
      "large", // 3.0 - 3.99
      "very_large", // 4.0 - 4.99
      "massive", // 5.0+
    ];

    const index = Math.min(Math.floor(baseHours), sizeCategories.length - 1);
    const changeSize = sizeCategories[index];

    return { baseHours, changeSize };
  }

  /**
   * Determine commit type from message
   * @private
   */
  _determineCommitType(message) {
    let typeMultiplier = 1.0;
    let changeType = "general";

    if (COMMIT_KEYWORDS.feature.some(kw => message.includes(kw))) {
      typeMultiplier = 1.3;
      changeType = "feature";
    } else if (COMMIT_KEYWORDS.fix.some(kw => message.includes(kw))) {
      typeMultiplier = 1.2;
      changeType = "bugfix";
    } else if (COMMIT_KEYWORDS.refactor.some(kw => message.includes(kw))) {
      typeMultiplier = 1.4;
      changeType = "refactor";
    } else if (COMMIT_KEYWORDS.test.some(kw => message.includes(kw))) {
      typeMultiplier = 1.1;
      changeType = "test";
    } else if (COMMIT_KEYWORDS.doc.some(kw => message.includes(kw))) {
      typeMultiplier = 0.8;
      changeType = "documentation";
    } else if (COMMIT_KEYWORDS.update.some(kw => message.includes(kw))) {
      typeMultiplier = 0.9;
      changeType = "update";
    } else if (COMMIT_KEYWORDS.perf.some(kw => message.includes(kw))) {
      typeMultiplier = 1.3;
      changeType = "optimization";
    }

    return { typeMultiplier, changeType };
  }

  /**
   * Calculate multiplier based on number of files
   * @private
   */
  _calculateFileMultiplier(numFiles) {
    if (numFiles > 10) {
      return 1.3;
    } else if (numFiles > 5) {
      return 1.2;
    } else if (numFiles > 2) {
      return 1.1;
    } else {
      return 1.0;
    }
  }

  /**
   * Calculate multiplier based on file type (code vs config/docs)
   * @private
   */
  _calculateLanguageMultiplier(files) {
    const codingFiles = files.filter(f =>
      CODING_EXTENSIONS.some(ext => f.name.toLowerCase().includes(ext))
    ).length;

    return codingFiles > 0 ? 1.1 : 1.0;
  }
}
