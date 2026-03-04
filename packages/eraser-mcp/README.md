# Eraser MCP Server

Model Context Protocol (MCP) server for [Eraser](https://eraser.io) - generate diagrams and access your files and diagrams.

## Quick Start

```bash
npx @eraserlabs/eraser-mcp
```

## Configuration

### Cursor

Add to `.cursor/mcp.json`:

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

### Claude Desktop

Add to your Claude Desktop config:

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

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ERASER_API_TOKEN` | Yes | Your Eraser API token |
| `ERASER_API_URL` | No | Custom API URL (default: `https://app.eraser.io/api/mcp`) |
| `ERASER_OUTPUT_DIR` | No | Directory to save rendered diagrams (default: `.eraser/scratchpad`) |

## Available Tools

### AI Diagram

Prompt to diagram.

| Tool | Description |
|------|-------------|
| `renderPrompt` | Generate diagrams from natural language using AI |

### Rendering

Diagram code (DSL) to diagram.

| Tool | Description |
|------|-------------|
| `renderSequenceDiagram` | Render sequence diagrams from diagram code |
| `renderEntityRelationshipDiagram` | Render ERD diagrams from diagram code |
| `renderCloudArchitectureDiagram` | Render cloud architecture diagrams from diagram code |
| `renderFlowchart` | Render flowcharts from diagram code |
| `renderBpmnDiagram` | Render BPMN diagrams from diagram code |
| `renderElements` | Render multiple diagram elements from diagram code |

### Files

CRUD for files on app.eraser.io.

| Tool | Description |
|------|-------------|
| `createFile` | Create a new Eraser file with document and/or diagram elements |
| `listFiles` | List files in the workspace with pagination, sorting, and filtering |
| `getFile` | Get a single file including metadata, content, and diagram elements |
| `updateFile` | Update an existing file's metadata and/or document content |
| `archiveFile` | Archive (soft-delete) a file |

### Diagrams

CRUD for diagrams on app.eraser.io.

| Tool | Description |
|------|-------------|
| `listDiagrams` | List all diagrams in a file |
| `createDiagram` | Create a new diagram in an existing file |
| `getDiagram` | Get a specific diagram from a file |
| `updateDiagram` | Update the code of an existing diagram |
| `deleteDiagram` | Permanently delete a diagram from a file |

## Documentation

- [Eraser Agent Integration Documentation](https://docs.eraser.io/docs/using-ai-agent-integrations)
- [Get an API Token](https://docs.eraser.io/reference/api-token)

## License

MIT
