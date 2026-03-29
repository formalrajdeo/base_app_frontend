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
import { Check, X } from "lucide-react";

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

  // 🔹 Fetch users
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/users")).data,
  });

  // 🔹 Fetch roles
  const {
    data: roles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await api.get("/roles")).data,
  });

  // 🔹 Assign/remove role
  const toggleRole = useMutation({
    mutationFn: async ({
      userId,
      roleId,
      assigned,
    }: {
      userId: string;
      roleId: string;
      assigned: boolean;
    }) =>
      assigned
        ? api.delete(`/users/${userId}/roles/${roleId}`)
        : api.post(`/users/${userId}/roles/${roleId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  // 🔹 Open modal
  const openModal = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // 🔹 Table columns
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "emailVerified",
        header: "Verified",
        cell: (info) => (info.getValue() ? <Check /> : <X />),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            size="sm"
            onClick={() => openModal(row.original)}
            variant="outline"
          >
            View/Edit Roles
          </Button>
        ),
      },
    ],
    []
  );

  // 🔹 Filtered users by search
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u: any) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  // 🔹 React Table setup
  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
        className="mb-4 max-w-sm"
      />

      {usersLoading ? (
        <div>Loading users...</div>
      ) : usersError ? (
        <div className="text-red-500">Failed to load users.</div>
      ) : filteredUsers.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="border px-4 py-2 text-left"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="border px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <div>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <Button
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Dialog for user roles */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? `Roles for ${selectedUser.name}` : "User Roles"}
              <DialogDescription>
                Roles determine the permissions a user has. Toggle roles to grant or revoke access.
              </DialogDescription>
            </DialogTitle>
          </DialogHeader>

          {rolesLoading ? (
            <div>Loading roles...</div>
          ) : rolesError ? (
            <div className="text-red-500">Failed to load roles.</div>
          ) : (
            <div className="space-y-3">
              {roles.map((r: Role) => {
                const assigned = selectedUser?.roles?.some((x) => x.id === r.id);

                return (
                  <Label key={r.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={!!assigned}
                      disabled={toggleRole.isPending}
                      onCheckedChange={() => {
                        if (!selectedUser) return;
                        toggleRole.mutate(
                          {
                            userId: selectedUser.id,
                            roleId: r.id,
                            assigned: !!assigned,
                          },
                          {
                            onSuccess: () => {
                              // Update local selectedUser roles immediately
                              setSelectedUser((prev) => {
                                if (!prev) return prev;
                                const newRoles = assigned
                                  ? prev.roles.filter((role) => role.id !== r.id)
                                  : [...prev.roles, { id: r.id, name: r.name }];
                                return { ...prev, roles: newRoles };
                              });
                            },
                          }
                        );
                      }}
                    />
                    {r.name}
                  </Label>
                );
              })}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}