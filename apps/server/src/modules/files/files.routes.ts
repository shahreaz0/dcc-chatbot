import { createRoute, z } from "@hono/zod-openapi";
import {
  createHttpErrorSchema,
  createSuccessSchema,
  ProjectIdParamsSchema,
} from "../../lib/common-schemas";
import { ProjectFileSchema } from "./files.schemas";

const tags = ["Files"];

export const uploadFile = createRoute({
  tags,
  method: "post",
  path: "/projects/{projectId}/files",
  summary: "Upload a file to a project",
  description:
    "Upload a file (image, PDF, text, etc.) and associate it with a project. Files are injected as context into chat conversations.",
  request: {
    params: ProjectIdParamsSchema,
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.any().openapi({
              type: "string",
              format: "binary",
              description:
                "The file to upload (images, PDFs, text files, etc.)",
            }),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Created — File uploaded and associated with project",
      content: {
        "application/json": {
          schema: createSuccessSchema(ProjectFileSchema),
        },
      },
    },
    400: {
      description: "Bad Request — No file provided or invalid file",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "400" }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "401" }),
        },
      },
    },
    404: {
      description: "Project not found",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "404" }),
        },
      },
    },
  },
});

export const listFiles = createRoute({
  tags,
  method: "get",
  path: "/projects/{projectId}/files",
  summary: "List files associated with a project",
  description: "Retrieve all files uploaded and associated with a project.",
  request: {
    params: ProjectIdParamsSchema,
  },
  responses: {
    200: {
      description: "OK — Files listed",
      content: {
        "application/json": {
          schema: createSuccessSchema(z.array(ProjectFileSchema)),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "401" }),
        },
      },
    },
    404: {
      description: "Project not found",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "404" }),
        },
      },
    },
  },
});

export const deleteFile = createRoute({
  tags,
  method: "delete",
  path: "/projects/{projectId}/files/{id}",
  summary: "Delete a file from a project",
  description: "Delete a file record and remove the file from disk.",
  request: {
    params: z.object({
      projectId: z.string().openapi({ description: "ID of project" }),
      id: z.string().openapi({ description: "ID of file record" }),
    }),
  },
  responses: {
    200: {
      description: "OK — File deleted",
      content: {
        "application/json": {
          schema: z.object({ status: z.literal("success") }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "401" }),
        },
      },
    },
    404: {
      description: "File or project not found",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "404" }),
        },
      },
    },
  },
});

export type UploadFileRoute = typeof uploadFile;
export type ListFilesRoute = typeof listFiles;
export type DeleteFileRoute = typeof deleteFile;
