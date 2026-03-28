import { useQuery } from "@tanstack/react-query";
import { User } from "@/schemas/user.schema";
import { api } from "@/lib/api";

export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: api.getUsers,
  });
}