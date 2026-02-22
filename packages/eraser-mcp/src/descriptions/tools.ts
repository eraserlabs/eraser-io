export const CREATE_FILE_DESCRIPTION =
  'Create a new Eraser file with a document and/or diagram elements. The document field accepts markdown content and supports embedded diagram code blocks (e.g., ```flowchart-diagram) which are automatically converted to interactive canvas diagrams. Additionally supports standalone diagram elements via the elements array.';

export const RENDER_PROMPT_DESCRIPTION =
  'Generate a diagram using AI from a natural language prompt, existing code, infrastructure configuration, or other diagram languages. Best for when you want AI to create the diagram code for you.';

export const RENDER_ELEMENTS_DESCRIPTION =
  'Render multiple diagram elements. Advanced use case for rendering multiple diagrams at once.';

export const LIST_FILES_DESCRIPTION =
  'List files in the workspace with pagination, sorting, and filtering. Returns file metadata (not content). Use getFile to retrieve file content.';

export const GET_FILE_DESCRIPTION =
  'Get a single file. Includes metadata, markdown content, and diagram elements. Use this to read the current state of a file before making updates.';

export const UPDATE_FILE_DESCRIPTION = `Update an existing file's metadata and / or document content`;

export const ARCHIVE_FILE_DESCRIPTION =
  'Archive (soft-delete) a file. The file can be restored from the trash in the Eraser UI. This does not permanently delete the file.';

export const LIST_DIAGRAMS_DESCRIPTION =
  'List all diagrams in a file. Returns diagram metadata including type and code for each diagram element on the canvas.';

export const CREATE_DIAGRAM_DESCRIPTION =
  "Create a new diagram in an existing file. The diagram is added to the file's canvas. Specify the diagram type and optionally provide initial code.";

export const GET_DIAGRAM_DESCRIPTION =
  'Get a specific diagram from a file, including its type and code.';

export const UPDATE_DIAGRAM_DESCRIPTION =
  "Update the code of an existing diagram in a file. Replaces the diagram's code with the new value.";

export const DELETE_DIAGRAM_DESCRIPTION =
  'Permanently delete a diagram from a file. This removes the diagram element from the canvas. This action cannot be undone.';
