import { z } from 'zod';

// Schemas
import {
  DiagramTypes,
  toJsonSchema,
  DiagramElementInput,
} from './schemas/shared';
import { createFileSchema, CreateFileInput } from './schemas/files';
import { listFilesSchema, ListFilesInput } from './schemas/files';
import { getFileSchema, GetFileInput } from './schemas/files';
import { updateFileSchema, UpdateFileInput } from './schemas/files';
import { archiveFileSchema, ArchiveFileInput } from './schemas/files';
import { renderPromptSchema, RenderPromptInput } from './schemas/renderPrompt';
import { renderElementsSchema, RenderElementsInput } from './schemas/renderElements';
import { singleDiagramSchema, SingleDiagramInput } from './schemas/singleDiagram';
import {
  listDiagramsSchema, ListDiagramsInput,
  getDiagramSchema, GetDiagramInput,
  createDiagramSchema, CreateDiagramInput,
  updateDiagramSchema, UpdateDiagramInput,
  deleteDiagramSchema, DeleteDiagramInput,
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
    jsonSchema: toJsonSchema(createFileSchema),
  },
  {
    name: 'listFiles',
    description: LIST_FILES_DESCRIPTION,
    schema: listFilesSchema,
    jsonSchema: toJsonSchema(listFilesSchema),
  },
  {
    name: 'getFile',
    description: GET_FILE_DESCRIPTION,
    schema: getFileSchema,
    jsonSchema: toJsonSchema(getFileSchema),
  },
  {
    name: 'updateFile',
    description: UPDATE_FILE_DESCRIPTION,
    schema: updateFileSchema,
    jsonSchema: toJsonSchema(updateFileSchema),
  },
  {
    name: 'archiveFile',
    description: ARCHIVE_FILE_DESCRIPTION,
    schema: archiveFileSchema,
    jsonSchema: toJsonSchema(archiveFileSchema),
  },
  // Diagram CRUD
  {
    name: 'listDiagrams',
    description: LIST_DIAGRAMS_DESCRIPTION,
    schema: listDiagramsSchema,
    jsonSchema: toJsonSchema(listDiagramsSchema),
  },
  {
    name: 'createDiagram',
    description: CREATE_DIAGRAM_DESCRIPTION,
    schema: createDiagramSchema,
    jsonSchema: toJsonSchema(createDiagramSchema),
  },
  {
    name: 'getDiagram',
    description: GET_DIAGRAM_DESCRIPTION,
    schema: getDiagramSchema,
    jsonSchema: toJsonSchema(getDiagramSchema),
  },
  {
    name: 'updateDiagram',
    description: UPDATE_DIAGRAM_DESCRIPTION,
    schema: updateDiagramSchema,
    jsonSchema: toJsonSchema(updateDiagramSchema),
  },
  {
    name: 'deleteDiagram',
    description: DELETE_DIAGRAM_DESCRIPTION,
    schema: deleteDiagramSchema,
    jsonSchema: toJsonSchema(deleteDiagramSchema),
  },
  // Render tools
  {
    name: 'renderPrompt',
    description: RENDER_PROMPT_DESCRIPTION,
    schema: renderPromptSchema,
    jsonSchema: toJsonSchema(renderPromptSchema),
  },
  {
    name: 'renderElements',
    description: RENDER_ELEMENTS_DESCRIPTION,
    schema: renderElementsSchema,
    jsonSchema: toJsonSchema(renderElementsSchema),
  },
  {
    name: 'renderSequenceDiagram',
    description: SEQUENCE_DIAGRAM_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: toJsonSchema(singleDiagramSchema),
  },
  {
    name: 'renderEntityRelationshipDiagram',
    description: ERD_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: toJsonSchema(singleDiagramSchema),
  },
  {
    name: 'renderCloudArchitectureDiagram',
    description: CLOUD_ARCHITECTURE_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: toJsonSchema(singleDiagramSchema),
  },
  {
    name: 'renderFlowchart',
    description: FLOWCHART_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: toJsonSchema(singleDiagramSchema),
  },
  {
    name: 'renderBpmnDiagram',
    description: BPMN_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: toJsonSchema(singleDiagramSchema),
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

// Re-export types for convenience
export type {
  RenderPromptInput,
  DiagramElementInput,
  RenderElementsInput,
  SingleDiagramInput,
  CreateFileInput,
  ListFilesInput,
  GetFileInput,
  UpdateFileInput,
  ArchiveFileInput,
  ListDiagramsInput,
  GetDiagramInput,
  CreateDiagramInput,
  UpdateDiagramInput,
  DeleteDiagramInput,
};

// Re-export DiagramTypes for external use
export { DiagramTypes };
