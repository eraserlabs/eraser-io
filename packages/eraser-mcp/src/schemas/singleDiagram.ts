import { z } from 'zod';
import { renderOptionsSchema } from './shared';

export const singleDiagramSchema = renderOptionsSchema.extend({
  code: z.string().describe('The diagram code in Eraser syntax.'),
});

export type SingleDiagramInput = z.infer<typeof singleDiagramSchema>;
