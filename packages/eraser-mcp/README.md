# @eraserlabs/eraser-mcp

MCP (Model Context Protocol) server for generating diagrams with [eraser.io](https://eraser.io/?r=0).

## Installation

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

- `ERASER_API_TOKEN` (required) - Your Eraser API token
- `ERASER_API_URL` (optional) - Custom API URL (defaults to `https://app.eraser.io/api/mcp`)
- `ERASER_OUTPUT_DIR` (optional) - Local directory to save rendered diagrams (defaults to `.eraser/scratchpad`)

## Available Tools

- `renderSequenceDiagram` - Render sequence diagrams
- `renderEntityRelationshipDiagram` - Render ERD diagrams
- `renderCloudArchitectureDiagram` - Render cloud architecture diagrams
- `renderFlowchart` - Render flowcharts
- `renderBpmnDiagram` - Render BPMN diagrams
- `renderPrompt` - Generate diagrams from natural language using AI
- `renderElements` - Render multiple diagram elements

## License

MIT
