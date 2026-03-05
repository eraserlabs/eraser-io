import { z } from 'zod';
import { DiagramTypesEnum } from './shared';

export const listDiagramsSchema = z.object({
  fileId: z.string().describe('The ID of the file containing the diagrams.'),
});

export const getDiagramSchema = z.object({
  fileId: z.string().describe('The ID of the file containing the diagram.'),
  diagramId: z.string().describe('The ID of the diagram to retrieve.'),
});

export const createDiagramSchema = z.object({
  fileId: z.string().describe('The ID of the file to add the diagram to.'),
  diagramType: DiagramTypesEnum.describe('The type of diagram to create.'),
  code: z.string().optional().describe('The diagram code in Eraser syntax. If omitted, creates an empty diagram.'),
});

export const updateDiagramSchema = z.object({
  fileId: z.string().describe('The ID of the file containing the diagram.'),
  diagramId: z.string().describe('The ID of the diagram to update.'),
  code: z.string().describe('The new diagram code in Eraser syntax.'),
});

export const deleteDiagramSchema = z.object({
  fileId: z.string().describe('The ID of the file containing the diagram.'),
  diagramId: z.string().describe('The ID of the diagram to delete.'),
});

export type ListDiagramsInput = z.infer<typeof listDiagramsSchema>;
export type GetDiagramInput = z.infer<typeof getDiagramSchema>;
export type CreateDiagramInput = z.infer<typeof createDiagramSchema>;
export type UpdateDiagramInput = z.infer<typeof updateDiagramSchema>;
export type DeleteDiagramInput = z.infer<typeof deleteDiagramSchema>;
