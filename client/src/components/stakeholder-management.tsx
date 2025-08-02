
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, UserPlus, Trash2, Shield, Mail, Plus, X } from "lucide-react";

interface Stakeholder {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string;
  createdAt: string;
}

interface StakeholderManagementProps {
  orderId: string;
  stakeholders: Stakeholder[];
  currentUserRole?: string;
}

const stakeholderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(['admin', 'factory_owner', 'factory_manager', 'buyer', 'buyer_employee']),
  permissions: z.enum(['read', 'comment', 'update']),
});

const bulkInviteSchema = z.object({
  emailList: z.string().min(1, "Email list is required"),
  defaultRole: z.enum(['admin', 'factory_owner', 'factory_manager', 'buyer', 'buyer_employee']),
  defaultPermissions: z.enum(['read', 'comment', 'update']),
  message: z.string().optional(),
});

type StakeholderFormData = z.infer<typeof stakeholderSchema>;
type BulkInviteFormData = z.infer<typeof bulkInviteSchema>;

export default function StakeholderManagement({ orderId, stakeholders, currentUserRole }: StakeholderManagementProps) {
  const [isAddingStakeholder, setIsAddingStakeholder] = useState(false);
  const [isBulkInviting, setIsBulkInviting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isAdmin = currentUserRole === 'admin';
  
  // Debug logging
  console.log('StakeholderManagement rendered:', { orderId, currentUserRole, isAdmin, stakeholders: stakeholders?.length });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<StakeholderFormData>({
    resolver: zodResolver(stakeholderSchema),
  });

  const {
    register: registerBulk,
    handleSubmit: handleSubmitBulk,
    formState: { errors: errorsBulk },
    reset: resetBulk,
    setValue: setValueBulk,
  } = useForm<BulkInviteFormData>({
    resolver: zodResolver(bulkInviteSchema),
  });

  const addStakeholderMutation = useMutation({
    mutationFn: async (data: StakeholderFormData & { inviterName?: string }) => {
      const response = await apiRequest("POST", `/api/orders/${orderId}/stakeholders`, data);
      return response.json();
    },
    onSuccess: () => {
      reset();
      setIsAddingStakeholder(false);
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      toast({
        title: "Stakeholder Added",
        description: "Stakeholder has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add stakeholder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteStakeholderMutation = useMutation({
    mutationFn: async (stakeholderId: string) => {
      const response = await apiRequest("DELETE", `/api/stakeholders/${stakeholderId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      toast({
        title: "Stakeholder Removed",
        description: "Stakeholder has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove stakeholder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ stakeholderId, permissions }: { stakeholderId: string; permissions: string }) => {
      const response = await apiRequest("PATCH", `/api/stakeholders/${stakeholderId}/permissions`, { permissions });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      toast({
        title: "Permissions Updated",
        description: "Stakeholder permissions have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bulkInviteMutation = useMutation({
    mutationFn: async (data: BulkInviteFormData) => {
      const requestData = {
        ...data,
        inviterName: "System Admin" // This would normally come from current user context
      };
      const response = await apiRequest("POST", `/api/orders/${orderId}/stakeholders/bulk-invite`, requestData);
      return response.json();
    },
    onSuccess: (result) => {
      resetBulk();
      setIsBulkInviting(false);
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      toast({
        title: "Invitations Sent",
        description: `Successfully sent ${result.successCount} invitations and added ${result.addedCount} stakeholders.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send bulk invitations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StakeholderFormData) => {
    addStakeholderMutation.mutate({
      ...data,
      inviterName: "System Admin" // This would normally come from current user context
    });
  };

  const onSubmitBulkInvite = (data: BulkInviteFormData) => {
    bulkInviteMutation.mutate(data);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "factory_owner":
        return "bg-purple-100 text-purple-700";
      case "factory_manager":
        return "bg-blue-100 text-blue-700";
      case "buyer":
        return "bg-green-100 text-green-700";
      case "buyer_employee":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case "read":
        return "bg-slate-100 text-slate-700";
      case "comment":
        return "bg-yellow-100 text-yellow-700";
      case "update":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Stakeholders</span>
          {isAdmin && (
            <div className="ml-auto flex space-x-2">
              <Button
                onClick={() => setIsAddingStakeholder(true)}
                size="sm"
                variant="outline"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add One
              </Button>
              <Button
                onClick={() => setIsBulkInviting(true)}
                size="sm"
                variant="outline"
              >
                <Mail className="w-4 h-4 mr-2" />
                Bulk Invite
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isBulkInviting && isAdmin && (
          <div className="mb-6 p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">Bulk Invite Stakeholders</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsBulkInviting(false);
                  resetBulk();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmitBulk(onSubmitBulkInvite)} className="space-y-4">
              <div>
                <Label htmlFor="emailList">Email Addresses</Label>
                <Textarea
                  id="emailList"
                  {...registerBulk("emailList")}
                  placeholder="Enter email addresses separated by commas or new lines&#10;e.g.:&#10;john@company.com, jane@company.com&#10;mike@company.com"
                  rows={4}
                  className="w-full"
                />
                <p className="text-sm text-slate-600 mt-1">
                  Enter multiple email addresses separated by commas or new lines
                </p>
                {errorsBulk.emailList && (
                  <p className="text-sm text-red-500 mt-1">{errorsBulk.emailList.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Default Role</Label>
                  <Select onValueChange={(value) => setValueBulk("defaultRole", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="factory_owner">Factory Owner</SelectItem>
                      <SelectItem value="factory_manager">Factory Manager</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="buyer_employee">Buyer Employee</SelectItem>
                    </SelectContent>
                  </Select>
                  {errorsBulk.defaultRole && (
                    <p className="text-sm text-red-500 mt-1">{errorsBulk.defaultRole.message}</p>
                  )}
                </div>

                <div>
                  <Label>Default Permissions</Label>
                  <Select onValueChange={(value) => setValueBulk("defaultPermissions", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default permissions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="comment">Read & Comment</SelectItem>
                      <SelectItem value="update">Read, Comment & Update</SelectItem>
                    </SelectContent>
                  </Select>
                  {errorsBulk.defaultPermissions && (
                    <p className="text-sm text-red-500 mt-1">{errorsBulk.defaultPermissions.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="message">Custom Message (Optional)</Label>
                <Textarea
                  id="message"
                  {...registerBulk("message")}
                  placeholder="Add a custom message to include in the invitation email..."
                  rows={3}
                  className="w-full"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={bulkInviteMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {bulkInviteMutation.isPending ? "Sending Invites..." : "Send Invitations"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsBulkInviting(false);
                    resetBulk();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {isAddingStakeholder && isAdmin && (
          <div className="mb-6 p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">Add Individual Stakeholder</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingStakeholder(false);
                  reset();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Enter name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Role</Label>
                  <Select onValueChange={(value) => setValue("role", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="factory_owner">Factory Owner</SelectItem>
                      <SelectItem value="factory_manager">Factory Manager</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="buyer_employee">Buyer Employee</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <Label>Permissions</Label>
                  <Select onValueChange={(value) => setValue("permissions", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select permissions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="comment">Read & Comment</SelectItem>
                      <SelectItem value="update">Read, Comment & Update</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.permissions && (
                    <p className="text-sm text-red-500 mt-1">{errors.permissions.message}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={addStakeholderMutation.isPending}
                >
                  {addStakeholderMutation.isPending ? "Adding..." : "Add Stakeholder"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingStakeholder(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {stakeholders.map((stakeholder) => (
            <div key={stakeholder.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-slate-900">{stakeholder.name}</span>
                  <Badge className={getRoleColor(stakeholder.role)}>
                    {stakeholder.role.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPermissionColor(stakeholder.permissions)}>
                    <Shield className="w-3 h-3 mr-1" />
                    {stakeholder.permissions}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{stakeholder.email}</p>
              </div>

              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <Select
                    value={stakeholder.permissions}
                    onValueChange={(value) =>
                      updatePermissionsMutation.mutate({
                        stakeholderId: stakeholder.id,
                        permissions: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="comment">Comment</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteStakeholderMutation.mutate(stakeholder.id)}
                    disabled={deleteStakeholderMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {stakeholders.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p>No stakeholders added yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
