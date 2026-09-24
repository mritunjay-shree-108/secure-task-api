const { z } = require("zod");

const taskPatchSchema = z
  .object({
    title: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().min(1).max(500).optional(),
    completed: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Atleast one field is required",
  });

module.exports = taskPatchSchema;
