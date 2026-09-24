const { z } = require("zod");

const taskSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(500),
  completed: z.boolean().default(false),
});

module.exports = taskSchema;
