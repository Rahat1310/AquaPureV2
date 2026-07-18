"use client";

import Link from "next/link";
import {
  ChevronDown,
  Heart,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShoppingCart,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import type { Variants } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MenuGroup = {
  title: string;
  links: string[];
};

type NavItem = {
  label: string;
  href: string;
  groups?: MenuGroup[];
};

const productMenus: Record<string, MenuGroup[]> = {
  "Home & Family": [
    { title: "By Technology", links: ["RO Purifiers", "UV Purifiers", "UF Purifiers", "RO + UV Purifiers"] },
    { title: "By Need", links: ["Alkaline Water", "Hot & Cold", "High TDS Water", "Under Counter"] },
    { title: "By Family Size", links: ["For Couples", "Small Family", "Large Family", "Whole House"] },
    { title: "Popular", links: ["Best Sellers", "New Arrivals", "Smart Purifiers", "View All"] },
  ],
  "Business & Industry": [
    { title: "Business", links: ["Restaurants", "Corporate Offices", "Schools", "Hospitals"] },
    { title: "Capacity", links: ["25 LPH", "50 LPH", "100 LPH", "250 LPH"] },
    { title: "Solutions", links: ["Water Dispensers", "RO Plants", "Bottle Filling", "Water Coolers"] },
    { title: "Services", links: ["Site Assessment", "AMC Plans", "Filter Service", "Request Quote"] },
    { title: "Treatment Plants", links: ["Industrial RO", "Softener Plant", "DM Plant", "Iron Removal"] },
    { title: "Water Systems", links: ["ETP Systems", "STP Systems", "UF Systems", "Desalination"] },
    { title: "Industries", links: ["Textile", "Pharmaceutical", "Food & Beverage", "Manufacturing"] },
    { title: "Engineering", links: ["Turnkey Projects", "Plant Upgrade", "Maintenance", "Consultation"] },
  ],
  Accessories: [
    { title: "Filters", links: ["Sediment Filter", "Carbon Filter", "RO Membrane", "Mineral Cartridge"] },
    { title: "Parts", links: ["Pumps", "Faucets", "UV Lamps", "Storage Tanks"] },
    { title: "Care", links: ["Filter Kits", "TDS Meters", "Cleaning Kits", "Sanitization"] },
    { title: "Shop", links: ["Best Sellers", "Value Packs", "Subscriptions", "View All"] },
  ],
  "Mother & Child": [
    { title: "For Mothers", links: ["Pregnancy Wellness", "Postnatal Hydration", "Mineral Water", "Kitchen Purifiers"] },
    { title: "For Children", links: ["Baby-safe Water", "School Bottles", "Mineral Balance", "Travel Filters"] },
    { title: "Family Care", links: ["Healthy Hydration", "Doctor Guides", "Water Quality Test", "Care Plans"] },
    { title: "Learn", links: ["Expert Articles", "FAQs", "Water Safety", "Shop Collection"] },
  ],
  Brands: [
    { title: "AquaPure", links: ["AquaPure Home", "AquaPure Pro", "AquaPure Mini", "AquaPure Max"] },
    { title: "Featured", links: ["AquaGuard", "Kent", "Livpure", "Pureit"] },
    { title: "Premium", links: ["3M", "Pentair", "Blue Star", "AO Smith"] },
    { title: "Browse", links: ["All Brands", "Compare Brands", "Brand Offers", "Buying Guide"] },
  ],
};

const navItems: NavItem[] = [
  { label: "Home & Family", href: "/category/residential", groups: productMenus["Home & Family"] },
  { label: "Business & Industry", href: "/commercial-solutions", groups: productMenus["Business & Industry"] },
  { label: "Accessories", href: "/category/accessories", groups: productMenus.Accessories },
  { label: "Mother & Child", href: "/category/mother-and-child", groups: productMenus["Mother & Child"] },
  { label: "Brands", href: "/category/commercial", groups: productMenus.Brands },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

/** Framer Motion variants for the mega menu panel */
const megaMenuVariants: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,
    transition: { duration: 0.15, ease: "easeIn" as const },
  },
};

/** Framer Motion variants for individual menu link rows (stagger children) */
const menuLinkVariants: Variants = {
  hidden: { opacity: 0, x: -4 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.025, duration: 0.15, ease: "easeOut" as const },
  }),
};

