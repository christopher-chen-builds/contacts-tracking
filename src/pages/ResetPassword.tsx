import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "You can now log in with your new password." });
      navigate("/");
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Invalid or expired reset link.</p>
          <button onClick={() => navigate("/")} className="text-primary mt-4 hover:underline text-sm">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-display text-3xl text-foreground text-center mb-2">Reset Password</h1>
        <p className="text-muted-foreground text-sm text-center mb-8">Enter your new password below.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} />
          <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} className={inputClass} />
          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-2xl shadow-[0_0_20px_hsl(var(--primary)/0.3)] disabled:opacity-50 transition-all mt-2">
            {loading ? "Updating..." : "Update Password"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
