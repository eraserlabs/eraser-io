import { z } from 'zod';
import { DiagramTypesEnum, LinkAccessEnum } from './shared';

export const createFileSchema = z.object({
  title: z.string().optional().describe('Title for the file.'),
  markdown: z
    .string()
    .optional()
    .describe(
      'Markdown content for notes. Supports diagram code blocks (e.g., ```flowchart-diagram) which are converted to embedded diagrams.'
    ),
  elements: z
    .array(
      z.object({
        type: z.literal('diagram'),
        diagramType: DiagramTypesEnum,
        code: z.string(),
      })
    )
    .optional()
    .describe('Standalone diagram elements using diagram DSL syntax. Will be added to canvas.'),
  linkAccess: LinkAccessEnum.optional().describe('Optional link sharing access level. Defaults to using team config.'),
});

export type CreateFileInput = z.infer<typeof createFileSchema>;
