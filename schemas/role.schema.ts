// features/roles/role.schema.ts
import { z } from "zod";

export const permissionSchema = z.object({
  resource: z.string(),
  action: z.enum(["READ", "CREATE", "UPDATE", "DELETE"]),
});

export const roleSchema = z.object({
  name: z.string().min(2),
  permissions: z.array(permissionSchema),
});

export type RoleInput = z.infer<typeof roleSchema>;