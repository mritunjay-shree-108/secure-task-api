const { z } = require("zod");

const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(5),
  sort: z.enum(["latest", "oldest"]).default("latest"),
  completed: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  search: z.string().trim().max(50).optional(),
});

module.exports = taskQuerySchema;
