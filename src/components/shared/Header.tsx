"use client";

import Link from "next/link";
import Image from "next/image";
import { SignOutButton, useAuth } from "@clerk/nextjs";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import type { Variants } from "framer-motion";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { buttonVariants } from "@/components/ui/button";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { useCart } from "@/features/cart/CartContext";
import { cn } from "@/lib/utils";

type NavLeaf = { label: string; href: string; featured?: boolean };

type NavGroup = {
  label: string;
  href: string;
  featured?: boolean;
  children?: NavLeaf[];
};

type NavItem = {
  label: string;
  href: string;
  groups?: NavGroup[];
  /** Emphasized nav link (e.g. All Products) */
  highlight?: boolean;
};

/**
 * Client IA — WATER MAN cascading dropdown:
 * top nav → vertical L2 panel → L3 flyout to the right (chevron items).
 */
const navItems: NavItem[] = [
  {
    label: "Family",
    href: "/products?segment=family",
    groups: [
      { label: "All Family Products", href: "/products?segment=family", featured: true },
      { label: "Economy Purifier", href: "/category/economy-purifier" },
      { label: "RO Purifier", href: "/category/ro-purifier" },
      { label: "UV", href: "/category/uv" },
      { label: "RO + UV + UF", href: "/category/ro-uv-uf" },
      { label: "Water Dispenser", href: "/category/water-dispenser" },
      { label: "Hot & Cold Purifier", href: "/category/hot-and-cold" },
      { label: "Iron Remover / Housing", href: "/category/iron-removal" },
    ],
  },
  {
    label: "Mother & Child",
    href: "/products?segment=mother",
    groups: [
      { label: "All Mother & Child", href: "/products?segment=mother", featured: true },
      { label: "RO UV Alkaline", href: "/category/ro-uv-alkaline" },
      { label: "Formalin Removal", href: "/category/formalin-removal" },
      { label: "Shower Filter", href: "/category/shower-filter" },
      { label: "Air Purifier", href: "/category/air-purifier" },
    ],
  },
  {
    label: "Accessories",
    href: "/accessories",
    groups: [
      {
        label: "All Accessories",
        href: "/accessories",
        featured: true,
      },
      {
        label: "Family Accessories",
        href: "/accessories?segment=family",
      },
      {
        label: "Office Accessories",
        href: "/accessories?segment=office",
      },
      {
        label: "Water Purifier Accessories",
        href: "/accessories?segment=family",
        children: [
          { label: "P.P Filter", href: "/category/pp-filter" },
          { label: "Membrane", href: "/category/membrane" },
          { label: "Alkaline", href: "/category/alkaline-cartridge" },
          { label: "Mineral", href: "/category/mineral-cartridge" },
          { label: "Motor / Adaptor", href: "/category/adapter" },
          { label: "UV Lamp", href: "/category/uv-lamp" },
        ],
      },
      {
        label: "Mother & Child",
        href: "/category/formalin-cartridge",
        children: [
          { label: "Alkaline Cartridge", href: "/category/alkaline-cartridge" },
          { label: "Formalin Filter", href: "/category/formalin-cartridge" },
          { label: "Shower Filter Cartridge", href: "/category/shower-cartridge" },
          { label: "Air Purifier Filter", href: "/category/air-purifier-filter" },
          { label: "Baby Nano Filter", href: "/category/baby-nano-filter" },
        ],
      },
      {
        label: "Installation",
        href: "/accessories?segment=family",
        children: [
          {
            label: "Meter",
            href: "/category/tds-meter",
            featured: true,
          },
          { label: "Tap", href: "/category/tap" },
          { label: "Fittings", href: "/category/fittings" },
        ],
      },
    ],
  },
  {
    label: "Office / Commercial",
    href: "/products?segment=office",
    groups: [
      {
        label: "All Office Products",
        href: "/products?segment=office",
        featured: true,
      },
      {
        label: "Commercial Solutions",
        href: "/commercial-solutions",
        children: [
          { label: "Request Quote", href: "/commercial-solutions" },
          { label: "Commercial RO", href: "/category/commercial-ro" },
          { label: "Industrial RO", href: "/category/industrial-ro" },
        ],
      },
      {
        label: "Commercial Accessories",
        href: "/accessories?segment=office",
        children: [
          { label: "Water Dispenser", href: "/category/water-dispenser" },
          { label: "Membrane", href: "/category/membrane" },
          { label: "Fittings", href: "/category/fittings" },
        ],
      },
    ],
  },
  {
    label: "Brand",
    href: "/brands",
    groups: [
      { label: "Vision", href: "/brands?brand=Vision" },
      { label: "Kent", href: "/brands?brand=Kent" },
      { label: "Livpure", href: "/brands?brand=Livpure" },
      { label: "Pureit", href: "/brands?brand=Pureit" },
      { label: "AO Smith", href: "/brands?brand=AO%20Smith" },
    ],
  },
  {
    label: "Countries",
    href: "/brands",
    groups: [
      { label: "Bangladesh", href: "/brands?country=Bangladesh" },
      { label: "India", href: "/brands?country=India" },
      { label: "China", href: "/brands?country=China" },
      { label: "Korea", href: "/brands?country=Korea" },
      { label: "USA", href: "/brands?country=USA" },
    ],
  },
  { label: "Contact Us", href: "/contact" },
  {
    label: "All Products",
    href: "/products",
    highlight: true,
  },
];

