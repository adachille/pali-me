.PHONY: claude-update-agent-md claude-sync-docs claude-create-pr-description

claude-update-agent-md:
	@claude --permission-mode acceptEdits "/update-agent-md"

claude-sync-docs:
	@claude --permission-mode acceptEdits "/sync-docs"

claude-create-pr-description:
	@claude --permission-mode acceptEdits "/create-pr-description"