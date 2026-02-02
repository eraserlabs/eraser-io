import { z } from 'zod';

// Schemas
import {
  DiagramTypes,
  toJsonSchema,
  DiagramElementInput,
} from './schemas/shared';
import { createFileSchema, CreateFileInput } from './schemas/createFile';
import { renderPromptSchema, RenderPromptInput } from './schemas/renderPrompt';
import { renderElementsSchema, RenderElementsInput } from './schemas/renderElements';
import { singleDiagramSchema, SingleDiagramInput } from './schemas/singleDiagram';

// Descriptions
import {
  CREATE_FILE_DESCRIPTION,
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
  {
    name: 'createFile',
    description: CREATE_FILE_DESCRIPTION,
    schema: createFileSchema,
    jsonSchema: toJsonSchema(createFileSchema),
  },
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

// Re-export types for convenience
export type {
  RenderPromptInput,
  DiagramElementInput,
  RenderElementsInput,
  SingleDiagramInput,
  CreateFileInput,
};

// Re-export DiagramTypes for external use
export { DiagramTypes };
