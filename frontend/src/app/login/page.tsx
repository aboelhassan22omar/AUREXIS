import LoginForm from "@/components/auth/LoginForm";
import Navbar from "@/components/layout/Navbar";
import Logo from "@/components/ui/Logo";

export default function LoginPage() {
  return (
    <>
      <Navbar />

      <main className="auth-shell">
        <div className="axion-container">
          <div className="auth-card glass-card" style={{ margin: "auto" }}>
            <Logo size={42} />

            <h1>Welcome back.</h1>

            <p>
              Sign in to access your AXION workspace.
            </p>

            <LoginForm />
          </div>
        </div>
      </main>
    </>
  );
}