import { useState, useEffect } from "react";
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
import ToggleSwitch from "@/components/reuseble/ToggleSwitch";

const MODULES = ["Dashboard", "Role", "Product", "Sale"] as const;

const Roles = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [expanded, setExpanded] = useState<string | null>("all");

  const { data, isLoading, refetch } = useGetDynamicQuery({ url: "/role" });
  const roles = data?.data || [];

  const [createRole, { isLoading: creating }] = usePostDynamicMutation();
  const [updatePermission] = usePatchDynamicMutation();
  const [deleteRole, { isLoading: deleting }] = useDeleteDynamicMutation();

  useEffect(() => {
    if (roles.length > 0 && expanded === "all") {
    }
  }, [roles]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRole({ url: "/role", data: { roleName } }).unwrap();
      toast.success("Role created successfully");
      setRoleName("");
      setModalOpen(false);
      refetch();
    } catch (err: any) {
      console.log("err", err);
      toast.error(err?.data?.message || "Failed to create role");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await deleteRole({ url: `/role/${id}` }).unwrap();
      toast.success("Role deleted successfully");
      refetch();
    } catch (err: any) {
      console.log("err", err);
      toast.error(err?.data?.message || "Failed to delete role");
    }
  };

  const togglePermission = async (
    roleId: string,
    moduleName: string,
    field: string,
    value: boolean,
  ) => {
    try {
      if (field === "access") {
        await updatePermission({
          url: `/role/${roleId}/module-permission`,
          data: {
            moduleName,
            access: value,
          },
        }).unwrap();
      } else {
        await updatePermission({
          url: `/role/${roleId}/module-permission`,
          data: {
            moduleName,
            permissions: { [field]: value },
          },
        }).unwrap();
      }
      toast.success(`Permission updated`);
      refetch();
    } catch (err: any) {
      console.log("err", err);
      toast.error(err?.data?.message || "Failed to update permission");
    }
  };

  const getModulePermissions = (role: any, moduleName: string) => {
    return role.modules?.find((m: any) => m.moduleName === moduleName) || null;
  };

  // ✅ NEW: Toggle expansion for a specific role
  const toggleExpand = (roleId: string) => {
    if (expanded === "all") {
      // If all are expanded, collapse this one and set to specific
      setExpanded(roleId);
    } else if (expanded === roleId) {
      // If this one is expanded, collapse it
      setExpanded(null);
    } else {
      // Expand this one
      setExpanded(roleId);
    }
  };

  // ✅ NEW: Check if a role should be expanded
  const isExpanded = (roleId: string) => {
    return expanded === "all" || expanded === roleId;
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
                  // ✅ CHANGE: Use the new toggle function
                  onClick={() => toggleExpand(role._id)}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  {/* ✅ CHANGE: Use the new isExpanded function */}
                  {isExpanded(role._id) ? (
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
              {isExpanded(role._id) && (
                <div className="border-t border-slate-800 px-5 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MODULES.map((moduleName) => {
                      const mod = getModulePermissions(role, moduleName);
                      const permissionKeys = Object.keys(
                        mod?.permissions || {},
                      );

                      return (
                        <div
                          key={moduleName}
                          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                        >
                          {/* Module header with Access Toggle Switch */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium text-sm">
                                {moduleName}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  mod?.access
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-slate-700/50 text-slate-400"
                                }`}
                              >
                                {mod?.access ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <ToggleSwitch
                              checked={mod?.access || false}
                              onChange={(checked) =>
                                togglePermission(
                                  role._id,
                                  moduleName,
                                  "access",
                                  checked,
                                )
                              }
                              disabled={false}
                              size="md"
                            />
                          </div>

                          {/* Permission pills with Toggle Switches */}
                          <div className="gap-3 grid grid-cols-2">
                            {permissionKeys.length > 0 ? (
                              permissionKeys.map((permKey) => {
                                const isOn =
                                  mod?.permissions?.[permKey] || false;
                                const isDisabled = !mod?.access;

                                return (
                                  <div
                                    key={permKey}
                                    className={`flex items-center justify-between rounded-lg px-3 py-1.5 border transition-all ${
                                      isDisabled
                                        ? "bg-slate-800/30 border-slate-800 opacity-40 cursor-not-allowed"
                                        : "bg-slate-800 border-slate-700 hover:border-slate-600"
                                    }`}
                                  >
                                    <span className="text-slate-400 text-xs capitalize font-medium">
                                      {permKey}
                                    </span>

                                    {/* Toggle Switch for Permission */}
                                    <ToggleSwitch
                                      checked={mod?.access || false}
                                      onChange={(checked) =>
                                        togglePermission(
                                          role._id,
                                          moduleName,
                                          "access",
                                          checked,
                                        )
                                      }
                                      disabled={false}
                                      size="md"
                                    />
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center text-slate-500 text-xs py-2">
                                No permissions available
                              </div>
                            )}
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

      {/* Create Modal  */}
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Role"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          {/* Role Name Input with Icon */}
          <div className="space-y-2">
            <Label className="text-slate-200 text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              Role Name <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter role name (e.g. Supervisor, Manager)"
                required
                className="h-12 pl-4 pr-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 text-base rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                autoFocus
              />
              {roleName && (
                <button
                  type="button"
                  onClick={() => setRoleName("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <span className="sr-only">Clear</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Choose a unique name for this role. This will be used to identify
              the role across the system.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setRoleName("");
              }}
              className="border-slate-600/50 bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white hover:border-slate-500 px-6 py-2.5 h-11 rounded-xl transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !roleName.trim()}
              className={`bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold px-8 py-2.5 h-11 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 ${
                !roleName.trim()
                  ? "opacity-50 cursor-not-allowed hover:scale-100"
                  : "hover:scale-105"
              }`}
            >
              {creating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Create Role
                </>
              )}
            </Button>
          </div>
        </form>
      </AppModal>
    </div>
  );
};

export default Roles;
