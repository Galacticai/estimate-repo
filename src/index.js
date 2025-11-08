/**
 * Commit Work Hour Estimation Script - All Developers
 * Analyzes git commits for all developers and generates JSON estimation per developer
 */

import path from "path";
import { GitRepository } from "./repo/GitRepository.js";
import { CommitAnalyzer } from "./analyzer/CommitAnalyzer.js";
import { HourEstimator } from "./estimation/HourEstimator.js";
import { JsonWriter } from "./output/JsonWriter.js";

/**
 * Main function to orchestrate the estimation process
 */
function main() {
  console.log("Commit Work Hour Estimation Script - All Developers");
  console.log("=".repeat(60));

  // Get repository path from command line argument
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("\nError: Repository path required");
    console.log("\nUsage: node src/index.js /path/to/repo");
    console.log("   or: estimate-repo /path/to/repo");
    console.log("Example: estimate-repo /path/to/your-project\n");
    process.exit(1);
  }

  const repoPath = path.resolve(args[0]);

  // Initialize repository and validate
  const repo = new GitRepository(repoPath);
  try {
    repo.validateRepo();
  } catch (error) {
    console.error(`\n${error.message}\n`);
    process.exit(1);
  }

  console.log(`Repository: ${repo.path}`);

  // Initialize output writer
  const outputDir = "./estimation";
  const writer = new JsonWriter(outputDir);
  console.log(`Output directory: ${writer.outputDirPath}`);

  // Get all developers with emails
  console.log("\nFinding all developers...");
  const authorsWithEmails = repo.getAllAuthorsWithEmails();
  console.log(`Found ${authorsWithEmails.length} developers\n`);

  // Detect duplicate names and prepare filename mapping
  const nameCount = {};
  authorsWithEmails.forEach(({ name }) => {
    nameCount[name] = (nameCount[name] || 0) + 1;
  });

  // Process each developer
  let grandTotalHours = 0;
  const summary = [];
  const estimator = new HourEstimator();

  authorsWithEmails.forEach(({ name, email }, index) => {
    console.log(
      `[${index + 1}/${authorsWithEmails.length}] Processing: ${name}`
    );

    // Get commits for author
    const rawData = repo.getCommitsForAuthor(name);
    if (!rawData.trim()) {
      console.log(`  ⚠ No commits found for ${name}`);
      return;
    }

    // Parse commits
    const analyzer = new CommitAnalyzer();
    const commits = analyzer.parseCommits(rawData);
    console.log(`  Found ${commits.length} commits`);

    // Estimate hours for each commit
    const commitsWithEstimations = commits.map(commit => {
      const { hours, changeValue } = estimator.estimateHours(commit);
      return {
        ...commit,
        estimatedHours: hours,
        changeValue: changeValue,
      };
    });

    // Use email as filename if name is duplicate
    const filenameBase = nameCount[name] > 1 ? email : name;

    // Generate JSON for developer
    const result = writer.generateDeveloperJson(
      name,
      commitsWithEstimations,
      filenameBase
    );
    console.log(`  Total hours: ${result.totalHours.toFixed(2)}h`);
    console.log(`  Saved to: ${result.filename}\n`);

    grandTotalHours += result.totalHours;
    summary.push({
      developer: name,
      email: result.email,
      commits: result.totalCommits,
      hours: result.totalHours,
    });
  });

  // Generate summary file
  const summaryFilename = writer.generateSummary(summary, grandTotalHours);

  // Print final summary
  console.log("=".repeat(60));
  console.log(`✓ Processed ${authorsWithEmails.length} developers`);
  console.log(`✓ Grand Total Hours: ${grandTotalHours.toFixed(2)}h`);
  console.log(`✓ Grand Total Days: ${(grandTotalHours / 8).toFixed(2)} days`);
  console.log(
    `✓ Grand Total Weeks: ${(grandTotalHours / 40).toFixed(2)} weeks`
  );
  console.log(`✓ Summary saved to: ${summaryFilename}`);
  console.log("=".repeat(60));
}

// Run main - this is always the entry point
main();

export { main };
