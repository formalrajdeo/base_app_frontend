"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type Action = "READ" | "CREATE" | "UPDATE" | "DELETE";
const ACTIONS: Action[] = ["READ", "CREATE", "UPDATE", "DELETE"];

interface Permission {
    id: string;
    resource: string;
    action: Action;
}

interface Resource {
    id: string;
    name: string;
    description?: string | null;
}

export default function PermissionsPage() {
    const queryClient = useQueryClient();

    // State
    const [newResourceName, setNewResourceName] = useState("");
    const [newResourceAction, setNewResourceAction] = useState<Action>("READ");
    const [selectedResourceName, setSelectedResourceName] = useState("");
    const [selectedAction, setSelectedAction] = useState<Action>("READ");
    const [inlineActions, setInlineActions] = useState<Record<string, string>>({});

    // Fetch permissions
    const { data: permissions = [], isLoading: loadingPermissions } = useQuery<Permission[]>({
        queryKey: ["permissions"],
        queryFn: async () => {
            const res = await api.get("/permissions");
            const data = res.data?.data ?? res.data;
            return Array.isArray(data) ? data : [];
        },
    });

    // Fetch resources
    const { data: resources = [], isLoading: loadingResources } = useQuery<Resource[]>({
        queryKey: ["resources"],
        queryFn: async () => {
            const res = await api.get("/resources");
            const data = res.data?.data ?? res.data;
            return Array.isArray(data) ? data : [];
        },
    });

    // Group permissions by resource
    const groupedPermissions = Array.isArray(permissions)
        ? permissions.reduce<Record<string, Permission[]>>((acc, p) => {
            if (!acc[p.resource]) acc[p.resource] = [];
            acc[p.resource].push(p);
            return acc;
        }, {})
        : {};
        
    // Mutations
    const createResourcePermission = useMutation({
        mutationFn: async () => api.post("/permissions", { resource: newResourceName, action: newResourceAction }),
        onSuccess: () => {
            toast.success("Permission created");
            setNewResourceName("");
            setNewResourceAction("READ");
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
            queryClient.invalidateQueries({ queryKey: ["resources"] });
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || err?.message || "Failed to create permission";
            toast.error(message);
        },
    });

    const assignAction = useMutation({
        mutationFn: async () => api.post("/permissions", { resource: selectedResourceName, action: selectedAction }),
        onSuccess: () => {
            toast.success("Action assigned");
            setSelectedResourceName("");
            setSelectedAction("READ");
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || err?.message || "Failed to assign action";
            toast.error(message);
        },
    });

    const addInlineAction = useMutation({
        mutationFn: async ({ resource, action }: { resource: string; action: string }) =>
            api.post("/permissions", { resource, action }),
        onSuccess: (_, { resource }) => {
            toast.success("Action added");
            setInlineActions(prev => ({ ...prev, [resource]: "" }));
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || err?.message || "Failed to add action";
            toast.error(message);
        },
    });

    const deletePermission = useMutation({
        mutationFn: async (id: string) => api.delete(`/permissions/${id}`),
        onSuccess: () => {
            toast.success("Permission deleted");
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || err?.message || "Failed to delete permission";
            toast.error(message);
        },
    });

    const deleteResource = useMutation({
        mutationFn: async (id: string) => api.delete(`/resources/${id}`),
        onSuccess: () => {
            toast.success("Resource deleted");
            queryClient.invalidateQueries({ queryKey: ["resources"] });
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || err?.message || "Failed to delete resource";
            toast.error(message);
        },
    });

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Permissions</h1>

            {/* Create New Resource + Action */}
            <Card>
                <CardHeader>Create New Resource + Action</CardHeader>
                <CardContent className="flex gap-3 flex-wrap">
                    <Input
                        placeholder="Resource name"
                        value={newResourceName}
                        onChange={e => setNewResourceName(e.target.value)}
                    />
                    <select
                        className="border rounded px-2 py-1"
                        value={newResourceAction}
                        onChange={e => setNewResourceAction(e.target.value as Action)}
                    >
                        {ACTIONS.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                    <Button onClick={() => createResourcePermission.mutate()} disabled={!newResourceName}>
                        Create
                    </Button>
                </CardContent>
            </Card>

            {/* Assign Action to Existing Resource */}
            <Card>
                <CardHeader>Assign Action to Existing Resource</CardHeader>
                <CardContent className="flex gap-3 flex-wrap">
                    <select
                        className="border rounded px-2 py-1"
                        value={selectedResourceName}
                        onChange={e => setSelectedResourceName(e.target.value)}
                    >
                        <option value="">Select Resource</option>
                        {resources.map(r => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                    </select>

                    <select
                        className="border rounded px-2 py-1"
                        value={selectedAction}
                        onChange={e => setSelectedAction(e.target.value as Action)}
                    >
                        {ACTIONS.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>

                    <Button disabled={!selectedResourceName} onClick={() => assignAction.mutate()}>
                        Assign
                    </Button>
                </CardContent>
            </Card>

            {/* List All Resources */}
            {loadingResources || loadingPermissions ? (
                <div>Loading...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(r => {
                        const perms = groupedPermissions[r.name] || [];
                        return (
                            <Card key={r.id}>
                                <CardHeader className="flex justify-between items-center">
                                    <span className="font-semibold capitalize">{r.name}</span>
                                    <button
                                        onClick={() => deleteResource.mutate(r.id)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Delete Resource"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    {perms.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {perms.map(p => (
                                                <Badge key={p.id} className="flex items-center gap-1">
                                                    {p.action}
                                                    <button
                                                        className="ml-1 text-red-500 hover:text-red-700"
                                                        title="Delete Permission"
                                                        onClick={() => deletePermission.mutate(p.id)}
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500">No permissions yet</div>
                                    )}

                                    {/* Add Inline Action */}
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            placeholder="New action"
                                            value={inlineActions[r.name] || ""}
                                            onChange={e => setInlineActions({ ...inlineActions, [r.name]: e.target.value })}
                                        />
                                        <Button
                                            onClick={() => addInlineAction.mutate({ resource: r.name, action: inlineActions[r.name] })}
                                            disabled={!inlineActions[r.name]}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}