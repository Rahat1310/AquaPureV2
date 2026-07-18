/**
 * AquaPure — Prisma Seed Script
 *
 * Run with:  npx prisma db seed
 * Configured in package.json under "prisma.seed"
 *
 * Covers:
 *  - 1 SUPER_ADMIN + 1 ADMIN + 1 SERVICE_MANAGER + 3 CUSTOMERS
 *  - Full category tree (5 roots → 31 leaves)
 *  - 12 Products with BDT pricing, realistic specs
 *  - 3 ProductVariants (commercial RO capacity variants)
 *  - 2 Addresses per customer
 *  - 2 Orders with OrderItems
 *  - 3 Reviews (verified)
 *  - 2 QuoteRequests
 *  - 2 ServiceRequests
 *  - AuditLog entries for seeded admin mutations
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  SERVICE_MANAGER: "SERVICE_MANAGER",
  SUPPORT: "SUPPORT",
  CUSTOMER: "CUSTOMER",
} as const;

const ProductStatus = {
  ACTIVE: "ACTIVE",
  DRAFT: "DRAFT",
  DISCONTINUED: "DISCONTINUED",
} as const;

const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

const QuoteStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  QUOTED: "QUOTED",
  CLOSED_WON: "CLOSED_WON",
  CLOSED_LOST: "CLOSED_LOST",
} as const;

const ServiceType = {
  INSTALLATION: "INSTALLATION",
  AMC: "AMC",
  REPAIR: "REPAIR",
  WATER_TESTING: "WATER_TESTING",
  WARRANTY_REGISTRATION: "WARRANTY_REGISTRATION",
} as const;

const prisma = new PrismaClient();

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

// Helper: build spec JSON string
const spec = (obj: Record<string, string | number>) => JSON.stringify(obj);
// Helper: build images JSON string
const imgs = (...urls: string[]) => JSON.stringify(urls);

async function main() {
  console.log(" Seeding AquaPure database...\n");

  // ──────────────────────────────────────────────────────────
  // USERS
  // ──────────────────────────────────────────────────────────
  const [superAdmin, admin, serviceManager, customer1, customer2, customer3] =
    await Promise.all([
      prisma.user.upsert({
        where: { email: "superadmin@aquapure.com.bd" },
        update: {},
        create: {
          name: "Rafiqul Islam",
          email: "superadmin@aquapure.com.bd",
          passwordHash: await hashPassword("SuperAdmin@123"),
          role: Role.SUPER_ADMIN,
          phone: "01711000001",
          isActive: true,
        },
      }),
      prisma.user.upsert({
        where: { email: "admin@aquapure.com.bd" },
        update: {},
        create: {
          name: "Nasrin Akter",
          email: "admin@aquapure.com.bd",
          passwordHash: await hashPassword("Admin@123456"),
          role: Role.ADMIN,
          phone: "01722000002",
          isActive: true,
        },
      }),
      prisma.user.upsert({
        where: { email: "service@aquapure.com.bd" },
        update: {},
        create: {
          name: "Kamal Hossain",
          email: "service@aquapure.com.bd",
          passwordHash: await hashPassword("Service@123456"),
          role: Role.SERVICE_MANAGER,
          phone: "01733000003",
          isActive: true,
        },
      }),
      prisma.user.upsert({
        where: { email: "rahela@example.com" },
        update: {},
        create: {
          name: "Rahela Begum",
          email: "rahela@example.com",
          passwordHash: await hashPassword("Customer@123"),
          role: Role.CUSTOMER,
          phone: "01812000101",
          isActive: true,
        },
      }),
      prisma.user.upsert({
        where: { email: "tanvir@example.com" },
        update: {},
        create: {
          name: "Tanvir Ahmed",
          email: "tanvir@example.com",
          passwordHash: await hashPassword("Customer@123"),
          role: Role.CUSTOMER,
          phone: "01812000202",
          isActive: true,
        },
      }),
      prisma.user.upsert({
        where: { email: "sadia@example.com" },
        update: {},
        create: {
          name: "Sadia Khanam",
          email: "sadia@example.com",
          passwordHash: await hashPassword("Customer@123"),
          role: Role.CUSTOMER,
          phone: "01812000303",
          isActive: true,
        },
      }),
    ]);

  console.log("✅ Users seeded");

  // ──────────────────────────────────────────────────────────
  // CATEGORIES  (5 roots → 31 leaves)
  // ──────────────────────────────────────────────────────────

  const catDefs: Array<{
    name: string;
    slug: string;
    order?: number;
    children?: Array<{ name: string; slug: string; order?: number }>;
  }> = [
      {
        name: "Residential",
        slug: "residential",
        order: 1,
        children: [
          { name: "RO UV", slug: "ro-uv", order: 1 },
          { name: "RO UV UF", slug: "ro-uv-uf", order: 2 },
          { name: "Under Sink", slug: "under-sink", order: 3 },
          { name: "Table Top", slug: "table-top", order: 4 },
          { name: "Hot & Cold", slug: "hot-and-cold", order: 5 },
          { name: "Wall Mounted", slug: "wall-mounted", order: 6 },
        ],
      },
      {
        name: "Commercial",
        slug: "commercial",
        order: 2,
        children: [
          { name: "Commercial RO", slug: "commercial-ro", order: 1 },
          { name: "Industrial RO", slug: "industrial-ro", order: 2 },
          { name: "Waste Water Treatment", slug: "waste-water-treatment", order: 3 },
          { name: "Water Softener", slug: "water-softener", order: 4 },
          { name: "Iron Removal", slug: "iron-removal", order: 5 },
          { name: "Water Dispenser", slug: "water-dispenser", order: 6 },
        ],
      },
      {
        name: "Accessories",
        slug: "accessories",
        order: 3,
        children: [
          { name: "PP Filter", slug: "pp-filter", order: 1 },
          { name: "Carbon Filter", slug: "carbon-filter", order: 2 },
          { name: "Post Carbon", slug: "post-carbon", order: 3 },
          { name: "Membrane", slug: "membrane", order: 4 },
          { name: "T33", slug: "t33", order: 5 },
          { name: "Mineral Cartridge", slug: "mineral-cartridge", order: 6 },
          { name: "Alkaline Cartridge", slug: "alkaline-cartridge", order: 7 },
          { name: "UV Lamp", slug: "uv-lamp", order: 8 },
          { name: "Motor", slug: "motor", order: 9 },
          { name: "Adapter", slug: "adapter", order: 10 },
          { name: "Tap", slug: "tap", order: 11 },
          { name: "Fittings", slug: "fittings", order: 12 },
          { name: "TDS Meter", slug: "tds-meter", order: 13 },
        ],
      },
      {
        name: "Mother & Child",
        slug: "mother-and-child",
        order: 4,
        children: [
          { name: "Baby Water Purifier", slug: "baby-water-purifier", order: 1 },
          { name: "Bottle Sterilizer", slug: "bottle-sterilizer", order: 2 },
          { name: "Formalin Removal", slug: "formalin-removal", order: 3 },
          { name: "Shower Filter", slug: "shower-filter", order: 4 },
        ],
      },
      {
        name: "Air Purifier",
        slug: "air-purifier",
        order: 5,
        children: [],
      },
    ];

  const categoryMap: Record<string, string> = {}; // slug → id

  for (const root of catDefs) {
    const rootCat = await prisma.category.upsert({
      where: { slug: root.slug },
      update: {},
      create: {
        name: root.name,
        slug: root.slug,
        displayOrder: root.order ?? 0,
        image: `https://res.cloudinary.com/aquapure/image/upload/v1/categories/${root.slug}.webp`,
      },
    });
    categoryMap[root.slug] = rootCat.id;

    for (const child of root.children ?? []) {
      const childCat = await prisma.category.upsert({
        where: { slug: child.slug },
        update: {},
        create: {
          name: child.name,
          slug: child.slug,
          displayOrder: child.order ?? 0,
          parentId: rootCat.id,
          image: `https://res.cloudinary.com/aquapure/image/upload/v1/categories/${child.slug}.webp`,
        },
      });
      categoryMap[child.slug] = childCat.id;
    }
  }

  console.log("✅ Categories seeded (5 roots, 31 leaves)");

  // ──────────────────────────────────────────────────────────
  // PRODUCTS  (12 products)
  // ──────────────────────────────────────────────────────────

  const productDefs = [
    {
      name: "AquaPure RO-75 Table Top Purifier",
      slug: "aquapure-ro-75-table-top",
      sku: "AP-TT-001",
      description:
        "7-stage RO+UV+UF purifier with mineralizer. Ideal for Dhaka city water conditions. Removes 99.9% bacteria and viruses.",
      price: 12500,
      compareAtPrice: 15000,
      stock: 45,
      categorySlug: "table-top",
      brand: "AquaPure",
      isFeatured: true,
      isBestSeller: true,
      images: imgs(
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-tt-001-1.webp",
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-tt-001-2.webp"
      ),
      specs: spec({
        stages: 7,
        capacity: "75 GPD",
        storageTank: "3.2 L",
        uvPower: "11W",
        weight: "4.2 kg",
        warranty: "1 Year",
        certifications: "NSF/ANSI 58",
      }),
    },
    {
      name: "AquaPure WM-100 Wall Mounted RO UV",
      slug: "aquapure-wm-100-wall-mounted",
      sku: "AP-WM-002",
      description:
        "Premium wall-mount RO UV UF purifier with hot & cold dispenser. Perfect for kitchen installation.",
      price: 22000,
      compareAtPrice: 27500,
      stock: 28,
      categorySlug: "wall-mounted",
      brand: "AquaPure",
      isFeatured: true,
      isBestSeller: false,
      images: imgs(
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-wm-002-1.webp",
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-wm-002-2.webp"
      ),
      specs: spec({
        stages: 9,
        capacity: "100 GPD",
        hotTemp: "85–95°C",
        coldTemp: "5–15°C",
        weight: "12.5 kg",
        warranty: "2 Years",
      }),
    },
    {
      name: "AquaPure US-50 Under Sink Purifier",
      slug: "aquapure-us-50-under-sink",
      sku: "AP-US-003",
      description:
        "Compact under-sink 5-stage RO system with dedicated faucet. Space-saving design for modern kitchens.",
      price: 9800,
      compareAtPrice: 12000,
      stock: 60,
      categorySlug: "under-sink",
      brand: "AquaPure",
      isFeatured: false,
      isBestSeller: true,
      images: imgs(
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-us-003-1.webp"
      ),
      specs: spec({
        stages: 5,
        capacity: "50 GPD",
        storageTank: "3.2 L",
        faucetIncluded: "Yes",
        warranty: "1 Year",
      }),
    },
    {
      name: "AquaPure HC-200 Hot & Cold Dispenser",
      slug: "aquapure-hc-200-hot-cold",
      sku: "AP-HC-004",
      description:
        "Free-standing hot & cold water dispenser with built-in 6-stage RO filter. 20 L/hr production rate.",
      price: 35000,
      compareAtPrice: 42000,
      stock: 15,
      categorySlug: "hot-and-cold",
      brand: "AquaPure",
      isFeatured: true,
      isBestSeller: false,
      images: imgs(
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-hc-004-1.webp",
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-hc-004-2.webp",
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-hc-004-3.webp"
      ),
      specs: spec({
        stages: 6,
        production: "20 L/hr",
        hotCapacity: "4 L",
        coldCapacity: "8 L",
        power: "550W",
        warranty: "2 Years",
      }),
    },
    {
      name: "AquaPure RO-UV Classic",
      slug: "aquapure-ro-uv-classic",
      sku: "AP-RU-005",
      description:
        "Entry-level 6-stage RO UV purifier. Best value for residential use. TDS reduction up to 97%.",
      price: 7500,
      compareAtPrice: 9000,
      stock: 120,
      categorySlug: "ro-uv",
      brand: "AquaPure",
      isFeatured: false,
      isBestSeller: true,
      images: imgs(
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-ru-005-1.webp"
      ),
      specs: spec({
        stages: 6,
        capacity: "50 GPD",
        storageTank: "3.2 L",
        tdsReduction: "97%",
        warranty: "1 Year",
      }),
    },
    {
      name: "AquaPure RO-UV-UF Pro",
      slug: "aquapure-ro-uv-uf-pro",
      sku: "AP-RUF-006",
      description:
        "Advanced 8-stage RO UV UF purifier with alkaline filter. Ideal for areas with hard water.",
      price: 14500,
      compareAtPrice: 18000,
      stock: 35,
      categorySlug: "ro-uv-uf",
      brand: "AquaPure",
      isFeatured: true,
      isBestSeller: false,
      images: imgs(
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-ruf-006-1.webp",
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-ruf-006-2.webp"
      ),
      specs: spec({
        stages: 8,
        capacity: "75 GPD",
        alkalineFilter: "Yes",
        phRange: "7.5–9.0",
        warranty: "2 Years",
      }),
    },
    {
      name: "AquaPure CRO-500 Commercial RO System",
      slug: "aquapure-cro-500-commercial",
      sku: "AP-CRO-007",
      description:
        "High-capacity commercial RO system. Suitable for restaurants, clinics, and offices. 500 GPD production.",
      price: 85000,
      compareAtPrice: 100000,
      stock: 8,
      categorySlug: "commercial-ro",
      brand: "AquaPure",
      isFeatured: true,
      isBestSeller: false,
      images: imgs(
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-cro-007-1.webp",
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-cro-007-2.webp"
      ),
      specs: spec({
        capacity: "500 GPD",
        stages: 5,
        preFilter: "PP + Activated Carbon",
        membrane: "Dow Filmtec",
        powerConsumption: "250W",
        warranty: "2 Years",
      }),
    },
    {
      name: "AquaPure IRO-1000 Industrial RO",
      slug: "aquapure-iro-1000-industrial",
      sku: "AP-IRO-008",
      description:
        "Industrial-grade 1000 GPD RO system. Stainless steel frame, food-grade components. Suitable for garments and food processing.",
      price: 175000,
      compareAtPrice: 210000,
      stock: 4,
      categorySlug: "industrial-ro",
      brand: "AquaPure",
      isFeatured: false,
      isBestSeller: false,
      images: imgs(
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-iro-008-1.webp"
      ),
      specs: spec({
        capacity: "1000 GPD",
        frame: "Stainless Steel 304",
        stages: 6,
        flowMeter: "Included",
        warranty: "3 Years",
      }),
    },
    {
      name: "AquaPure PP Sediment Filter 10\"",
      slug: "pp-sediment-filter-10-inch",
      sku: "AP-AC-PP-001",
      description:
        "5 micron polypropylene sediment filter. Compatible with all standard 10-inch filter housings.",
      price: 150,
      compareAtPrice: 200,
      stock: 500,
      categorySlug: "pp-filter",
      brand: "AquaPure",
      isFeatured: false,
      isBestSeller: true,
      images: imgs(
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-pp-001-1.webp"
      ),
      specs: spec({ micron: 5, size: "10 inch", material: "PP", packSize: 1 }),
    },
    {
      name: "AquaPure 75 GPD RO Membrane",
      slug: "ro-membrane-75-gpd",
      sku: "AP-AC-MEM-001",
      description:
        "OEM-quality 75 GPD TFC RO membrane. Compatible with most residential RO systems.",
      price: 850,
      compareAtPrice: 1100,
      stock: 200,
      categorySlug: "membrane",
      brand: "AquaPure",
      isFeatured: false,
      isBestSeller: true,
      images: imgs(
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-mem-001-1.webp"
      ),
      specs: spec({ capacity: "75 GPD", type: "TFC", rejection: "98%", brand: "AquaPure Compatible" }),
    },
    {
      name: "AquaPure TDS Meter Pen",
      slug: "tds-meter-pen",
      sku: "AP-AC-TDS-001",
      description:
        "Digital TDS meter pen for water quality testing. Range 0–9990 ppm. Essential tool for every household.",
      price: 350,
      compareAtPrice: 500,
      stock: 300,
      categorySlug: "tds-meter",
      brand: "AquaPure",
      isFeatured: false,
      isBestSeller: true,
      images: imgs(
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-tds-001-1.webp"
      ),
      specs: spec({ range: "0–9990 ppm", accuracy: "±2%", battery: "2x 1.5V AAA" }),
    },
    {
      name: "AquaPure Baby Nano Purifier",
      slug: "aquapure-baby-nano-purifier",
      sku: "AP-MC-BP-001",
      description:
        "Ultra-pure water purifier designed for infant formula preparation. 0.01 micron nano-filtration removes all bacteria.",
      price: 6500,
      compareAtPrice: 8000,
      stock: 22,
      categorySlug: "baby-water-purifier",
      brand: "AquaPure",
      isFeatured: true,
      isBestSeller: false,
      images: imgs(
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-bp-001-1.webp",
        "https://res.cloudinary.com/aquapure/image/upload/v1/products/ap-bp-001-2.webp"
      ),
      specs: spec({
        filtration: "0.01 Micron Nano",
        bacteriaRemoval: "99.9999%",
        formalinRemoval: "Yes",
        tankCapacity: "1.5 L",
        warranty: "1 Year",
      }),
    },
  ];

  const productMap: Record<string, string> = {}; // slug → id

  for (const p of productDefs) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        images: p.images,
        specs: p.specs,
        brand: p.brand,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        status: ProductStatus.ACTIVE,
        categoryId: categoryMap[p.categorySlug],
      },
    });
    productMap[p.slug] = product.id;
  }

  console.log("✅ Products seeded (12 products)");

  // ──────────────────────────────────────────────────────────
  // PRODUCT VARIANTS (Commercial RO capacity variants)
  // ──────────────────────────────────────────────────────────
  const commercialRoId = productMap["aquapure-cro-500-commercial"];
  await prisma.productVariant.createMany({
    data: [
      {
        productId: commercialRoId,
        name: "250 GPD",
        sku: "AP-CRO-007-250",
        price: 55000,
        stock: 10,
        attributes: JSON.stringify({ capacity: "250 GPD" }),
      },
      {
        productId: commercialRoId,
        name: "500 GPD",
        sku: "AP-CRO-007-500",
        price: 85000,
        stock: 8,
        attributes: JSON.stringify({ capacity: "500 GPD" }),
      },
      {
        productId: commercialRoId,
        name: "1000 GPD",
        sku: "AP-CRO-007-1000",
        price: 140000,
        stock: 4,
        attributes: JSON.stringify({ capacity: "1000 GPD" }),
      },
    ],
  });

  console.log("✅ Product variants seeded (3 variants)");

  // ──────────────────────────────────────────────────────────
  // ADDRESSES
  // ──────────────────────────────────────────────────────────
  const [addr1, addr2] = await Promise.all([
    prisma.address.create({
      data: {
        userId: customer1.id,
        label: "Home",
        recipientName: "Rahela Begum",
        phone: "01812000101",
        line1: "House 12, Road 5, Block C",
        line2: "Mirpur DOHS",
        city: "Dhaka",
        district: "Dhaka",
        postCode: "1216",
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        userId: customer2.id,
        label: "Home",
        recipientName: "Tanvir Ahmed",
        phone: "01812000202",
        line1: "Flat 3B, Greenview Tower, Bashundhara R/A",
        city: "Dhaka",
        district: "Dhaka",
        postCode: "1229",
        isDefault: true,
      },
    }),
  ]);

  console.log("✅ Addresses seeded");

  // ──────────────────────────────────────────────────────────
  // ORDERS
  // ──────────────────────────────────────────────────────────
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2024-001",
      userId: customer1.id,
      addressId: addr1.id,
      status: OrderStatus.DELIVERED,
      subtotal: 12500,
      shipping: 150,
      tax: 0,
      total: 12650,
      paidAt: new Date("2024-11-01T10:30:00Z"),
      orderItems: {
        create: [
          {
            productId: productMap["aquapure-ro-75-table-top"],
            qty: 1,
            unitPrice: 12500,
            total: 12500,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2024-002",
      userId: customer2.id,
      addressId: addr2.id,
      status: OrderStatus.PAID,
      subtotal: 22150,
      shipping: 200,
      tax: 0,
      total: 22350,
      paidAt: new Date("2024-11-15T14:00:00Z"),
      orderItems: {
        create: [
          {
            productId: productMap["aquapure-wm-100-wall-mounted"],
            qty: 1,
            unitPrice: 22000,
            total: 22000,
          },
          {
            productId: productMap["tds-meter-pen"],
            qty: 1,
            unitPrice: 350,
            total: 350,
          },
        ],
      },
    },
  });

  console.log("✅ Orders seeded (2 orders)");

  // ──────────────────────────────────────────────────────────
  // REVIEWS
  // ──────────────────────────────────────────────────────────
  await prisma.review.createMany({
    data: [
      {
        productId: productMap["aquapure-ro-75-table-top"],
        userId: customer1.id,
        rating: 5,
        comment:
          "Excellent purifier! Water tastes very clean and fresh. Installation team was professional. Highly recommend for Dhaka families.",
        verifiedPurchase: true,
        isApproved: true,
      },
      {
        productId: productMap["aquapure-wm-100-wall-mounted"],
        userId: customer2.id,
        rating: 4,
        comment:
          "Very good product, hot water is perfect for tea. Cold water could be a bit colder. Overall satisfied.",
        verifiedPurchase: true,
        isApproved: true,
      },
      {
        productId: productMap["aquapure-ro-75-table-top"],
        userId: customer3.id,
        rating: 5,
        comment:
          "Best investment for family health. Water TDS dropped from 380 to 12 after installing. Amazing result!",
        verifiedPurchase: false,
        isApproved: true,
      },
    ],
  });

  console.log("✅ Reviews seeded");

  // ──────────────────────────────────────────────────────────
  // QUOTE REQUESTS
  // ──────────────────────────────────────────────────────────
  await prisma.quoteRequest.createMany({
    data: [
      {
        name: "Md. Sharif Uddin",
        company: "Sharif Garments Ltd.",
        phone: "01711234567",
        email: "sharif@sharifgarments.com",
        requirement:
          "Need 5000 GPD industrial RO system for fabric washing. Water source is WASA supply + tube well. Please visit site and provide quotation.",
        status: QuoteStatus.CONTACTED,
        assignedToId: serviceManager.id,
      },
      {
        name: "Dr. Farzana Haque",
        company: "Haque Diagnostic Center",
        phone: "01922345678",
        email: "farzana@haquediagnostic.com",
        requirement:
          "Require 200 GPD commercial RO system for laboratory use. Water must meet Class 3 purity standard. Urgent requirement.",
        status: QuoteStatus.NEW,
      },
    ],
  });

  console.log("✅ Quote requests seeded");

  // ──────────────────────────────────────────────────────────
  // SERVICE REQUESTS
  // ──────────────────────────────────────────────────────────
  await prisma.serviceRequest.createMany({
    data: [
      {
        type: ServiceType.INSTALLATION,
        customerName: "Rahela Begum",
        phone: "01812000101",
        address: "House 12, Road 5, Block C, Mirpur DOHS, Dhaka 1216",
        productModel: "AquaPure RO-75 Table Top Purifier",
        scheduleDate: new Date("2024-11-03T10:00:00Z"),
        notes: "Customer prefers morning appointment. 2nd floor, no lift.",
        status: "COMPLETED",
        technicianId: serviceManager.id,
      },
      {
        type: ServiceType.AMC,
        customerName: "Rafiq Mia",
        phone: "01611987654",
        address: "Flat 5A, Janata Tower, Tejgaon, Dhaka",
        productModel: "AquaPure WM-100 Wall Mounted RO UV",
        scheduleDate: new Date("2024-12-01T11:00:00Z"),
        notes: "Annual maintenance — filter replacement due. 3rd filter change.",
        status: "OPEN",
        technicianId: serviceManager.id,
      },
    ],
  });

  console.log("✅ Service requests seeded");

  // ──────────────────────────────────────────────────────────
  // AUDIT LOG (for seeded admin mutations)
  // ──────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: "CREATE_PRODUCT",
        entityType: "Product",
        entityId: productMap["aquapure-ro-75-table-top"],
        beforeJson: null,
        afterJson: JSON.stringify({ name: "AquaPure RO-75 Table Top Purifier", price: 12500 }),
      },
      {
        userId: admin.id,
        action: "CREATE_PRODUCT",
        entityType: "Product",
        entityId: productMap["aquapure-wm-100-wall-mounted"],
        beforeJson: null,
        afterJson: JSON.stringify({ name: "AquaPure WM-100 Wall Mounted RO UV", price: 22000 }),
      },
      {
        userId: admin.id,
        action: "UPDATE_ORDER_STATUS",
        entityType: "Order",
        entityId: order1.id,
        beforeJson: JSON.stringify({ status: "PAID" }),
        afterJson: JSON.stringify({ status: "DELIVERED" }),
      },
      {
        userId: superAdmin.id,
        action: "CREATE_USER",
        entityType: "User",
        entityId: admin.id,
        beforeJson: null,
        afterJson: JSON.stringify({ email: "admin@aquapure.com.bd", role: "ADMIN" }),
      },
    ],
  });

  console.log("✅ Audit log seeded");

  console.log("\n🎉 Database seeded successfully!");
  console.log("─────────────────────────────────────────");
  console.log("Admin:   superadmin@aquapure.com.bd  / SuperAdmin@123");
  console.log("Admin:   admin@aquapure.com.bd       / Admin@123456");
  console.log("Staff:   service@aquapure.com.bd     / Service@123456");
  console.log("Customer: rahela@example.com          / Customer@123");
  console.log("Customer: tanvir@example.com          / Customer@123");
  console.log("Customer: sadia@example.com           / Customer@123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
