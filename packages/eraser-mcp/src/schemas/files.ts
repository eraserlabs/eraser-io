import { z } from 'zod';
import { DiagramTypesEnum, LinkAccessEnum } from './shared';

export const createFileSchema = z.object({
  title: z.string().optional().describe('Title for the file.'),
  document: z
    .string()
    .optional()
    .describe(
      'Markdown content for the document. Supports diagram code blocks (e.g., ```flowchart-diagram) which are converted to embedded diagrams.'
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

export const listFilesSchema = z.object({
  limit: z.number().optional().describe('Maximum number of files to return (1-500). Defaults to 100.'),
  cursor: z.string().optional().describe('Cursor for pagination. Use nextCursor from a previous response.'),
  folderId: z.string().optional().describe('Filter files by folder ID.'),
  sort: z.string().optional().describe('Sort field with optional "-" prefix for descending. Examples: "-updatedAt" (default), "createdAt". Valid fields: createdAt, updatedAt.'),
  author: z.string().optional().describe('Filter by author (user ID or email address).'),
});

export const getFileSchema = z.object({
  fileId: z.string().describe('The ID of the file to retrieve.'),
});

export const updateFileSchema = z.object({
  fileId: z.string().describe('The ID of the file to update.'),
  title: z.string().optional().describe('New title for the file.'),
  folderId: z.string().optional().describe('Folder ID to move the file into.'),
  document: z.string().optional().describe('Markdown content for the document. Replaces existing document content. Supports diagram code blocks (e.g., ```flowchart-diagram). To edit existing diagram embeds, use the updateDiagram tool.'),
  linkAccess: LinkAccessEnum.optional().describe('Optional link sharing access level.'),
});

export const archiveFileSchema = z.object({
  fileId: z.string().describe('The ID of the file to archive.'),
});

export type CreateFileInput = z.infer<typeof createFileSchema>;
export type ListFilesInput = z.infer<typeof listFilesSchema>;
export type GetFileInput = z.infer<typeof getFileSchema>;
export type UpdateFileInput = z.infer<typeof updateFileSchema>;
export type ArchiveFileInput = z.infer<typeof archiveFileSchema>;
