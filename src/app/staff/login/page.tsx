import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function StaffLoginPage() {
  async function handleSignIn(formData: FormData) {
    "use server";
    try {
      await signIn("staff-credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/admin",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return redirect(`/staff/login?error=CredentialsSignin`);
      }
      throw error; // Must rethrow Next.js redirect exceptions
    }
  }

  return (
    <main className="login-container">
      <h1>AquaPure Staff Portal</h1>
      <p className="staff-badge">Staff Access Only</p>
      <form className="login-form" action={handleSignIn}>
        <div className="field-group">
          <label htmlFor="email">Staff Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="staff@aquapure.com.bd"
          />
        </div>
        <div className="field-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
        </div>
        <button id="staff-sign-in-btn" type="submit">
          Sign In to Portal
        </button>
      </form>
      <p className="customer-link">
        Customer? <a href="/login">Customer Login →</a>
      </p>
    </main>
  );
}
