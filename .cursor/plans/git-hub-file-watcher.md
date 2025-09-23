Scope: GitHub-Based Cursor Output Sharing App
1. Objectives
Centralize AI outputs: Ensure all Cursor conversations, prompts, and outputs are captured in one shared location.
Automate knowledge sharing: Remove manual steps of copying, pasting, and emailing outputs.
Leverage GitHub: Use GitHub as the single source of truth with versioning, history, and team access controls.
Support sprints: Tie shared outputs directly to sprint commitments and Jira issues to maintain velocity with a reduced dev team.
2. Core Features
Capture & Export
Designated local folder (cursor-share/) where team members save or auto-export markdown files from Cursor.
Watcher service monitors this folder and automatically:
Detects file create/update events.
Commits changes with meaningful commit messages.
Pushes to a special GitHub repo.
Storage & Versioning
Private GitHub repository (cursor-knowledge-share).
Repository structure by project/sprint:
Commit messages reference issue keys where possible (feat: add cursor output for DPC-123).
Access & Consumption
Team members can pull the repo to view all markdown outputs locally.
GitHub’s built-in markdown rendering provides quick web access.
Commit history doubles as a timeline of decisions and explorations.
3. Optional Enhancements
Notifications
GitHub Action or webhook posts to Slack/Teams when new outputs are added.
Messages include filename, commit message, and direct link.
Search & Browsing
Static docs site (Docusaurus, Next.js, or GitHub Pages) auto-generated from markdown.
Search by keyword, issue key, or sprint.
Tagging system inside markdown (#dispatch, #billing) for filtering.
Jira Integration
Parse commit messages for Jira issue keys.
Auto-link new outputs to corresponding Jira tickets via API.
4. Technical Architecture
Components:
Local Watcher (Node.js, chokidar)
Runs on dev machines.
Automates add/commit/push for markdown changes.
GitHub Repo (Private)
Centralized storage.
Team access management.
History of all shared outputs.
(Optional) CI/CD Layer
GitHub Actions to build docs site or notify Slack.
Could use GitHub Pages for free hosting.
5. Workflow
Developer uses Cursor → saves relevant output to cursor-share/.
Watcher service detects file → commits & pushes.
GitHub repo updated instantly.
Team members notified (Slack/Teams) or simply pull latest changes.
Sprint review/reporting tools can pull data from repo by sprint folder.
6. Security & Governance
Repo set to private, only accessible by the dev team + product owners.
Dedicated GitHub bot account with scoped PAT for automation.
Compliance with org standards (no sensitive data leaks).
7. Future Phases
Semantic search: ingest markdown into Pinecone/Amazon Kendra for natural language queries.
Sprint Digest integration: pull markdown outputs into automated review decks.
Cross-project dashboards: visualize outputs by sprint, project, or issue type.
✅ Deliverable for MVP:
Shared GitHub repo with auto-committing watcher service.
Standard folder naming conventions per sprint.
Team trained to save all Cursor outputs into the folder
 
JSON
/sprint-2025.3.1/
  dpc-123-summary.md
  dpc-124-api-fix.md
/sprint-2025.3.2/
  ...
 
Commit messages reference issue keys where possible (feat: add cursor output for DPC-123).
Access & Consumption
Team members can pull the repo to view all markdown outputs locally.
GitHub’s built-in markdown rendering provides quick web access.
Commit history doubles as a timeline of decisions and explorations.
3. Optional Enhancements
Notifications
GitHub Action or webhook posts to Slack/Teams when new outputs are added.
Messages include filename, commit message, and direct link.
Search & Browsing
Static docs site (Docusaurus, Next.js, or GitHub Pages) auto-generated from markdown.
Search by keyword, issue key, or sprint.
Tagging system inside markdown (#dispatch, #billing) for filtering.
Jira Integration
Parse commit messages for Jira issue keys.
Auto-link new outputs to corresponding Jira tickets via API.
4. Technical Architecture
Components:
Local Watcher (Node.js, chokidar)
Runs on dev machines.
Automates add/commit/push for markdown changes.
GitHub Repo (Private)
Centralized storage.
Team access management.
History of all shared outputs.
(Optional) CI/CD Layer
GitHub Actions to build docs site or notify Slack.
Could use GitHub Pages for free hosting.
5. Workflow
Developer uses Cursor → saves relevant output to cursor-share/.
Watcher service detects file → commits & pushes.
GitHub repo updated instantly.
Team members notified (Slack/Teams) or simply pull latest changes.
Sprint review/reporting tools can pull data from repo by sprint folder.
6. Security & Governance
Repo set to private, only accessible by the dev team + product owners.
Dedicated GitHub bot account with scoped PAT for automation.
Compliance with org standards (no sensitive data leaks).
7. Future Phases
Semantic search: ingest markdown into Pinecone/Amazon Kendra for natural language queries.
Sprint Digest integration: pull markdown outputs into automated review decks.
Cross-project dashboards: visualize outputs by sprint, project, or issue type.
✅ Deliverable for MVP:
Shared GitHub repo with auto-committing watcher service.
Standard folder naming conventions per sprint.
Team trained to save all Cursor outputs into the folder.