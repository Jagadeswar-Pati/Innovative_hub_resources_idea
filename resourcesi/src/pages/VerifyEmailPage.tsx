import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Please request a new one.");
      return;
    }
    api.auth.verifyEmail(token).then(
      () => {
        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");
      },
      (err) => {
        setStatus("error");
        setMessage(err.message || "Verification failed. Link may be expired.");
      }
    );
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-xl font-semibold">Email verified!</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Sign in
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
            </div>
            <h1 className="text-xl font-semibold">Verification failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button variant="outline" onClick={() => navigate("/auth")} className="w-full">
              Back to sign in
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
