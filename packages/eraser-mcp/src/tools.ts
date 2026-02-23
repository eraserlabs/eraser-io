import { z } from 'zod';

// Schemas
import { DiagramTypes } from './schemas/shared';
import { createFileSchema } from './schemas/files';
import { listFilesSchema } from './schemas/files';
import { getFileSchema } from './schemas/files';
import { updateFileSchema } from './schemas/files';
import { archiveFileSchema } from './schemas/files';
import { renderPromptSchema } from './schemas/renderPrompt';
import { renderElementsSchema } from './schemas/renderElements';
import { singleDiagramSchema } from './schemas/singleDiagram';
import {
  listDiagramsSchema,
  getDiagramSchema,
  createDiagramSchema,
  updateDiagramSchema,
  deleteDiagramSchema,
} from './schemas/diagrams';

// Descriptions
import {
  CREATE_FILE_DESCRIPTION,
  LIST_FILES_DESCRIPTION,
  GET_FILE_DESCRIPTION,
  UPDATE_FILE_DESCRIPTION,
  ARCHIVE_FILE_DESCRIPTION,
  LIST_DIAGRAMS_DESCRIPTION,
  CREATE_DIAGRAM_DESCRIPTION,
  GET_DIAGRAM_DESCRIPTION,
  UPDATE_DIAGRAM_DESCRIPTION,
  DELETE_DIAGRAM_DESCRIPTION,
  RENDER_PROMPT_DESCRIPTION,
  RENDER_ELEMENTS_DESCRIPTION,
} from './descriptions/tools';
import { SEQUENCE_DIAGRAM_DESCRIPTION } from './descriptions/sequenceDiagram';
import { ERD_DESCRIPTION } from './descriptions/erd';
import { CLOUD_ARCHITECTURE_DESCRIPTION } from './descriptions/cloudArchitecture';
import { FLOWCHART_DESCRIPTION } from './descriptions/flowchart';
import { BPMN_DESCRIPTION } from './descriptions/bpmn';

export type McpToolDefinition<TInput> = {
  name: string;
  description: string;
  schema: z.ZodType<TInput>;
  jsonSchema: Record<string, unknown>;
};

export const mcpTools: ReadonlyArray<McpToolDefinition<any>> = [
  // File CRUD
  {
    name: 'createFile',
    description: CREATE_FILE_DESCRIPTION,
    schema: createFileSchema,
    jsonSchema: createFileSchema.toJSONSchema(),
  },
  {
    name: 'listFiles',
    description: LIST_FILES_DESCRIPTION,
    schema: listFilesSchema,
    jsonSchema: listFilesSchema.toJSONSchema(),
  },
  {
    name: 'getFile',
    description: GET_FILE_DESCRIPTION,
    schema: getFileSchema,
    jsonSchema: getFileSchema.toJSONSchema(),
  },
  {
    name: 'updateFile',
    description: UPDATE_FILE_DESCRIPTION,
    schema: updateFileSchema,
    jsonSchema: updateFileSchema.toJSONSchema(),
  },
  {
    name: 'archiveFile',
    description: ARCHIVE_FILE_DESCRIPTION,
    schema: archiveFileSchema,
    jsonSchema: archiveFileSchema.toJSONSchema(),
  },
  // Diagram CRUD
  {
    name: 'listDiagrams',
    description: LIST_DIAGRAMS_DESCRIPTION,
    schema: listDiagramsSchema,
    jsonSchema: listDiagramsSchema.toJSONSchema(),
  },
  {
    name: 'createDiagram',
    description: CREATE_DIAGRAM_DESCRIPTION,
    schema: createDiagramSchema,
    jsonSchema: createDiagramSchema.toJSONSchema(),
  },
  {
    name: 'getDiagram',
    description: GET_DIAGRAM_DESCRIPTION,
    schema: getDiagramSchema,
    jsonSchema: getDiagramSchema.toJSONSchema(),
  },
  {
    name: 'updateDiagram',
    description: UPDATE_DIAGRAM_DESCRIPTION,
    schema: updateDiagramSchema,
    jsonSchema: updateDiagramSchema.toJSONSchema(),
  },
  {
    name: 'deleteDiagram',
    description: DELETE_DIAGRAM_DESCRIPTION,
    schema: deleteDiagramSchema,
    jsonSchema: deleteDiagramSchema.toJSONSchema(),
  },
  // Render tools
  {
    name: 'renderPrompt',
    description: RENDER_PROMPT_DESCRIPTION,
    schema: renderPromptSchema,
    jsonSchema: renderPromptSchema.toJSONSchema(),
  },
  {
    name: 'renderElements',
    description: RENDER_ELEMENTS_DESCRIPTION,
    schema: renderElementsSchema,
    jsonSchema: renderElementsSchema.toJSONSchema(),
  },
  {
    name: 'renderSequenceDiagram',
    description: SEQUENCE_DIAGRAM_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: singleDiagramSchema.toJSONSchema(),
  },
  {
    name: 'renderEntityRelationshipDiagram',
    description: ERD_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: singleDiagramSchema.toJSONSchema(),
  },
  {
    name: 'renderCloudArchitectureDiagram',
    description: CLOUD_ARCHITECTURE_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: singleDiagramSchema.toJSONSchema(),
  },
  {
    name: 'renderFlowchart',
    description: FLOWCHART_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: singleDiagramSchema.toJSONSchema(),
  },
  {
    name: 'renderBpmnDiagram',
    description: BPMN_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: singleDiagramSchema.toJSONSchema(),
  },
];

export type McpToolName = typeof mcpTools[number]['name'];

export function isMcpToolName(name: unknown): name is McpToolName {
  return mcpTools.some((tool) => tool.name === name);
}

export const mcpToolMap = new Map(mcpTools.map((tool) => [tool.name, tool]));

// Mapping from single diagram tool names to their diagram types
export const singleDiagramTools: Record<string, DiagramTypes> = {
  renderSequenceDiagram: DiagramTypes.SD,
  renderEntityRelationshipDiagram: DiagramTypes.ERD,
  renderCloudArchitectureDiagram: DiagramTypes.CAD,
  renderFlowchart: DiagramTypes.FLOW,
  renderBpmnDiagram: DiagramTypes.BPMN,
};

export function isSingleDiagramTool(name: string): name is keyof typeof singleDiagramTools {
  return name in singleDiagramTools;
}

// Paid tier tools (require auth)
const PAID_TOOL_NAMES = new Set([
  'createFile',
  'listFiles',
  'getFile',
  'updateFile',
  'archiveFile',
  'listDiagrams',
  'createDiagram',
  'getDiagram',
  'updateDiagram',
  'deleteDiagram',
  'renderPrompt',
]);

const PREFERRED_TOOL_NOTE =
  '\n\nNote: For rendering multiple diagrams at once, prefer the `renderElements` tool.';

export const freeMcpTools: ReadonlyArray<McpToolDefinition<any>> = mcpTools
  .filter((tool) => !PAID_TOOL_NAMES.has(tool.name))
  .map((tool) => ({
    ...tool,
    description: isSingleDiagramTool(tool.name)
      ? tool.description + PREFERRED_TOOL_NOTE
      : tool.description,
  }));

export const freeMcpToolMap = new Map(freeMcpTools.map((tool) => [tool.name, tool]));

export function isFreeMcpToolName(name: unknown): name is string {
  return freeMcpToolMap.has(name as string);
}
