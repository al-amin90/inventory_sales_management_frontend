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

  const { data, isLoading } = useGetDynamicQuery({ url: "/role" });
  const roles = data?.data || [];

  const [createRole, { isLoading: creating }] = usePostDynamicMutation();
  const [updatePermission] = usePatchDynamicMutation();
  const [deleteRole, { isLoading: deleting }] = useDeleteDynamicMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRole({ url: "/role", data: { roleName } }).unwrap();
      toast.success("Role created");
      setRoleName("");
      setModalOpen(false);
    } catch (err: any) {
      console.log("err", err);
      toast.error(err?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRole({ url: `/role/${id}` }).unwrap();
      toast.success("Role deleted");
    } catch (err: any) {
      console.log("err", err);
      toast.error(err?.data?.message || "Failed");
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
        url: `/role/${roleId}/module-permission`,
        data: {
          moduleName,
          ...(field === "access"
            ? { access: value }
            : { permissions: { [field]: value } }),
        },
      }).unwrap();
    } catch (err: any) {
      console.log("err", err);
      toast.error(err?.data?.message || "Failed");
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
                          {/* Module header with On/Off radio */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-medium text-sm">
                              {moduleName}
                            </span>
                            <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-700">
                              <button
                                onClick={() =>
                                  togglePermission(
                                    role._id,
                                    moduleName,
                                    "access",
                                    true,
                                  )
                                }
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                  mod?.access
                                    ? "bg-emerald-600 text-white shadow"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                On
                              </button>
                              <button
                                onClick={() =>
                                  togglePermission(
                                    role._id,
                                    moduleName,
                                    "access",
                                    false,
                                  )
                                }
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                  !mod?.access
                                    ? "bg-red-600 text-white shadow"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                Off
                              </button>
                            </div>
                          </div>

                          {/* Permission pills */}
                          <div className="grid grid-cols-2 gap-2">
                            {PERMISSIONS.map((perm) => {
                              const isOn = mod?.permissions?.[perm] || false;
                              const disabled = !mod?.access;
                              return (
                                <div
                                  key={perm}
                                  className={`flex items-center justify-between rounded-lg px-3 py-2 border transition-all ${
                                    disabled
                                      ? "bg-slate-800/30 border-slate-800 opacity-40 cursor-not-allowed"
                                      : "bg-slate-800 border-slate-700"
                                  }`}
                                >
                                  <span className="text-slate-400 text-xs capitalize">
                                    {perm}
                                  </span>
                                  {/* On/Off radio pill */}
                                  <div
                                    className={`flex items-center gap-0.5 rounded p-0.5 ${
                                      disabled
                                        ? ""
                                        : "bg-slate-900 border border-slate-700"
                                    }`}
                                  >
                                    <button
                                      disabled={disabled}
                                      onClick={() =>
                                        !disabled &&
                                        togglePermission(
                                          role._id,
                                          moduleName,
                                          perm,
                                          true,
                                        )
                                      }
                                      className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                                        isOn && !disabled
                                          ? "bg-emerald-600 text-white"
                                          : "text-slate-500"
                                      }`}
                                    >
                                      On
                                    </button>
                                    <button
                                      disabled={disabled}
                                      onClick={() =>
                                        !disabled &&
                                        togglePermission(
                                          role._id,
                                          moduleName,
                                          perm,
                                          false,
                                        )
                                      }
                                      className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                                        !isOn && !disabled
                                          ? "bg-red-600 text-white"
                                          : "text-slate-500"
                                      }`}
                                    >
                                      Off
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
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
