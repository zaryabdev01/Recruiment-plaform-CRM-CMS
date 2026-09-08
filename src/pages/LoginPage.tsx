import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Headset, Handshake, PanelsTopLeft } from "lucide-react";
import { authApi, isChallenge } from "@/lib/auth-api";
import { setToken, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
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
  const { setUser, enterDemoMode } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const afterLogin = async (accessToken: string) => {
    setToken(accessToken);
    const me = await authApi.me();
    if (me.data.system_role !== "SUPERADMIN") {
      toast.error("This tool is SUPERADMIN-only. Logged in as a lower role.");
    }
    setUser(me.data);
    navigate("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (isChallenge(res.data)) {
        setChallengeToken(res.data.challenge_token);
      } else {
        await afterLogin(res.data.access_token);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeToken) return;
    setLoading(true);
    try {
      const res = await authApi.verify2fa(challengeToken, code);
      await afterLogin(res.data.access_token);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
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
            {!challengeToken ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Sign in</h2>
                  <p className="text-sm text-gray-500">Use your SUPERADMIN account for the CMS.</p>
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@recruitment.local"
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
                <div className="relative py-1 text-center">
                  <span className="relative z-10 bg-white px-2 text-xs text-gray-400">or</span>
                  <span className="absolute inset-x-0 top-1/2 h-px bg-gray-200" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    enterDemoMode();
                    navigate("/");
                  }}
                >
                  Explore in demo mode
                </Button>
                <p className="text-center text-xs text-gray-400">
                  No backend needed — the CRM &amp; Recruiter-portal screens run on sample data.
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerify2fa} className="space-y-4">
                <p className="text-sm text-gray-600">Enter the 6-digit code from your authenticator app.</p>
                <Input
                  label="2FA code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  autoFocus
                  required
                />
                <Button type="submit" className="w-full" loading={loading}>
                  Verify
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
