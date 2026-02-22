import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Settings duplicated from @eraserlabs/shared/modules/diagram-parser/settings
 * We avoid importing to keep eraser-mcp buildable independently.
 */
export const colorModeSettings = ['pastel', 'bold', 'outline'] as const;
export const styleModeSettings = ['plain', 'shadow', 'watercolor'] as const;
export const typefaceSettings = ['rough', 'clean', 'mono'] as const;
export const directionSettings = ['up', 'down', 'left', 'right'] as const;
export const linkAccessSettings = [
  'no-link-access',
  'anyone-with-link-can-edit',
  'publicly-viewable',
  'publicly-editable',
  'sso-readable',
  'sso-editable',
] as const;
export const aiModeSettings = ['standard', 'premium'] as const;

/**
 * The diagram types supported by the MCP tools.
 * Duplicated from DiagramTypes enum, excluding 'custom-diagram'.
 */
export enum DiagramTypes {
  SD = 'sequence-diagram',
  ERD = 'entity-relationship-diagram',
  CAD = 'cloud-architecture-diagram',
  FLOW = 'flowchart-diagram',
  BPMN = 'bpmn-diagram',
}

export const DiagramTypesEnum = z.nativeEnum(DiagramTypes);
export const LinkAccessEnum = z.enum(linkAccessSettings);

export const diagramElementSchema = z.object({
  type: z.literal('diagram'),
  diagramType: DiagramTypesEnum,
  code: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
});

export const gitRepoSchema = z.object({
  repoName: z.string().describe('Name of the repository.'),
  orgName: z.string().describe('Name of the organization.'),
});

export const fileOptionsSchema = z.object({
  create: z.boolean().optional().describe('Whether to create a new file. Defaults to false.'),
  linkAccess: LinkAccessEnum.optional().describe('Optional link sharing access level. Defaults to using team config.'),
});

export const imageQualitySchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const renderOptionsSchema = z
  .object({
    imageQuality: imageQualitySchema.optional().describe('Image resolution multiplier (1x, 2x, or 3x).'),
    background: z.boolean().optional().describe('Whether to include a solid background.'),
    theme: z.enum(['light', 'dark']).optional(),
    format: z.enum(['png', 'jpeg']).optional(),
    typeface: z.enum(typefaceSettings).optional(),
    colorMode: z.enum(colorModeSettings).optional(),
    styleMode: z.enum(styleModeSettings).optional(),
    direction: z.enum(directionSettings).optional().describe('Applies to flowcharts and architecture diagrams only.'),
    returnImageAsFile: z.boolean().optional().describe('If true, streams the image as a file to the client, with no other response.'),
    fileOptions: fileOptionsSchema.optional(),
  })
  .passthrough();

export function toJsonSchema(schema: z.ZodType): Record<string, unknown> {
  return zodToJsonSchema(schema, { target: 'openApi3' });
}

// Types
export type DiagramElementInput = z.infer<typeof diagramElementSchema>;
