# Eraser MCP Server

Model Context Protocol (MCP) server for [Eraser](https://eraser.io) - generate diagrams and access your files and diagrams.

## Quick Start

**Remote MCP endpoint:** `https://app.eraser.io/api/mcp`

Add this to your MCP config (e.g. **Cursor:** `.cursor/mcp.json` · **Claude Desktop:** your app's MCP settings file):

```json
{
  "mcpServers": {
    "eraser": {
      "type": "http",
      "url": "https://app.eraser.io/api/mcp"
    }
  }
}
```

Your client will prompt you to sign in to Eraser when authentication is required.

### npx (stdio bridge + OAuth)

Use the published npm package when you want a **local stdio** MCP server. It proxies to the same remote endpoint and signs you in with **OAuth** on first run (browser opens; credentials are stored on your machine).

Add this to your MCP config:

```json
{
  "mcpServers": {
    "eraser": {
      "command": "npx",
      "args": ["@eraserlabs/eraser-mcp"]
    }
  }
}
```

**API token (optional):** To skip OAuth (e.g. CI, scripts, or headless environments), add `ERASER_API_TOKEN` to `env` with an [API token from Eraser Settings](https://app.eraser.io/settings/api-tokens):

```json
{
  "mcpServers": {
    "eraser": {
      "command": "npx",
      "args": ["@eraserlabs/eraser-mcp"],
      "env": {
        "ERASER_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

## CLI Commands

| Command                             | Description                                         |
| ----------------------------------- | --------------------------------------------------- |
| `npx @eraserlabs/eraser-mcp`        | Start the MCP server (auto-authenticates via OAuth) |
| `npx @eraserlabs/eraser-mcp login`  | Manually trigger login                              |
| `npx @eraserlabs/eraser-mcp logout` | Clear saved credentials                             |
| `npx @eraserlabs/eraser-mcp whoami` | Show current auth status                            |

## Environment Variables

| Variable            | Required | Description                                                                                               |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `ERASER_API_TOKEN`  | No       | API token for CI/CD and headless environments (skips OAuth flow)                                          |
| `ERASER_API_URL`    | No       | MCP HTTP endpoint (default: production `https://app.eraser.io/api/mcp`; set only for staging/self-hosted) |
| `ERASER_OUTPUT_DIR` | No       | Directory to save rendered diagrams (default: `.eraser/scratchpad`)                                       |

## CI/CD and Headless Environments

For automated pipelines where a browser login isn't possible, set the `ERASER_API_TOKEN` environment variable. The OAuth flow is skipped entirely and the token is passed directly to the Eraser API.

Get your API token from [Eraser Settings](https://app.eraser.io/settings/api-tokens). Use the same config block shown in [API token (optional)](#npx-stdio-bridge--oauth) above.

## Available Tools

### Identity

Call `whoami` first to get the current user and active team.

| Tool         | Description                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `whoami`     | Returns current user profile, active team, and list of all teams. **Call this first.**          |
| `listTeams`  | Lists all teams the user is a member of (usually not needed since `whoami` includes this)       |
| `selectTeam` | Selects which team to use for subsequent operations when the user has multiple teams            |

### AI Diagram

Prompt to diagram.

| Tool           | Description                                      |
| -------------- | ------------------------------------------------ |
| `renderPrompt` | Generate diagrams from natural language using AI |

### Rendering

Diagram code (DSL) to diagram.

| Tool                              | Description                                          |
| --------------------------------- | ---------------------------------------------------- |
| `renderSequenceDiagram`           | Render sequence diagrams from diagram code           |
| `renderEntityRelationshipDiagram` | Render ERD diagrams from diagram code                |
| `renderCloudArchitectureDiagram`  | Render cloud architecture diagrams from diagram code |
| `renderFlowchart`                 | Render flowcharts from diagram code                  |
| `renderBpmnDiagram`               | Render BPMN diagrams from diagram code               |
| `renderElements`                  | Render multiple diagram elements from diagram code   |

### Files

CRUD for files on app.eraser.io.

| Tool          | Description                                                         |
| ------------- | ------------------------------------------------------------------- |
| `createFile`  | Create a new Eraser file with document and/or diagram elements      |
| `listFiles`   | List files in the workspace with pagination, sorting, and filtering |
| `getFile`     | Get a single file including metadata, content, and diagram elements |
| `updateFile`  | Update an existing file's metadata and/or document content          |
| `archiveFile` | Archive (soft-delete) a file                                        |

### Diagrams

CRUD for diagrams on app.eraser.io.

| Tool            | Description                              |
| --------------- | ---------------------------------------- |
| `listDiagrams`  | List all diagrams in a file              |
| `createDiagram` | Create a new diagram in an existing file |
| `getDiagram`    | Get a specific diagram from a file       |
| `updateDiagram` | Update the code of an existing diagram   |
| `deleteDiagram` | Permanently delete a diagram from a file |

## Documentation

- [Eraser Agent Integration Documentation](https://docs.eraser.io/docs/using-ai-agent-integrations)

## License

MIT
