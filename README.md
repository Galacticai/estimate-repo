# estimate-repo

CLI tool that estimates work hours from Git commit history using multi-factor analysis.

---

## ⚠️ Important Disclaimer

### **This tool provides ESTIMATES only, not actual time tracking.**

_The calculations are based on algorithmic heuristics (lines changed, commit types, file counts) and do not reflect the real time developers spent working. Use these numbers as rough approximations for planning purposes, not as accurate time records._

### **In short, this uses math to guess, not black magic.**

---

## Features

- Analyzes any Git repository
- Per-developer JSON reports with commit-level details
- Multi-factor estimation (lines changed, commit type, file count, language)
- Standalone binary, no runtime required

---

## Installation

### [Download Binary](https://github.com/galacticai/estimate-repo/releases)

```bash
# Linux
chmod +x estimate-repo-linux
./estimate-repo-linux /path/to/repo
```

### Build from Source

**Requirements:** Node.js v18+, npm/yarn

```bash
git clone https://github.com/galacticai/estimate-repo
cd estimate-repo
npm i
npm run build:linux
# Binary output: dist/
```

---

## Usage

```bash
estimate-repo /path/to/repository
```

**Output:** JSON files in `./estimation/`

- `{developer}.json` - Per-developer reports
- `_summary.json` - Aggregated totals

**Per-developer output:**

```json
{
  "developer": "John Doe",
  "email": "john@example.com",
  "totalCommits": 150,
  "totalHours": 487.5,
  "totalDays": 60.94,
  "totalWeeks": 12.19,
  "commits": [
    {
      "hash": "abc123def456",
      "date": "2024-11-08 15:30:00 +0000",
      "message": "feat: add user authentication",
      "additions": 450,
      "deletions": 120,
      "filesChanged": 8,
      "estimatedHours": 6.5,
      "changeValue": {
        "size": "large",
        "type": "feature",
        "multipliers": [5, 1.3, 1.2, 1.1],
        "hoursTotal": 6.5
      }
    }
  ]
}
```

**Summary output:**

```json
{
  "generatedAt": "2024-11-08T15:30:00.000Z",
  "totalDevelopers": 3,
  "grandTotalHours": 965.5,
  "grandTotalDays": 120.69,
  "grandTotalWeeks": 24.14,
  "developers": [
    {
      "developer": "John Doe",
      "email": "john@example.com",
      "commits": 150,
      "hours": 487.5
    }
  ]
}
```

---

## How It Works

**Formula:** `Base Hours × Commit Type × File Count × File Type`

**Lines Changed (Base Hours):**
| Lines | Hours |
|-------|-------|
| 0-10 | 0.1h |
| 11-50 | 1h |
| 51-150 | 3h |
| 151-300 | 5h |
| 300+ | 8h |

**Commit Type:**
| Type | Multiplier |
|------|------------|
| Feature | 1.3× |
| Refactor | 1.4× |
| Bugfix | 1.2× |
| Test | 1.1× |
| Docs | 0.8× |

**File Count:**
| Files | Multiplier |
|-------|------------|
| 1 | 1.0× |
| 2-3 | 1.1× |
| 4-6 | 1.2× |
| 7+ | 1.3× |

**File Type:**
| Type | Multiplier |
|------|------------|
| Code files\* | 1.1× |
| Config/docs (md, json, txt, etc) | 1.0× |

\*Code: js, ts, py, java, go, rb, php, c, cpp, rs, kt, swift, etc.

Max 16h per commit, rounded to 0.25h

**Limitations:**

- Processes entire history (all branches)
- Merge commits excluded
- Algorithmic estimates, not actual time

---

## Development

**Stack:** Node.js, esbuild (bundler), pkg (binary packager)

**Structure:**

```
src/
├── analyzer/         # Commit parsing
├── estimation/       # Hour calculation
├── output/           # JSON generation
└── repo/            # Git operations
```
