import { z } from "@hono/zod-openapi";

/**
 * ID path parameter schema
 */
export const IdParamsSchema = z.object({
  id: z.string().openapi({
    example: "clx123abc456def789",
    description: "ID of the resource",
  }),
});

/**
 * Project ID path parameter schema
 */
export const ProjectIdParamsSchema = z.object({
  projectId: z.string().openapi({
    example: "clx123abc456def789",
    description: "ID of the project",
  }),
});

/**
 * Not found error response schema
 */
export const NotFoundSchema = z.object({
  status: z.literal("error"),
  message: z.string().openapi({ example: "Not found" }),
});

/**
 * Helper to create HTTP error response schemas
 */
export function createHttpErrorSchema(params: {
  statusCode: "400" | "401" | "403" | "404" | "409";
  example?: string;
}) {
  const defaultStatusTexts = {
    "400": "Bad Request",
    "401": "Unauthorized",
    "403": "Forbidden",
    "404": "Not found",
    "409": "Conflict",
  } as const;

  const example = params.example ?? defaultStatusTexts[params.statusCode];

  return z.object({
    status: z.literal("error"),
    message: z.string().openapi({ example }),
  });
}

/**
 * Helper to create a typed success response schema
 * Wraps data in { status: "success", data: T }
 */
export function createSuccessSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    status: z.literal("success"),
    data: dataSchema,
  });
}

/**
 * Common pagination query parameters
 */
export const PaginationQuerySchema = z.object({
  perPage: z.coerce.number().int().min(1).max(100).optional().openapi({
    example: 50,
    description: "Number of items per page (1-100).",
  }),
  page: z.coerce.number().int().min(1).default(1).openapi({
    example: 1,
    description: "Page number (1-indexed). Defaults to 1.",
  }),
});

export function buildPagination(
  page?: number | undefined,
  perPage?: number | undefined,
) {
  if (perPage === undefined) {
    return {};
  }

  const currentPage = page ?? 1;
  return {
    skip: (currentPage - 1) * perPage,
    take: perPage,
  };
}
