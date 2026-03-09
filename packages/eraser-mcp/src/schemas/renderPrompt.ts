import { z } from 'zod';
import { renderOptionsSchema, gitRepoSchema, aiModeSettings } from './shared';

export const renderPromptSchema = renderOptionsSchema
  .extend({
    text: z.string(),
    diagramType: z.string().optional(),
    priorRequestId: z.string().optional().describe('Allows editing a previously created diagram.'),
    attachments: z.array(z.unknown()).optional(),
    contextId: z.string().optional().describe('ID of an AI preset belonging to the team.'),
    mode: z.enum(aiModeSettings).optional(),
    /** @deprecated Use gitContexts instead */
    git: gitRepoSchema.optional().describe('Deprecated: use gitContexts instead.'),
    gitContexts: z.array(gitRepoSchema).optional().describe('Git repository contexts for diagram generation. Supports one or more repositories.'),
  })
  .passthrough();

export type RenderPromptInput = z.infer<typeof renderPromptSchema>;
