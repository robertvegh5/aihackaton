# Internal Hackathon AI Setup

This repo is set up for an internal hackathon with OpenCode, and the GitHub Copilot Extension in VS Code.

## Recommended Setup

1. Install OpenCode from [opencode.ai/download](https://opencode.ai/download).
2. If you are using OpenCode for the first time, run `/connect` inside OpenCode and authenticate with the GitHub Copilot provider.
3. If you are not a developer, use the OpenCode desktop app.
4. If you want OpenCode inside your editor, simply run the cli in an integrated terminal.
5. Use the GitHub Copilot Extension locally against this repo if desired.

## Repo Layout

- `opencode.json`: main OpenCode config
- `.opencode/prompts/frontend.md`: prompt for the frontend agent
- `.agents/skills/`: reusable OpenCode skills available to agents
- `AGENTS.md`: shared project instructions for local AI tools

## Customize

- Change OpenCode models or agents in `opencode.json`
- Add more skills under `.agents/skills/<skill-name>/SKILL.md`
- Add shared repo guidance in `AGENTS.md`

After changing OpenCode config, restart OpenCode to reload the config.

## Test Branch Note

This repo includes a small test commit on `test/opencode-push` to verify feature branch push access.

## Useful Skills

Some repo-local OpenCode skills that are useful during the hackathon:

- `agent-browser`: use for browser automation, QA flows, screenshots, scraping, and testing web apps. Example: "Open the signup flow and take a screenshot of the error state."
- `frontend-design` / `design-engineering`: use for stronger UI design and frontend polish. `design-engineering` is the stronger choice when motion, animation, and interaction polish matter. Example: "Make this landing page feel more premium without changing the content."
- `grill-with-docs`: use to build up shared knowledge and refine an idea into a clearer plan before executing. Example: "Grill this checkout redesign before we implement it."
- `logging-best-practices`: use when adding or reviewing logs. Example: "Review this API flow and suggest better structured logs."

## Security Rules

- Treat this repo and all prompts as internal-only
- OpenCode chat sharing is disabled in `opencode.json` and should stay disabled
- Do not enable MCP servers for this repo

## References

- OpenCode docs: [opencode.ai/docs](https://opencode.ai/docs)
- OpenCode download: [opencode.ai/download](https://opencode.ai/download)
