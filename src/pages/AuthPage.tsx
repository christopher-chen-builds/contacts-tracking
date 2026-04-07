import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const inputClass =
    "w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ease-snap";

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a password reset link." });
      setForgotMode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created", description: "Check your email to confirm, or log in now." });
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-display text-3xl text-foreground text-center mb-2">
          Contacts Directory
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-8">
          {forgotMode ? "Enter your email to reset." : isLogin ? "Welcome back." : "Create your account."}
        </p>

        {forgotMode ? (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-2xl shadow-[0_0_20px_hsl(var(--primary)/0.3)] disabled:opacity-50 transition-all ease-snap duration-100 mt-2">
              {loading ? "Please wait..." : "Send Reset Link"}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} />
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-2xl shadow-[0_0_20px_hsl(var(--primary)/0.3)] disabled:opacity-50 transition-all ease-snap duration-100 mt-2">
              {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
            </motion.button>
          </form>
        )}

        {!forgotMode && isLogin && (
          <button onClick={() => setForgotMode(true)} className="w-full text-center mt-4 text-xs text-muted-foreground hover:text-primary transition-colors">
            Forgot password?
          </button>
        )}

        <button
          onClick={() => { setIsLogin(!isLogin); setForgotMode(false); }}
          className="w-full text-center mt-4 text-sm text-primary hover:underline"
        >
          {forgotMode ? "Back to Login" : isLogin ? "Create Account" : "Already have an account? Login"}
        </button>
      </motion.div>
    </div>
  );
};

export default AuthPage;
