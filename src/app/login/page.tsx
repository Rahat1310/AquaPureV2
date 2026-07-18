import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function CustomerLoginPage() {
  async function handleSignIn(formData: FormData) {
    "use server";
    try {
      await signIn("customer-credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/dashboard",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return redirect(`/login?error=CredentialsSignin`);
      }
      throw error; // Must rethrow Next.js redirect exceptions
    }
  }

  return (
    <main className="login-container">
      <h1>Sign In to AquaPure</h1>
      <form className="login-form" action={handleSignIn}>
        <div className="field-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
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
        <button id="sign-in-btn" type="submit">
          Sign In
        </button>
      </form>
      <p className="staff-link">
        Are you staff? <a href="/staff/login">Staff Login →</a>
      </p>
    </main>
  );
}
