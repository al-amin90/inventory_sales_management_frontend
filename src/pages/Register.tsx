import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Boxes, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  useGetDynamicQuery,
  usePostDynamicMutation,
} from "@/redux/features/dynamic/dynamicApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Register = () => {
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const navigate = useNavigate();

  const { data: roleData, isLoading: rolesLoading } = useGetDynamicQuery({
    url: "/role",
  });
  const roles = roleData?.data || [];

  const [register, { isLoading }] = usePostDynamicMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) return toast.error("Please select a role");
    try {
      await register({ url: "/auth/register", data: form }).unwrap();
      toast.success("Account created! Please login.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center mb-3">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-slate-400 text-sm mt-1">Join the ERP System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">
                Name <span className="text-slate-500 text-xs">(optional)</span>
              </Label>
              <Input
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Email *</Label>
              <Input
                type="email"
                placeholder="user@erp.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Password *</Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  minLength={6}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Role *</Label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
                disabled={rolesLoading}
                className="w-full h-9 px-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:border-violet-500 outline-none disabled:opacity-50"
              >
                <option value="">
                  {rolesLoading ? "Loading roles..." : "Select a role"}
                </option>
                {roles.map((r: any) => (
                  <option key={r._id} value={r._id}>
                    {r.roleName}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating
                  account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-400 hover:text-violet-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
