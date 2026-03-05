import { z } from 'zod';
import { renderOptionsSchema, diagramElementSchema } from './shared';

export const renderElementsSchema = renderOptionsSchema
  .extend({
    elements: z.array(diagramElementSchema),
  })
  .passthrough();

export type RenderElementsInput = z.infer<typeof renderElementsSchema>;
