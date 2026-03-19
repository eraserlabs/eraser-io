# Eraser Claude Plugin

Generate diagrams such as architecture, flowcharts, BPMN diagrams, sequence diagrams, and entity relationship diagrams from code, infrastructure, or descriptions using [Eraser.io](https://eraser.io).

## Quick Start

1. **Install the plugin:**

   ```bash
   /plugin install eraser@github:eraserlabs/eraserio/claude-plugins/eraser
   ```

2. **Optional: get your Eraser API token** from [Eraser documentation](https://docs.eraser.io/reference/api-token) for authenticated endpoints and watermark-free output

3. **If you have a token, configure it** (see [Configuration](#configuration) below)

4. **Start using it:**
   - **Using the skill**: Ask Claude "Create a diagram of my Terraform infrastructure" or use `/eraser:diagram`
   - **Using MCP tools**: Claude can automatically use MCP tools like `renderCloudArchitectureDiagram`, `renderSequenceDiagram`, etc. when appropriate

**Note**: The `/eraser:diagram` skill can work without an API token (diagrams will have watermarks). See [Configuration](#configuration) for details. For MCP tools on your first use, you'll be prompted to authenticate with your Eraser account via your browser.

## Installation

### From GitHub Repository

Install directly from this GitHub repository:

```bash
/plugin install eraser@github:eraserlabs/eraserio/claude-plugins/eraser
```

This installs the plugin from the `claude-plugins/eraser` directory in the repository. The plugin will be available as `/eraser:diagram` after installation.

### From Marketplace (Coming Soon)

Install from the Claude Code plugin marketplace:

```bash
/plugin install eraser@eraserlabs/eraserio
```

Or use the plugin manager:

1. Open Claude Code
2. Type `/plugin` and select "Discover"
3. Search for "eraser"
4. Click "Install"

## What's Included

This plugin provides:

1. **Skill**: `/eraser:diagram` - Generate diagrams from code, infrastructure files, or natural language descriptions
2. **MCP Tools**: Programmatic diagram rendering tools via Model Context Protocol

## Usage

### Using the Skill

Activate the skill when you want to create diagrams:

- "Create a diagram of my architecture"
- "Visualize this Terraform code"
- "Generate a sequence diagram for this API flow"
- "Draw a flowchart for this process"

The skill will:

1. Analyze your code, files, or description
2. Generate Eraser DSL code
3. Call the Eraser API to render the diagram
4. Return the image and editor link

### Using MCP Tools

The plugin includes MCP tools that can be called programmatically:

- `renderSequenceDiagram` - Render sequence diagrams from Eraser diagram code
- `renderEntityRelationshipDiagram` - Render ERD diagrams from Eraser diagram code
- `renderCloudArchitectureDiagram` - Render cloud architecture diagrams from Eraser diagram code
- `renderFlowchart` - Render flowcharts from Eraser diagram code
- `renderBpmnDiagram` - Render BPMN diagrams from Eraser diagram code
- `renderPrompt` - Generate diagrams from natural language using AI
- `renderElements` - Render multiple diagram elements

## Configuration

The plugin connects to the remote Eraser MCP server at `https://app.eraser.io/api/mcp`. Authentication is handled automatically via OAuth - you'll be prompted to sign in with your Eraser account on first use.

The MCP server configuration is in `.mcp.json`:

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

### Environment Variables (Optional)

| Variable       | Required | Description                                        |
| -------------- | -------- | -------------------------------------------------- |
| `ERASER_THEME` | No       | Diagram theme: `dark` or `light` (default: `dark`) |

## Features

- **Multiple Diagram Types** - Cloud architecture, sequence diagrams, ER diagrams, flowcharts, BPMN, and more
- **Editable Output** - Get an Eraser link to edit diagrams manually or with AI
- **High-Quality Diagrams** - Generate professional diagrams
- **Easy Integration** - One-click OAuth authentication, no API keys to manage

## Diagram Types Supported

- **Cloud Architecture Diagrams** - Visualize infrastructure, AWS, Azure, GCP resources
- **Sequence Diagrams** - API flows, system interactions, message passing
- **Entity Relationship Diagrams (ERD)** - Database schemas, data models
- **Flowcharts** - Process flows, user journeys, decision trees
- **BPMN Diagrams** - Business processes, swimlane diagrams

## Examples

### From Code

```
User: "Create a diagram of my Terraform infrastructure"
Claude: [Uses /eraser:diagram skill to analyze .tf files and generate diagram]
```

### From Description

```
User: "Draw a sequence diagram showing user login flow"
Claude: [Uses /eraser:diagram skill to generate sequence diagram]
```

### From Infrastructure Files

```
User: "Visualize my AWS CloudFormation template"
Claude: [Uses /eraser:diagram skill to parse CloudFormation and create diagram]
```

## Documentation

- [Eraser API Documentation](https://docs.eraser.io)
- [Eraser Agent Integration Documentation](https://docs.eraser.io/docs/using-ai-agent-integrations)

## License

MIT - see [LICENSE](../../LICENSE) for details.
