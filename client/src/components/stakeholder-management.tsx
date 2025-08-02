
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, UserPlus, Trash2, Shield } from "lucide-react";

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

type StakeholderFormData = z.infer<typeof stakeholderSchema>;

export default function StakeholderManagement({ orderId, stakeholders, currentUserRole }: StakeholderManagementProps) {
  const [isAddingStakeholder, setIsAddingStakeholder] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isAdmin = currentUserRole === 'admin';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<StakeholderFormData>({
    resolver: zodResolver(stakeholderSchema),
  });

  const addStakeholderMutation = useMutation({
    mutationFn: async (data: StakeholderFormData) => {
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

  const onSubmit = (data: StakeholderFormData) => {
    addStakeholderMutation.mutate(data);
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
            <Button
              onClick={() => setIsAddingStakeholder(true)}
              size="sm"
              variant="outline"
              className="ml-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Stakeholder
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAddingStakeholder && isAdmin && (
          <div className="mb-6 p-4 border rounded-lg bg-slate-50">
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
