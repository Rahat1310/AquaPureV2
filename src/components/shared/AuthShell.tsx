import Image from "next/image";
import Link from "next/link";
import { Droplets, ShieldCheck, Sparkles, Truck } from "lucide-react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const PERKS = [
  { icon: Truck, label: "Live order & delivery tracking" },
  { icon: Sparkles, label: "Saved addresses for 1-click checkout" },
  { icon: ShieldCheck, label: "Wishlist purifiers & accessories" },
];

/**
 * Premium full-screen split auth layout for Clerk — immersive water theme.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-screen w-full bg-white font-sans">
      {/* Visual / Brand Panel (Left) - Hidden on smaller screens */}
      <section className="auth-visual-panel relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        {/* Abstract Fluid Mesh Background */}
        <div aria-hidden className="absolute inset-0 z-0">
          <div className="auth-mesh-gradient absolute inset-0 opacity-90" />
          <div className="auth-visual-orb auth-visual-orb-a" />
          <div className="auth-visual-orb auth-visual-orb-b" />
          <div className="auth-visual-orb auth-visual-orb-c" />
          <div className="auth-visual-waves" />
        </div>

        <div className="relative z-10 space-y-8 max-w-xl">
          {/* Header Brand Bar */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="group inline-flex items-center rounded-2xl bg-white/10 px-5 py-3 shadow-2xl backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <Image
                src="/logo.png"
                alt="Padma Mineral Water"
                width={160}
                height={50}
                priority
                className="h-10 w-auto object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-50 backdrop-blur-md shadow-lg shadow-cyan-900/20">
              <Droplets className="size-4 fill-cyan-200 text-cyan-200" />
              Purity in every drop
            </span>
          </div>

          {/* Hero Text */}
          <div className="pt-8">
            <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
              Pure water, delivered with care to{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent drop-shadow-sm">
                every home.
              </span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-sky-100/90 font-medium max-w-md">
              One account for orders, service requests, and everything
              Padma Mineral Water.
            </p>
          </div>
        </div>

        {/* Perks / Benefits List wrapped in a glass card */}
        <div className="relative z-10 mt-12 rounded-[2rem] border border-white/20 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl shadow-blue-900/20 max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-200/90 mb-6">
            Account Highlights
          </p>
          <ul className="flex flex-col gap-4">
            {PERKS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="group flex items-center gap-4 transition-all duration-300 hover:translate-x-2"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-[14px] border border-cyan-300/40 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-100 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Icon className="size-[22px]" />
                </span>
                <span className="text-[15px] font-medium text-white/95">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Subtle footer on left panel */}
        <div className="relative z-10 mt-auto pt-8">
           <p className="text-sm font-medium text-white/60 tracking-wide">
            © {new Date().getFullYear()} Padma Mineral Water. Safe water. Safe life.
          </p>
        </div>
      </section>

      {/* Form Panel (Right / Full on Mobile) */}
      <section className="relative flex w-full flex-col justify-center bg-white lg:w-1/2 p-6 sm:p-12 xl:p-24 shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)] z-10">
        
        {/* Mobile Header Logo */}
        <div className="absolute top-6 left-6 lg:hidden">
            <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-white p-2.5 shadow-sm border border-slate-200 transition-transform active:scale-95"
            >
            <Image
                src="/logo.png"
                alt="Padma Mineral Water"
                width={140}
                height={40}
                priority
                className="h-8 w-auto object-contain"
            />
            </Link>
        </div>

        <div className="mx-auto w-full max-w-[440px]">
          <header className="mb-10 text-center lg:text-left mt-12 lg:mt-0">
            <h1 className="text-[1.8rem] sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
              {subtitle}
            </p>
          </header>

          <div className="auth-clerk-slot">{children}</div>

          {footer ? (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-[15px] text-slate-500 lg:text-left">
              {footer}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