function AquaPureLogo() {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="AquaPure home">
      <span className="relative grid size-11 place-items-center overflow-hidden rounded-2xl bg-primary text-white shadow-[0_10px_22px_rgba(27,79,209,0.25)]">
        <span className="absolute -right-2 -top-2 size-7 rounded-full bg-sky-300/50" />
        <svg viewBox="0 0 32 38" className="relative h-7 w-6" aria-hidden="true">
          <path
            d="M16 1.5S2.5 15.2 2.5 25.1C2.5 32.2 8.5 37 16 37s13.5-4.8 13.5-11.9C29.5 15.2 16 1.5 16 1.5Z"
            fill="currentColor"
          />
          <path d="M9.8 27.4c2.3 3.2 7 4.2 11.4 1.5" stroke="#75D6FF" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      <span>
        <span className="block text-xl font-extrabold leading-5 tracking-[-0.04em] text-primary">
          AquaPure
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Pure water. Pure life.
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const activeItem = navItems.find((item) => item.label === activeMenu);

  // Hover-intent: 150ms delay before opening to prevent flickering
  // when mouse moves quickly across the nav bar.
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleNavEnter(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    hoverTimer.current = setTimeout(() => setActiveMenu(label), 150);
  }

  function handleNavLeave() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    // Small close grace — prevents flicker when moving mouse into the dropdown
    closeTimer.current = setTimeout(() => setActiveMenu(null), 80);
  }

  function handleDropdownEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function handleDropdownLeave() {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 80);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 shadow-[0_8px_30px_rgba(35,73,130,0.06)] backdrop-blur-xl">
      <div className="bg-[#123a9b] text-white">
        <div className="section-shell flex min-h-9 items-center justify-between gap-4 text-[11px] font-medium">
          <div className="hidden items-center gap-5 md:flex">
            <a href="tel:+8801700000000" className="flex items-center gap-1.5 transition hover:text-sky-200">
              <Phone className="size-3.5" /> +880 1700-000000
            </a>
            <a href="https://wa.me/8801700000000" className="flex items-center gap-1.5 transition hover:text-sky-200">
              <MessageCircle className="size-3.5" /> WhatsApp
            </a>
            <a href="mailto:care@aquapure.com" className="flex items-center gap-1.5 transition hover:text-sky-200">
              <Mail className="size-3.5" /> care@aquapure.com
            </a>
          </div>
          <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
            <span className="-my-1 flex min-h-9 items-center gap-1.5 bg-sky-400 px-3 font-bold text-[#0d2d78] [clip-path:polygon(8px_0,100%_0,calc(100%_-_8px)_100%,0_100%)]">
              <Sparkles className="size-3.5" /> Free Installation
            </span>
            <Link href="/staff/login" className="hidden items-center gap-1.5 hover:text-sky-200 sm:flex">
              <UserRound className="size-3.5" /> Dealer Login
            </Link>
            <Link href="/track-order" className="flex items-center gap-1.5 hover:text-sky-200">
              <MapPin className="size-3.5" /> Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav row */}
      <div className="relative">
        <div className="section-shell flex h-[78px] items-center gap-5">
          <AquaPureLogo />

          {/* Desktop nav */}
          <nav className="ml-auto hidden h-full items-center gap-0.5 xl:flex" aria-label="Main navigation">
            {navItems.map((item) =>
              item.groups ? (
                <button
                  type="button"
                  key={item.label}
                  className={cn(
                    "flex h-full items-center gap-1 px-2 text-[12px] font-semibold text-slate-700 transition hover:text-primary",
                    activeMenu === item.label && "text-primary",
                  )}
                  onMouseEnter={() => handleNavEnter(item.label)}
                  onMouseLeave={handleNavLeave}
                  onClick={() => setActiveMenu(activeMenu === item.label ? null : item.label)}
                  aria-expanded={activeMenu === item.label}
                  aria-haspopup="true"
                >
                  {item.label}
                  <motion.span
                    animate={{ rotate: activeMenu === item.label ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "flex" }}
                  >
                    <ChevronDown className="size-3" />
                  </motion.span>
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex h-full items-center px-2 text-[12px] font-semibold text-slate-700 transition hover:text-primary"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1 xl:ml-2">
            <button type="button" className="grid size-10 place-items-center rounded-xl text-slate-600 transition hover:bg-secondary hover:text-primary" aria-label="Search">
              <Search className="size-[18px]" />
            </button>
            <button type="button" className="hidden size-10 place-items-center rounded-xl text-slate-600 transition hover:bg-secondary hover:text-primary sm:grid" aria-label="Wishlist">
              <Heart className="size-[18px]" />
            </button>
            <button type="button" className="relative hidden size-10 place-items-center rounded-xl text-slate-600 transition hover:bg-secondary hover:text-primary sm:grid" aria-label="Shopping cart">
              <ShoppingCart className="size-[18px]" />
              <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-white">2</span>
            </button>
            <Link href="/commercial-solutions" className={cn(buttonVariants({ size: "sm" }), "ml-1 hidden lg:inline-flex")}>
              Request Quote
            </Link>
            <button
              type="button"
              className="ml-1 grid size-10 place-items-center rounded-xl border border-border xl:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* ─── Desktop Mega Menu ──────────────────────────────────────────── */}
        <AnimatePresence>
          {activeItem?.groups && (
            <motion.div
              key={activeItem.label}
              variants={megaMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 top-full hidden w-full border-t border-blue-100 bg-white/98 py-5 shadow-[0_22px_55px_rgba(20,55,110,0.15)] xl:block"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
              role="region"
              aria-label={`${activeItem.label} submenu`}
            >
              <div className="section-shell grid grid-cols-[repeat(4,1fr)_1.15fr] gap-7">
                {activeItem.groups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                      {group.title}
                    </p>
                    <ul className="space-y-2.5">
                      {group.links.map((link, i) => (
                        <motion.li
                          key={link}
                          custom={i}
                          variants={menuLinkVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Link href={activeItem.href} className="text-sm text-slate-600 transition hover:translate-x-0.5 hover:text-primary">
                            {link}
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Link href={activeItem.href} className="water-grid group relative overflow-hidden rounded-2xl border border-blue-100 p-5">
                  <span className="mb-6 grid size-10 place-items-center rounded-xl bg-white text-primary shadow-sm">
                    <Sparkles className="size-5" />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Explore collection</p>
                  <p className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
                    Better water for every space.
                  </p>
                  <span className="mt-5 inline-flex text-sm font-bold text-primary group-hover:underline">
                    Shop {activeItem.label} →
                  </span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Mobile Menu ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden border-t border-blue-100 bg-white shadow-xl xl:hidden"
            >
              <div className="max-h-[calc(100vh-117px)] overflow-y-auto px-4 py-4">
                <nav className="mx-auto flex max-w-2xl flex-col" aria-label="Mobile navigation">
                  {navItems.map((item) => (
                    <div key={item.label} className="border-b border-blue-50">
                      {item.groups ? (
                        <>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between py-3.5 text-sm font-semibold text-slate-700"
                            onClick={() =>
                              setMobileActiveMenu(
                                mobileActiveMenu === item.label ? null : item.label,
                              )
                            }
                            aria-expanded={mobileActiveMenu === item.label}
                          >
                            {item.label}
                            <motion.span
                              animate={{ rotate: mobileActiveMenu === item.label ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ display: "flex" }}
                            >
                              <ChevronDown className="size-4 text-primary" />
                            </motion.span>
                          </button>
                          <AnimatePresence>
                            {mobileActiveMenu === item.label && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 pb-4 pt-1">
                                  {item.groups.map((group) => (
                                    <div key={group.title} className="mb-3">
                                      <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">
                                        {group.title}
                                      </p>
                                      {group.links.map((link) => (
                                        <Link
                                          key={link}
                                          href={item.href}
                                          onClick={() => {
                                            setMobileOpen(false);
                                            setMobileActiveMenu(null);
                                          }}
                                          className="block py-1 text-xs text-slate-600 hover:text-primary"
                                        >
                                          {link}
                                        </Link>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between py-3.5 text-sm font-semibold text-slate-700"
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                  <Link href="/commercial-solutions" className={cn(buttonVariants(), "mt-4")}>
                    Request Quote
                  </Link>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
