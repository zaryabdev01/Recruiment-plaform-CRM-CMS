import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { authApi, isChallenge } from "@/lib/auth-api";
import { setToken, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

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
    navigate("/pages");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white mb-3">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">CMS prototype</h1>
          <p className="text-sm text-gray-500 mt-1">SUPERADMIN sign-in</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {!challengeToken ? (
            <form onSubmit={handleLogin} className="space-y-4">
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
              <Button type="submit" className="w-full" loading={loading}>Sign in</Button>
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
              <Button type="submit" className="w-full" loading={loading}>Verify</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
