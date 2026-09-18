# Local Pi Harness Configuration

Copy this file to `AGENTS.local.md` to add machine-specific or personal agent instructions.
These will not be committed to the repository.

- Never blindly use recursive `grep`—exclude `.git`, `.next`, `node_modules`, `dist`, `build`, `coverage`, caches, and other generated/binary files to keep searches bounded and output readable.
- Prefer referring to graphify report for faster file location lookup using the graphify skill.
- For `graphify --mode deep`: ensure `~/.local/bin/antigravity-openai-bridge` runs on port 51155 and run with `ANTIGRAVITY_DUMMY_KEY="dummy" graphify extract . --backend antigravity --mode deep` (uses Antigravity OAuth, no API key required).
