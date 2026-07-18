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
import { useState } from "react";

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
  Residential: [
    { title: "By Technology", links: ["RO Purifiers", "UV Purifiers", "UF Purifiers", "RO + UV Purifiers"] },
    { title: "By Need", links: ["Alkaline Water", "Hot & Cold", "High TDS Water", "Under Counter"] },
    { title: "By Family Size", links: ["For Couples", "Small Family", "Large Family", "Whole House"] },
    { title: "Popular", links: ["Best Sellers", "New Arrivals", "Smart Purifiers", "View All"] },
  ],
  Commercial: [
    { title: "Business", links: ["Restaurants", "Corporate Offices", "Schools", "Hospitals"] },
    { title: "Capacity", links: ["25 LPH", "50 LPH", "100 LPH", "250 LPH"] },
    { title: "Solutions", links: ["Water Dispensers", "RO Plants", "Bottle Filling", "Water Coolers"] },
    { title: "Services", links: ["Site Assessment", "AMC Plans", "Filter Service", "Request Quote"] },
  ],
  Industrial: [
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
  { label: "Residential", href: "/category/residential", groups: productMenus.Residential },
  { label: "Commercial", href: "/commercial-solutions", groups: productMenus.Commercial },
  { label: "Industrial", href: "/category/industrial-ro", groups: productMenus.Industrial },
  { label: "Accessories", href: "/category/accessories", groups: productMenus.Accessories },
  { label: "Mother & Child", href: "/category/mother-and-child", groups: productMenus["Mother & Child"] },
  { label: "Brands", href: "/category/commercial", groups: productMenus.Brands },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

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
  const activeItem = navItems.find((item) => item.label === activeMenu);

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

      <div className="relative" onMouseLeave={() => setActiveMenu(null)}>
        <div className="section-shell flex h-[78px] items-center gap-5">
          <AquaPureLogo />

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
                  onMouseEnter={() => setActiveMenu(item.label)}
                  onClick={() => setActiveMenu(activeMenu === item.label ? null : item.label)}
                  aria-expanded={activeMenu === item.label}
                >
                  {item.label}
                  <ChevronDown className={cn("size-3 transition", activeMenu === item.label && "rotate-180")} />
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

        {activeItem?.groups && (
          <div className="absolute left-0 top-full hidden w-full border-t border-blue-100 bg-white/98 py-5 shadow-[0_22px_55px_rgba(20,55,110,0.15)] xl:block">
            <div className="section-shell grid grid-cols-[repeat(4,1fr)_1.15fr] gap-7">
              {activeItem.groups.map((group) => (
                <div key={group.title}>
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                    {group.title}
                  </p>
                  <ul className="space-y-2.5">
                    {group.links.map((link) => (
                      <li key={link}>
                        <Link href={activeItem.href} className="text-sm text-slate-600 transition hover:translate-x-0.5 hover:text-primary">
                          {link}
                        </Link>
                      </li>
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
          </div>
        )}

        {mobileOpen && (
          <div className="max-h-[calc(100vh-117px)] overflow-y-auto border-t border-blue-100 bg-white px-4 py-4 shadow-xl xl:hidden">
            <nav className="mx-auto flex max-w-2xl flex-col" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between border-b border-blue-50 py-3.5 text-sm font-semibold text-slate-700"
                >
                  {item.label}
                  {item.groups && <ChevronDown className="size-4 -rotate-90 text-primary" />}
                </Link>
              ))}
              <Link href="/commercial-solutions" className={cn(buttonVariants(), "mt-4")}>
                Request Quote
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
