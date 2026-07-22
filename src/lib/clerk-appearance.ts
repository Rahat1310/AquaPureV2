/** Shared Clerk theme — Padma Mineral Water premium auth. */
export const clerkAppearance = {
  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    logoPlacement: "none",
    showOptionalFields: true,
  },
  variables: {
    colorPrimary: "#1b4fd1",
    colorDanger: "#e11d48",
    colorSuccess: "#059669",
    colorWarning: "#d97706",
    colorNeutral: "#334155",
    colorText: "#0f1f38",
    colorTextSecondary: "#64748b",
    colorBackground: "transparent",
    colorInputBackground: "rgba(248, 250, 252, 0.95)",
    colorInputText: "#0f1f38",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    fontSize: "0.9375rem",
  },
  elements: {
    rootBox: "!m-0 !w-full",
    cardBox: "!m-0 !w-full !shadow-none !bg-transparent",
    card: "!m-0 !w-full !gap-4.5 !border-0 !bg-transparent !p-0 !shadow-none",
    main: "!gap-4.5",
    header: "!hidden",
    headerTitle: "!hidden",
    headerSubtitle: "!hidden",
    socialButtonsBlockButton:
      "!h-11 !rounded-xl !border !border-slate-200 !bg-white !text-slate-700 !font-semibold !shadow-xs hover:!bg-slate-50/90 hover:!border-slate-300 transition-all",
    socialButtonsBlockButtonText: "!text-sm !font-semibold !text-slate-700",
    dividerLine: "!bg-slate-200",
    dividerText:
      "!text-[11px] !font-bold !uppercase !tracking-wider !text-slate-400 !bg-white !px-3",
    formFieldLabel: "!text-[13px] !font-semibold !text-slate-700 !mb-1.5",
    formFieldInput:
      "!h-11 !rounded-xl !border !border-slate-200 !bg-slate-50/80 !text-slate-900 placeholder:!text-slate-400 focus:!bg-white focus:!border-primary focus:!ring-4 focus:!ring-primary/10 transition-all !text-sm !px-3.5",
    formButtonPrimary:
      "!h-11 !rounded-xl !bg-gradient-to-r !from-blue-600 !via-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !text-sm !font-semibold !normal-case !tracking-normal !text-white !shadow-md !shadow-blue-600/25 active:!scale-[0.99] transition-all",
    footer: "!border-t-0 !bg-transparent !pt-3 !mt-1",
    footerActionText: "!text-xs !text-slate-500",
    footerActionLink: "!text-xs !font-semibold !text-primary hover:!underline",
    identityPreviewEditButton: "!text-primary",
    formFieldSuccessText: "!text-xs !text-emerald-600",
    formFieldErrorText: "!text-xs !text-rose-600",
    badge: "!hidden",
    logoBox: "!hidden",
    logoImage: "!hidden",
  },
};

