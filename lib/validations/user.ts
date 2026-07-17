import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(6).max(100),
  role: z.enum(["admin", "staff"]),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  role: z.enum(["admin", "staff"]).optional(),
});

export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
