# Eraser

Open-source tools for generating diagrams and accessing your files, diagrams, and documents on [Eraser](https://eraser.io).

⭐ If you find this useful, give us a star!

## What's Here

| Resource | Description |
|----------|-------------|
| [Claude Plugin](./claude-plugins/eraser) | Claude Code plugin with skill and MCP integration |
| [Skills](./skills) | Agent skills for Claude Code, Cursor, and other AI assistants |
| [MCP Server](./packages/eraser-mcp) | Model Context Protocol server for any MCP-compatible client |

## Quick Start

**For Claude Code:**

Install the plugin (includes skill + MCP tools):

```bash
/plugin install eraser@github:eraserlabs/eraserio/claude-plugins/eraser
```

See the [Claude Plugin README](./claude-plugins/eraser/README.md) for details.

**For Cursor and other AI Assistants:**

```bash
npx skills add eraserlabs/eraser-io
```

See the [Skills README](./skills/README.md) for details.

**For standalone MCP Integration:**

See the [MCP Server README](./packages/eraser-mcp/README.md) for setup.

## Documentation

- [Eraser Agent Integration Documentation](https://docs.eraser.io/docs/using-ai-agent-integrations)
- [Get an API Token](https://docs.eraser.io/reference/api-token)

## License

MIT
