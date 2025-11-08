/**
 * CommitAnalyzer class for parsing git commit data
 */

export class CommitAnalyzer {
  // Properties
  commits = [];

  constructor() {
    this.commits = [];
  }

  /**
   * Parse raw git log output into structured commit objects
   * @param {string} rawData - Raw git log output
   * @returns {Array} Array of parsed commit objects
   */
  parseCommits(rawData) {
    const lines = rawData.split("\n");
    const commits = [];
    let currentCommit = null;

    for (const line of lines) {
      // Check if this is a commit header line (has pipe separators)
      if (line.includes("|") && line.split("|").length >= 5) {
        // Save previous commit if exists
        if (currentCommit) {
          commits.push(currentCommit);
        }

        // Parse new commit
        const parts = line.split("|");
        currentCommit = {
          hash: parts[0],
          author: parts[1],
          email: parts[2],
          date: parts[3],
          message: parts.slice(4).join("|"), // In case message contains |
          files: [],
          additions: 0,
          deletions: 0,
          totalChanges: 0,
        };
      } else if (currentCommit && line.trim()) {
        // This is a file stat line: additions deletions filename
        const parts = line.split("\t");
        if (parts.length >= 3) {
          const additions = parts[0] === "-" ? 0 : parseInt(parts[0]) || 0;
          const deletions = parts[1] === "-" ? 0 : parseInt(parts[1]) || 0;
          const filename = parts[2];

          currentCommit.files.push({
            name: filename,
            additions,
            deletions,
          });
          currentCommit.additions += additions;
          currentCommit.deletions += deletions;
          currentCommit.totalChanges += additions + deletions;
        }
      }
    }

    // Don't forget the last commit
    if (currentCommit) {
      commits.push(currentCommit);
    }

    this.commits = commits;
    return commits;
  }
}