const marqueeMessages: React.ReactNode[] = [
  <>
    🎉 নতুন সংযোজন:{" "}
    <span className="rounded-full bg-white/15 px-2 py-0.5 font-extrabold text-white ring-1 ring-white/40">
      ডিজিটাল TDS মিটার
    </span>{" "}
    — সহজে পানির TDS মাত্রা পরীক্ষা করুন
  </>,
  <> এখন বিশেষ কম দামে</>,
  <> সীমিত স্টক — আজই অর্ডার করুন</>,
];

const panelVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.14,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -2,
    transition: { duration: 0.1, ease: "easeIn" as const },
  },
};

const flyoutVariants: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.14,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    x: -4,
    transition: { duration: 0.1, ease: "easeIn" as const },
  },
};

function BrandLogo() {
  return (
    <Link
      href="/"
      className="group relative z-20 shrink-0"
      aria-label="Padma Mineral Water home"
    >
      <Image
        src="/logo.png"
        alt="Padma Mineral Water"
        width={160}
        height={160}
        priority
        className="size-14 sm:size-18 object-contain transition group-hover:opacity-90"
      />
    </Link>
  );
}

/** WATER MAN–style L2 panel + optional L3 flyout to the right. */
function CascadingDropdown({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) {
  const groups = item.groups ?? [];
  // L3 stays closed until the user hovers a specific L2 row
  const [flyout, setFlyout] = useState<string | null>(null);
  const activeGroup = groups.find((g) => g.label === flyout && g.children?.length);

  function rowClass(isActive: boolean) {
    return cn(
      "flex w-full items-center justify-between gap-3 whitespace-nowrap px-4 py-[11px] text-left text-[13px] font-medium transition-colors",
      isActive
        ? "bg-[#123a9b] text-white"
        : "bg-white text-slate-700 hover:bg-[#123a9b] hover:text-white",
    );
  }

  return (
    <div className="absolute left-0 top-full z-[60]">
      <div className="relative flex items-stretch">
        <ul
          className="min-w-[270px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,40,90,0.16)]"
          role="menu"
        >
          {groups.map((group) => {
            const hasChildren = Boolean(group.children?.length);
            const isActive = flyout === group.label && hasChildren;

            if (hasChildren) {
              return (
                <li
                  key={group.label}
                  role="none"
                  onMouseEnter={() => setFlyout(group.label)}
                >
                  <Link
                    href={group.href}
                    role="menuitem"
                    className={rowClass(isActive)}
                    onClick={onClose}
                    aria-expanded={isActive}
                    aria-haspopup="true"
                  >
                    <span>{group.label}</span>
                    <ChevronRight className="size-3.5 shrink-0 opacity-90" />
                  </Link>
                </li>
              );
            }

            return (
              <li key={group.label} role="none">
                <Link
                  href={group.href}
                  role="menuitem"
                  className={cn(
                    rowClass(false),
                    group.featured && "bg-sky-50/80 text-slate-900",
                  )}
                  onMouseEnter={() => setFlyout(null)}
                  onClick={onClose}
                >
                  <span className="flex items-center gap-2">
                    {group.label}
                    {group.featured && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                        Featured
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <AnimatePresence>
          {activeGroup?.children && (
            <motion.ul
              key={activeGroup.label}
              variants={flyoutVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-full top-0 z-[61] min-w-[250px] border border-slate-200 border-l-0 bg-white shadow-[0_10px_28px_rgba(15,40,90,0.16)]"
              role="menu"
              onMouseEnter={() => setFlyout(activeGroup.label)}
            >
              {activeGroup.children.map((child) => (
                <li key={child.label} role="none">
                  <Link
                    href={child.href}
                    role="menuitem"
                    className={cn(
                      "flex items-center justify-between gap-3 whitespace-nowrap px-4 py-[11px] text-[13px] font-medium transition-colors hover:bg-[#123a9b] hover:text-white",
                      child.featured
                        ? "bg-sky-50/80 text-slate-900"
                        : "text-slate-700",
                    )}
                    onClick={onClose}
                  >
                    <span>{child.label}</span>
                    {child.featured && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary group-hover:bg-white/20">
                        Featured
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Header() {
  const { isSignedIn } = useAuth();
  const { totalQty, openDrawer } = useCart();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const [mobileFlyout, setMobileFlyout] = useState<string | null>(null);

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleNavEnter(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    hoverTimer.current = setTimeout(() => setActiveMenu(label), 80);
  }

  function handleNavLeave() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    closeTimer.current = setTimeout(() => setActiveMenu(null), 140);
  }

  function handleDropdownEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function handleDropdownLeave() {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 140);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="bg-[#123a9b] text-white">
          <div className="section-shell flex min-h-14 items-center gap-4 py-2.5 text-[12px] font-medium sm:min-h-16">
            {/* Left — scrolling announcements */}
            <div className="topbar-marquee min-w-0 flex-1">
              <div className="topbar-marquee-track">
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    className="flex shrink-0 items-center gap-3 pr-3"
                    aria-hidden={copy === 1}
                  >
                    {marqueeMessages.map((msg, i) => (
                      <span
                        key={`${copy}-${i}`}
                        className="inline-flex items-center gap-3 whitespace-nowrap text-sky-50/95"
                      >
                        {i > 0 && (
                          <span className="size-1 shrink-0 rounded-full bg-sky-300/70" />
                        )}
                        <span className="font-semibold tracking-wide">{msg}</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — account + contacts */}
            <div className="flex shrink-0 items-center gap-3 border-l border-white/20 pl-3 sm:gap-4 sm:pl-4">
              {!isSignedIn ? (
                <>
                  <Link
                    href="/sign-in"
                    className="flex items-center gap-1.5 transition hover:text-sky-200"
                  >
                    <UserRound className="size-3.5" />
                    <span className="hidden sm:inline">Sign in</span>
                  </Link>
                  <Link
                    href="/sign-up"
                    className="hidden items-center gap-1.5 transition hover:text-sky-200 sm:flex"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/account"
                    className="flex items-center gap-1.5 transition hover:text-sky-200"
                  >
                    <UserRound className="size-3.5" />
                    <span className="hidden sm:inline">My Account</span>
                  </Link>
                  <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 transition hover:text-sky-200"
                    >
                      <LogOut className="size-3.5" />
                      <span className="hidden sm:inline">Log out</span>
                    </button>
                  </SignOutButton>
                </>
              )}
              <span className="hidden h-3.5 w-px bg-white/25 sm:block" aria-hidden />
              <a
                href="tel:+8801700000000"
                className="flex items-center gap-1.5 transition hover:text-sky-200"
                aria-label="Call us"
              >
                <Phone className="size-3.5" />
                <span className="hidden md:inline">+880 1700-000000</span>
              </a>
              <a
                href="https://wa.me/8801700000000"
                className="flex items-center gap-1.5 transition hover:text-sky-200"
                aria-label="WhatsApp"
              >
                <MessageCircle className="size-3.5" />
                <span className="hidden lg:inline">WhatsApp</span>
              </a>
              <Link
                href="/contact"
                className="hidden items-center gap-1.5 transition hover:text-sky-200 sm:flex"
              >
                <Mail className="size-3.5" />
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* overflow-visible so L3 flyouts are not clipped */}
        <div className="relative overflow-visible">
          <div className="section-shell grid min-h-[72px] py-2 grid-cols-[auto_1fr_auto] items-center gap-3 overflow-visible">
            <BrandLogo />

            <nav
              className="hidden h-full items-center justify-center gap-0.5 overflow-visible lg:flex"
              aria-label="Main navigation"
            >
              {navItems.map((item) =>
                item.groups ? (
                  <div
                    key={item.label}
                    className="relative h-full"
                    onMouseEnter={() => handleNavEnter(item.label)}
                    onMouseLeave={handleNavLeave}
                  >
                    <div
                      className={cn(
                        "flex h-full items-center gap-0.5 whitespace-nowrap px-2 text-[13px] font-semibold transition xl:px-2.5",
                        activeMenu === item.label
                          ? "text-[#3b82f6]"
                          : "text-slate-700 hover:text-[#3b82f6]",
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex h-full items-center"
                        onClick={() => setActiveMenu(null)}
                      >
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        className="flex h-full items-center pl-0.5"
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === item.label ? null : item.label,
                          )
                        }
                        aria-label={`${item.label} menu`}
                        aria-expanded={activeMenu === item.label}
                        aria-haspopup="true"
                      >
                        <ChevronDown
                          className={cn(
                            "size-3.5 text-slate-400 transition-transform",
                            activeMenu === item.label &&
                              "rotate-180 text-[#3b82f6]",
                          )}
                        />
                      </button>
                    </div>

                    <AnimatePresence>
                      {activeMenu === item.label && (
                        <motion.div
                          key={item.label}
                          variants={panelVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="overflow-visible"
                          onMouseEnter={handleDropdownEnter}
                          onMouseLeave={handleDropdownLeave}
                        >
                          <CascadingDropdown
                            item={item}
                            onClose={() => setActiveMenu(null)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : item.highlight ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="ml-1 inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full bg-primary/10 px-3 text-[12px] font-extrabold tracking-wide text-primary transition hover:bg-primary hover:text-white xl:ml-1.5 xl:px-3.5"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex h-full items-center whitespace-nowrap px-2 text-[13px] font-semibold text-slate-700 transition hover:text-[#3b82f6] xl:px-2.5"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="flex items-center justify-end gap-1">
              <Link
                href="/account/wishlist"
                className="hidden size-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-primary sm:grid"
                aria-label="Wishlist"
              >
                <Heart className="size-[18px]" />
              </Link>
              <button
                type="button"
                onClick={openDrawer}
                className="relative grid size-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-primary"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="size-[18px]" />
                {totalQty > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-white">
                    {totalQty > 99 ? "99+" : totalQty}
                  </span>
                )}
              </button>
              <Link
                href="/commercial-solutions"
                className={cn(buttonVariants({ size: "sm" }), "ml-1 hidden md:inline-flex")}
              >
                Request Quote
              </Link>
              <button
                type="button"
                className="ml-1 grid size-10 place-items-center rounded-xl border border-border lg:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile accordion */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden border-t border-slate-200 bg-white shadow-xl lg:hidden"
            >
              <nav
                className="max-h-[calc(100vh-110px)] overflow-y-auto px-4 py-3"
                aria-label="Mobile navigation"
              >
                {navItems.map((item) => (
                  <div key={item.label} className="border-b border-slate-100">
                    {item.groups ? (
                      <>
                        <div className="flex w-full items-center justify-between py-3.5">
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="text-sm font-semibold text-slate-800"
                          >
                            {item.label}
                          </Link>
                          <button
                            type="button"
                            className="grid size-8 place-items-center rounded-lg text-primary"
                            onClick={() => {
                              setMobileActiveMenu(
                                mobileActiveMenu === item.label
                                  ? null
                                  : item.label,
                              );
                              setMobileFlyout(null);
                            }}
                            aria-label={`${item.label} submenu`}
                            aria-expanded={mobileActiveMenu === item.label}
                          >
                            <ChevronDown
                              className={cn(
                                "size-4 transition",
                                mobileActiveMenu === item.label && "rotate-180",
                              )}
                            />
                          </button>
                        </div>
                        {mobileActiveMenu === item.label && (
                          <ul className="space-y-0.5 pb-3">
                            {item.groups.map((group) => (
                              <li key={group.label}>
                                {group.children?.length ? (
                                  <>
                                    <button
                                      type="button"
                                      className={cn(
                                        "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium",
                                        mobileFlyout === group.label
                                          ? "bg-[#123a9b] text-white"
                                          : "bg-slate-50 text-slate-700",
                                      )}
                                      onClick={() =>
                                        setMobileFlyout(
                                          mobileFlyout === group.label
                                            ? null
                                            : group.label,
                                        )
                                      }
                                    >
                                      {group.label}
                                      <ChevronRight className="size-3.5" />
                                    </button>
                                    {mobileFlyout === group.label && (
                                      <ul className="border border-slate-200 bg-white">
                                        {group.children.map((child) => (
                                          <li key={child.label}>
                                            <Link
                                              href={child.href}
                                              onClick={() => setMobileOpen(false)}
                                              className={cn(
                                                "flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition hover:bg-[#123a9b] hover:text-white",
                                                child.featured
                                                  ? "bg-sky-50/80 font-semibold text-slate-800"
                                                  : "text-slate-600",
                                              )}
                                            >
                                              <span>{child.label}</span>
                                              {child.featured && (
                                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                                                  Featured
                                                </span>
                                              )}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </>
                                ) : (
                                  <Link
                                    href={group.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                      "flex items-center justify-between gap-2 bg-slate-50 px-3 py-2.5 text-sm font-medium hover:bg-[#123a9b] hover:text-white",
                                      group.featured
                                        ? "bg-sky-50/80 text-slate-800"
                                        : "text-slate-700",
                                    )}
                                  >
                                    <span>{group.label}</span>
                                    {group.featured && (
                                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                                        Featured
                                      </span>
                                    )}
                                  </Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex text-sm font-semibold",
                          item.highlight
                            ? "mt-2 items-center justify-center whitespace-nowrap rounded-full bg-primary/10 px-4 py-2.5 text-center font-extrabold tracking-wide text-primary"
                            : "py-3.5 text-slate-800",
                        )}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  {!isSignedIn ? (
                    <>
                      <Link
                        href="/sign-in"
                        className="flex items-center gap-2 py-2 text-sm font-semibold text-slate-800"
                        onClick={() => setMobileOpen(false)}
                      >
                        <UserRound className="size-4" /> Sign in
                      </Link>
                      <Link
                        href="/sign-up"
                        className="flex items-center gap-2 py-2 text-sm font-semibold text-slate-800"
                        onClick={() => setMobileOpen(false)}
                      >
                        Sign up
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/account"
                        className="flex items-center gap-2 py-2 text-sm font-semibold text-slate-800"
                        onClick={() => setMobileOpen(false)}
                      >
                        <UserRound className="size-4" /> My Account
                      </Link>
                      <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 py-2 text-sm font-semibold text-slate-800"
                          onClick={() => setMobileOpen(false)}
                        >
                          <LogOut className="size-4" /> Log out
                        </button>
                      </SignOutButton>
                    </>
                  )}
                </div>
                <Link
                  href="/commercial-solutions"
                  className={cn(buttonVariants(), "mt-4 w-full")}
                  onClick={() => setMobileOpen(false)}
                >
                  Request Quote
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <CartDrawer />
    </>
  );
}
