import { useState } from "react";
import { toast } from "sonner";
import { Plus, Shield, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  useGetDynamicQuery,
  usePostDynamicMutation,
  usePatchDynamicMutation,
  useDeleteDynamicMutation,
} from "@/redux/features/dynamic/dynamicApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { AppModal } from "@/components/shared/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const MODULES = ["Dashboard", "Role", "Product", "Sale"] as const;
const PERMISSIONS = ["view", "add", "edit", "delete"] as const;

const Roles = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useGetDynamicQuery({ url: "/roles" });
  const roles = data?.data || [];

  const [createRole, { isLoading: creating }] = usePostDynamicMutation();
  const [updatePermission] = usePatchDynamicMutation();
  const [deleteRole, { isLoading: deleting }] = useDeleteDynamicMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRole({ url: "/roles", data: { roleName } }).unwrap();
      toast.success("Role created");
      setRoleName("");
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRole({ url: `/roles/${id}` }).unwrap();
      toast.success("Role deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const togglePermission = async (
    roleId: string,
    moduleName: string,
    field: string,
    value: boolean,
  ) => {
    try {
      await updatePermission({
        url: `/roles/${roleId}/module-permission`,
        data: {
          moduleName,
          ...(field === "access"
            ? { access: value }
            : { permissions: { [field]: value } }),
        },
      }).unwrap();
    } catch {
      toast.error("Update failed");
    }
  };

  const getModulePermissions = (role: any, moduleName: string) => {
    return role.modules?.find((m: any) => m.moduleName === moduleName) || null;
  };

  return (
    <div>
      <PageHeader
        title="Role Management"
        subtitle="Control access and permissions per role"
        action={
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <Plus className="w-4 h-4" /> New Role
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-slate-900 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role: any) => (
            <div
              key={role._id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              {/* Role Header */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 rounded-lg bg-violet-600/20 border border-violet-600/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{role.roleName}</p>
                  <p className="text-slate-500 text-xs">
                    {role.modules?.length || 0} modules configured
                  </p>
                </div>
                <button
                  onClick={() =>
                    setExpanded(expanded === role._id ? null : role._id)
                  }
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  {expanded === role._id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(role._id)}
                  disabled={deleting}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Permissions Grid */}
              {expanded === role._id && (
                <div className="border-t border-slate-800 px-5 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MODULES.map((moduleName) => {
                      const mod = getModulePermissions(role, moduleName);
                      return (
                        <div
                          key={moduleName}
                          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-medium text-sm">
                              {moduleName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">
                                Access
                              </span>
                              <Switch
                                checked={mod?.access || false}
                                onCheckedChange={(v) =>
                                  togglePermission(
                                    role._id,
                                    moduleName,
                                    "access",
                                    v,
                                  )
                                }
                                className="data-[state=checked]:bg-violet-600"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {PERMISSIONS.map((perm) => (
                              <div
                                key={perm}
                                className="flex items-center justify-between bg-slate-800 rounded px-3 py-1.5"
                              >
                                <span className="text-slate-400 text-xs capitalize">
                                  {perm}
                                </span>
                                <Switch
                                  checked={mod?.permissions?.[perm] || false}
                                  disabled={!mod?.access}
                                  onCheckedChange={(v) =>
                                    togglePermission(
                                      role._id,
                                      moduleName,
                                      perm,
                                      v,
                                    )
                                  }
                                  className="data-[state=checked]:bg-emerald-600 scale-75"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Role"
        size="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Role Name *</Label>
            <Input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Supervisor"
              required
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="border-slate-700 bg-transparent text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </AppModal>
    </div>
  );
};

export default Roles;
