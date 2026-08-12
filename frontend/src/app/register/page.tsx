import RegisterForm from "@/components/auth/RegisterForm";
import Navbar from "@/components/layout/Navbar";
import Logo from "@/components/ui/Logo";

export default function RegisterPage() {
  return (
    <>
      <Navbar />

      <main className="auth-shell">
        <div className="axion-container">
          <div className="auth-card glass-card" style={{ margin: "auto" }}>
            <Logo size={42} />

            <h1>Join AXION.</h1>

            <p>
              Create your workspace to manage projects and AXION services.
            </p>

            <RegisterForm />
          </div>
        </div>
      </main>
    </>
  );
}