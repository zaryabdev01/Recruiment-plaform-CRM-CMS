import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Headset, Handshake, PanelsTopLeft } from "lucide-react";
import { useAuth, PROTOTYPE_CREDENTIALS } from "@/lib/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GridPattern, BlobArt } from "@/components/ui/Decor";
import toast from "react-hot-toast";

const PANELS = [
  { icon: Headset, label: "CRM", copy: "Support desk for every recruiter and candidate", cls: "bg-blue-500/20 text-blue-100" },
  { icon: Handshake, label: "Recruiter portal", copy: "An agency's relationships, team and jobs", cls: "bg-emerald-500/20 text-emerald-100" },
  { icon: PanelsTopLeft, label: "CMS", copy: "Marketing site content and media", cls: "bg-violet-500/20 text-violet-100" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(PROTOTYPE_CREDENTIALS.email);
  const [password, setPassword] = useState(PROTOTYPE_CREDENTIALS.password);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <GridPattern className="text-white/10" />
        <BlobArt className="-right-10 -top-16 h-80 w-80 text-white" />
        <div className="relative">
          <div className="text-sm font-semibold tracking-wide text-white/70">RECRUITMENT PLATFORM</div>
          <h1 className="mt-2 text-3xl font-bold">Internal Console</h1>
          <p className="mt-2 max-w-sm text-sm text-white/70">
            One sign-in for the three tools the internal team uses to run the platform.
          </p>
        </div>
        <div className="relative space-y-3">
          {PANELS.map((p) => (
            <div key={p.label} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 backdrop-blur-sm">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${p.cls}`}>
                <p.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-semibold">{p.label}</div>
                <div className="text-xs text-white/60">{p.copy}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <h1 className="text-xl font-bold text-gray-900">Internal Console</h1>
            <p className="mt-1 text-sm text-gray-500">CMS · CRM · Recruiter portal</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sign in</h2>
                <p className="text-sm text-gray-500">One account for the whole console.</p>
              </div>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" loading={loading}>
                Sign in
              </Button>
            </form>

            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
              <span className="font-medium text-gray-700">Prototype access</span> — pre-filled above.
              <div className="mt-1 font-mono text-gray-600">
                {PROTOTYPE_CREDENTIALS.email} · {PROTOTYPE_CREDENTIALS.password}
              </div>
              <p className="mt-1">Sample data, resets on refresh. No real backend.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
