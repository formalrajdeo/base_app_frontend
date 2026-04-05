"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  Check,
  Loader2,
  RefreshCcw,
  X,
  Lock,
} from "lucide-react";

type Role = { id: string; name: string };
type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ✅ USERS QUERY
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const res = await api.get("/users");
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 403) return null;
        throw err;
      }
    },
  });

  // ✅ ROLES QUERY
  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      try {
        const res = await api.get("/roles");
        return res.data || [];
      } catch (err: any) {
        if (err.response?.status === 403) return null;
        throw err;
      }
    },
  });

  // ✅ DERIVED USER (ALWAYS FRESH)
  const selectedUser = useMemo(() => {
    if (!users || !selectedUserId) return null;
    return users.find((u: User) => u.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  // ✅ MUTATION WITH OPTIMISTIC UPDATE
  const toggleRole = useMutation({
    mutationFn: async ({
      userId,
      roleId,
      assigned,
    }: {
      userId: string;
      roleId: string;
      assigned: boolean;
    }) => {
      return assigned
        ? await api.delete(`/users/${userId}/roles/${roleId}`)
        : await api.post(`/users/${userId}/roles/${roleId}`);
    },

    onMutate: async ({ userId, roleId, assigned }) => {
      await qc.cancelQueries({ queryKey: ["users"] });

      const prev = qc.getQueryData<User[]>(["users"]);

      qc.setQueryData(["users"], (old: User[] | undefined) => {
        if (!old) return old;

        return old.map((u) => {
          if (u.id !== userId) return u;

          return {
            ...u,
            roles: assigned
              ? u.roles.filter((r) => r.id !== roleId)
              : [...u.roles, { id: roleId, name: "" }],
          };
        });
      });

      return { prev };
    },

    onError: (err: any, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["users"], ctx.prev);

      if (err.response?.status === 403) {
        alert("You are not allowed to change roles 🚫");
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const openModal = (user: User) => {
    setSelectedUserId(user.id);
    setModalOpen(true);
  };

  // ✅ TABLE
  const columns = useMemo<ColumnDef<User>[]>(() => [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "emailVerified",
      header: "Verified",
      cell: (info) =>
        info.getValue() ? (
          <Check className="text-green-500" />
        ) : (
          <X className="text-red-500" />
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: (info) =>
        new Date(info.getValue() as string).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          onClick={() => openModal(row.original)}
          variant="outline"
          disabled={users === null}
        >
          View/Edit Roles
        </Button>
      ),
    },
  ], [users]);

  // ✅ FILTER
  const filteredUsers = useMemo(() => {
    if (!users || users === null) return [];
    return users.filter(
      (u: User) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-6 space-y-6 bg-background text-foreground min-h-screen">
      <h1 className="text-2xl font-bold">Users</h1>

      {/* SEARCH */}
      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* STATES */}
      {users === null ? (
        <div className="flex flex-col items-center py-10 gap-3 border rounded-lg bg-yellow-100">
          <Lock className="h-8 w-8 text-yellow-600" />
          <p>You don't have permission to view users</p>
        </div>
      ) : usersLoading ? (
        <div className="flex flex-col items-center py-10 gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading users...</p>
        </div>
      ) : usersError ? (
        <div className="flex flex-col items-center py-10 gap-3">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p>Something went wrong</p>
          <Button onClick={() => qc.invalidateQueries({ queryKey: ["users"] })}>
            Retry
          </Button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-4 py-2 text-left">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-between">
        <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>

      {/* MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Roles for {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Toggle roles to manage access
            </DialogDescription>
          </DialogHeader>

          {roles === null ? (
            <p className="text-yellow-600">No permission to view roles</p>
          ) : rolesLoading ? (
            <Loader2 className="animate-spin" />
          ) : rolesError ? (
            <p>Error loading roles</p>
          ) : (
            roles.map((r: Role) => {
              const assigned = selectedUser?.roles?.some(
                (x: Role) => x.id === r.id
              );

              return (
                <Label key={r.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={!!assigned}
                    disabled={toggleRole.isPending}
                    onCheckedChange={() => {
                      if (!selectedUser) return;

                      toggleRole.mutate({
                        userId: selectedUser.id,
                        roleId: r.id,
                        assigned: !!assigned,
                      });
                    }}
                  />
                  {r.name}
                </Label>
              );
            })
          )}

          <DialogFooter>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}