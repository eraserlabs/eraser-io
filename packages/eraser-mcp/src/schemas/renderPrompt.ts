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
    git: gitRepoSchema.optional(),
  })
  .passthrough();

export type RenderPromptInput = z.infer<typeof renderPromptSchema>;
