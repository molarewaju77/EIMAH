export type Category = {
  slug: string;
  name: string;
  featured?: boolean;
  image: string;
  blurb: string;
};

export type ProductAttribute = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  options: Record<string, string>; // e.g. { "Colour": "Black", "Size": "40" }
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number;
  category: string;
  images: string[];
  description: string;
  stock: number;
  featured?: boolean;
  weight?: number;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
};

// Image URL helper: high-quality Unsplash photos (deterministic ids)
const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const categories: Category[] = [
  {
    slug: "clothing",
    name: "Clothing",
    featured: true,
    image: img("1490481651871-ab68de25d43d", 1200),
    blurb: "Everyday essentials, elevated.",
  },
  {
    slug: "shoes",
    name: "Shoes",
    featured: true,
    image: img("1542291026-7eec264c27ff", 1200),
    blurb: "Step into the season.",
  },
  {
    slug: "bags",
    name: "Bags",
    featured: true,
    image: img("1548036328-c9fa89d128fa", 1200),
    blurb: "Carry it in style.",
  },
  {
    slug: "home-essentials",
    name: "Home Essentials",
    image: img("1493663284031-b7e3aefcae8e", 900),
    blurb: "Rituals for daily life.",
  },
  {
    slug: "kitchen-dining",
    name: "Kitchen & Dining",
    image: img("1556909114-f6e7ad7d3136", 900),
    blurb: "Cook, serve, gather.",
  },
  {
    slug: "beauty-self-care",
    name: "Beauty & Self Care",
    image: img("1522337360788-8b13dee7a37e", 900),
    blurb: "Quiet luxury for you.",
  },
  {
    slug: "accessories",
    name: "Accessories",
    image: img("1611923134239-b9be5816e23b", 900),
    blurb: "The finishing touches.",
  },
  {
    slug: "gadgets",
    name: "Gadgets",
    image: img("1546027658-7aa750153465", 900),
    blurb: "Smart, useful, tested.",
  },
  {
    slug: "gifts-sets",
    name: "Gifts & Sets",
    image: img("1549465220-1a8b9238cd48", 900),
    blurb: "Thoughtfully curated.",
  },
];

const P = (
  id: string,
  name: string,
  slug: string,
  price: number,
  category: string,
  photo: string,
  description: string,
  opts?: {
    compareAt?: number;
    featured?: boolean;
    stock?: number;
    attributes?: ProductAttribute[];
    variants?: ProductVariant[];
  },
): Product => ({
  id,
  name,
  slug,
  price,
  category,
  images: [img(photo, 1200), img(photo, 900)],
  description,
  stock: opts?.stock ?? 24,
  compareAt: opts?.compareAt,
  featured: opts?.featured,
  attributes: opts?.attributes,
  variants: opts?.variants,
});

export const products: Product[] = [
  P(
    "eimah-001",
    "Oversized Wool Blazer",
    "oversized-wool-blazer",
    84500,
    "clothing",
    "1591047139829-d91aecb6caea",
    "Tailored oversized silhouette in Italian wool blend. A grown-up staple.",
    {
      featured: true,
      compareAt: 96000,
      attributes: [
        { name: "Colour", values: ["Charcoal", "Black"] },
        { name: "Size", values: ["S", "M", "L"] },
      ],
      variants: [
        { id: "v1", options: { Colour: "Charcoal", Size: "S" }, stock: 5 },
        { id: "v2", options: { Colour: "Charcoal", Size: "M" }, stock: 8 },
        { id: "v3", options: { Colour: "Charcoal", Size: "L" }, stock: 2 },
        { id: "v4", options: { Colour: "Black", Size: "S" }, stock: 0 },
        { id: "v5", options: { Colour: "Black", Size: "M" }, stock: 4 },
        { id: "v6", options: { Colour: "Black", Size: "L" }, stock: 5 },
      ],
    },
  ),
  P(
    "eimah-002",
    "Ribbed Merino Knit",
    "ribbed-merino-knit",
    42000,
    "clothing",
    "1434389677669-e08b4cac3105",
    "Fine-gauge merino with a soft handfeel. Wear it solo or layered.",
    {
      featured: true,
      attributes: [{ name: "Size", values: ["M", "L"] }],
      variants: [
        { id: "v7", options: { Size: "M" }, stock: 10 },
        { id: "v8", options: { Size: "L" }, stock: 14 },
      ],
    },
  ),
  P(
    "eimah-003",
    "Relaxed Poplin Shirt",
    "relaxed-poplin-shirt",
    28500,
    "clothing",
    "1602810318383-e386cc2a3ccf",
    "Crisp cotton poplin with a drop shoulder and mother-of-pearl buttons.",
  ),
  P(
    "eimah-004",
    "Wide-Leg Tailored Trouser",
    "wide-leg-trouser",
    46000,
    "clothing",
    "1594633312681-425c7b97ccd1",
    "High-rise pleated trouser that moves with you.",
  ),

  P(
    "eimah-101",
    "Leather Chelsea Boot",
    "leather-chelsea-boot",
    128000,
    "shoes",
    "1520639888713-7851133b1ed0",
    "Hand-finished full-grain leather with a stacked heel.",
    { featured: true },
  ),
  P(
    "eimah-102",
    "Everyday Runner",
    "everyday-runner",
    68500,
    "shoes",
    "1542291026-7eec264c27ff",
    "A minimal runner engineered for all-day comfort.",
    { featured: true, compareAt: 78000 },
  ),
  P(
    "eimah-103",
    "Suede Loafer",
    "suede-loafer",
    74000,
    "shoes",
    "1533867617858-e7b97e060509",
    "Soft Italian suede with a hand-stitched moccasin construction.",
  ),

  P(
    "eimah-201",
    "Structured Tote",
    "structured-tote",
    96000,
    "bags",
    "1548036328-c9fa89d128fa",
    "Rigid pebbled leather tote sized for laptops and life.",
    { featured: true },
  ),
  P(
    "eimah-202",
    "Everyday Crossbody",
    "everyday-crossbody",
    54000,
    "bags",
    "1590874103328-eac38a683ce7",
    "A compact crossbody with adjustable strap and card slots.",
  ),
  P(
    "eimah-203",
    "Weekend Duffle",
    "weekend-duffle",
    118000,
    "bags",
    "1553062407-98eeb64c6a62",
    "Waxed canvas duffle with leather-trimmed handles.",
  ),

  P(
    "eimah-301",
    "Linen Bedding Set",
    "linen-bedding-set",
    89000,
    "home-essentials",
    "1505693416388-ac5ce068fe85",
    "Stone-washed French linen. Softer with every wash.",
    { featured: true },
  ),
  P(
    "eimah-302",
    "Ceramic Table Lamp",
    "ceramic-table-lamp",
    62000,
    "home-essentials",
    "1513506003901-1e6a229e2d15",
    "Hand-thrown ceramic base with a linen shade.",
  ),

  P(
    "eimah-401",
    "Stoneware Dinner Set",
    "stoneware-dinner-set",
    74500,
    "kitchen-dining",
    "1556909114-f6e7ad7d3136",
    "12-piece stoneware set glazed by hand.",
  ),
  P(
    "eimah-402",
    "Copper Moka Pot",
    "copper-moka-pot",
    38000,
    "kitchen-dining",
    "1495474472287-4d71bcdd2085",
    "6-cup stovetop espresso maker, made to last.",
  ),

  P(
    "eimah-501",
    "Gentle Cleansing Balm",
    "gentle-cleansing-balm",
    18500,
    "beauty-self-care",
    "1522337360788-8b13dee7a37e",
    "Melts away makeup with plant-based oils.",
    { compareAt: 21000 },
  ),
  P(
    "eimah-502",
    "Ritual Body Oil",
    "ritual-body-oil",
    24000,
    "beauty-self-care",
    "1608248543803-ba4f8c70ae0b",
    "Warming body oil with sweet almond and rose.",
  ),

  P(
    "eimah-601",
    "Braided Leather Belt",
    "braided-leather-belt",
    22000,
    "accessories",
    "1611923134239-b9be5816e23b",
    "Woven leather belt with a brushed nickel buckle.",
  ),
  P(
    "eimah-602",
    "Modern Wool Cap",
    "modern-wool-cap",
    14500,
    "accessories",
    "1517255076-8cc9c8f4d6c1",
    "Fine wool baseball cap with a curved brim.",
  ),

  P(
    "eimah-701",
    "Wireless Earbuds",
    "wireless-earbuds",
    89000,
    "gadgets",
    "1590658268037-6bf12165a8df",
    "Active noise cancellation, 30h battery life.",
    { featured: true },
  ),
  P(
    "eimah-702",
    "Smart Desk Lamp",
    "smart-desk-lamp",
    46500,
    "gadgets",
    "1507473885765-e6ed057f782c",
    "App-controlled task lamp with circadian dimming.",
  ),
];

export const featuredProducts = products.filter((p) => p.featured);

export const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

export const faqs = [
  {
    q: "What makes your products different?",
    a: "Every product in our collection is intentionally selected for its quality, functionality, and refined design. We focus on offering products that serve a purpose, provide lasting value, and fit seamlessly into everyday life.",
  },
  {
    q: "How do I know the product is right for me?",
    a: "Each product page includes detailed descriptions, specifications, dimensions, and key features to help you make an informed decision. If you need further assistance, our team is always available to guide you.",
  },
  {
    q: "How long does shipping take?",
    a: "Delivery times vary depending on your location. Once your order is confirmed, you'll receive an estimated delivery timeline and tracking details (where available) so you can monitor your order.",
  },
  {
    q: "Can I return or exchange a product?",
    a: "Returns or exchanges are only accepted for products that arrive damaged, defective, or different from what was ordered. If you receive an incorrect or damaged item, please contact our support team, and we’ll work quickly to resolve the issue. Please review our Return & Exchange Policy for more information on eligibility, timelines, and procedures.",
  },
  {
    q: "How can I place an order and what payment methods do you accept?",
    a: "Simply add your preferred products to your cart and proceed to checkout. We accept secure payment methods available on our platform, and your order is processed once payment is confirmed.",
  },
  {
    q: "How can I contact your support team?",
    a: "You can reach us through WhatsApp, email, or our contact page. Whether you have questions before purchasing or need assistance after your order, we're here to help and aim to respond as quickly as possible.",
  },
];

// Admin mock data
export type OrderStatus =
  "Paid" | "Processing" | "Shipped" | "Delivered" | "Ready for Pick-up" | "Collected" | "Cancelled";

export function generateTrackingId(
  deliveryMethod: "Courier" | "Pickup Station" = "Courier",
): string {
  const prefix = deliveryMethod === "Pickup Station" ? "EMH-PK" : "EMH-CR";
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

export type Order = {
  id: string;
  trackingId: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: { name: string; variant?: string; qty: number; price: number; subtotal?: number; weight?: number }[];
  address: string;
  deliveryMethod: "Courier" | "Pickup Station";
  paymentStatus: "Successful" | "Paid" | "Pending" | "Failed" | "Refunded";
  shippingFee: number;
  subtotal: number;
  waybillNumber?: string;
  trackingHistory: { status: OrderStatus; date: string; admin: string }[];
  internalNotes?: string;
};

export const orders: Order[] = [
  {
    id: "EMH-10238",
    trackingId: "EMH-CR-7K4X9P2M",
    customer: "Adaeze Okonkwo",
    email: "adaeze@example.com",
    date: "2026-07-18T10:30:00Z",
    total: 128000,
    subtotal: 128000,
    shippingFee: 0,
    paymentStatus: "Paid",
    deliveryMethod: "Courier",
    status: "Delivered",
    items: [
      { name: "Leather Chelsea Boot", variant: "Size 40", qty: 1, price: 128000, subtotal: 128000 },
    ],
    address: "14 Admiralty Way, Lekki, Lagos",
    trackingHistory: [
      { status: "Paid", date: "2026-07-18T10:30:00Z", admin: "System" },
      { status: "Processing", date: "2026-07-18T14:15:00Z", admin: "Michael Olarewaju" },
      { status: "Shipped", date: "2026-07-19T09:00:00Z", admin: "Logistics Team" },
      { status: "Delivered", date: "2026-07-20T16:45:00Z", admin: "Courier" },
    ],
    internalNotes: "Left with security at the gate.",
  },
  {
    id: "EMH-10239",
    trackingId: "EMH-CR-3R8NJ6TQ",
    customer: "Tunde Bakare",
    email: "tunde@example.com",
    date: "2026-07-19T11:20:00Z",
    total: 311000,
    subtotal: 311000,
    shippingFee: 0,
    paymentStatus: "Paid",
    deliveryMethod: "Courier",
    status: "Processing",
    items: [
      {
        name: "Oversized Wool Blazer",
        variant: "Charcoal, L",
        qty: 1,
        price: 84500,
        subtotal: 84500,
      },
      { name: "Leather Chelsea Boot", variant: "Size 42", qty: 1, price: 128000, subtotal: 128000 },
      { name: "Ribbed Merino Knit", variant: "L", qty: 2, price: 42000, subtotal: 84000 },
      { name: "Braided Leather Belt", qty: 1, price: 22000, subtotal: 22000 },
      { name: "Modern Wool Cap", qty: 1, price: 14500, subtotal: 14500 },
    ],
    address: "3 Herbert Macaulay Way, Yaba, Lagos",
    trackingHistory: [
      { status: "Paid", date: "2026-07-19T11:20:00Z", admin: "System" },
      { status: "Processing", date: "2026-07-19T13:40:00Z", admin: "Michael Olarewaju" },
    ],
  },
  {
    id: "EMH-10240",
    trackingId: "EMH-PK-5W2YF8BH",
    customer: "Chiamaka Eze",
    email: "chi@example.com",
    date: "2026-07-20T09:10:00Z",
    total: 156500,
    subtotal: 156500,
    shippingFee: 0,
    paymentStatus: "Paid",
    deliveryMethod: "Pickup Station",
    status: "Paid",
    items: [
      { name: "Structured Tote", qty: 1, price: 96000, subtotal: 96000 },
      { name: "Ribbed Merino Knit", variant: "M", qty: 1, price: 42000, subtotal: 42000 },
      { name: "Braided Leather Belt", qty: 1, price: 18500, subtotal: 18500 },
    ],
    address: "22 Isaac John Street, Ikeja GRA, Lagos",
    trackingHistory: [{ status: "Paid", date: "2026-07-20T09:10:00Z", admin: "System" }],
  },
  {
    id: "EMH-10241",
    trackingId: "EMH-CR-9D6LC4VX",
    customer: "Ibrahim Musa",
    email: "ibrahim@example.com",
    date: "2026-07-20T14:50:00Z",
    total: 49500,
    subtotal: 46000,
    shippingFee: 3500,
    paymentStatus: "Paid",
    deliveryMethod: "Courier",
    status: "Shipped",
    items: [{ name: "Wide-Leg Trouser", qty: 1, price: 46000, subtotal: 46000 }],
    address: "8 Aminu Kano Cres, Abuja",
    trackingHistory: [
      { status: "Paid", date: "2026-07-20T14:50:00Z", admin: "System" },
      { status: "Processing", date: "2026-07-21T10:00:00Z", admin: "Michael Olarewaju" },
      { status: "Shipped", date: "2026-07-22T08:30:00Z", admin: "Logistics Team" },
    ],
  },
  {
    id: "EMH-10242",
    trackingId: "EMH-CR-4P1GA7MZ",
    customer: "Zainab Yusuf",
    email: "zainab@example.com",
    date: "2026-07-21T16:05:00Z",
    total: 89000,
    subtotal: 89000,
    shippingFee: 0,
    paymentStatus: "Paid",
    deliveryMethod: "Courier",
    status: "Paid",
    items: [{ name: "Linen Bedding Set", qty: 1, price: 89000, subtotal: 89000 }],
    address: "12 New Haven, Enugu",
    trackingHistory: [{ status: "Paid", date: "2026-07-21T16:05:00Z", admin: "System" }],
  },
  {
    id: "EMH-10243",
    trackingId: "EMH-CR-8T5KE2RN",
    customer: "Emeka Nwosu",
    email: "emeka@example.com",
    date: "2026-07-21T18:20:00Z",
    total: 72000,
    subtotal: 68500,
    shippingFee: 3500,
    paymentStatus: "Paid",
    deliveryMethod: "Courier",
    status: "Delivered",
    items: [{ name: "Everyday Runner", variant: "Size 42", qty: 1, price: 68500, subtotal: 68500 }],
    address: "5 GRA Phase 2, Port Harcourt",
    trackingHistory: [
      { status: "Paid", date: "2026-07-21T18:20:00Z", admin: "System" },
      { status: "Processing", date: "2026-07-22T09:15:00Z", admin: "Michael Olarewaju" },
      { status: "Shipped", date: "2026-07-23T11:00:00Z", admin: "Logistics Team" },
      { status: "Delivered", date: "2026-07-25T14:30:00Z", admin: "Courier" },
    ],
  },
  {
    id: "EMH-10244",
    trackingId: "EMH-CR-6H3QW9DS",
    customer: "Fatima Bello",
    email: "fatima@example.com",
    date: "2026-07-22T08:45:00Z",
    total: 46000,
    subtotal: 42500,
    shippingFee: 3500,
    paymentStatus: "Paid",
    deliveryMethod: "Courier",
    status: "Paid",
    items: [
      { name: "Ritual Body Oil", qty: 1, price: 24000, subtotal: 24000 },
      { name: "Gentle Cleansing Balm", qty: 1, price: 18500, subtotal: 18500 },
    ],
    address: "9 Independence Way, Kaduna",
    trackingHistory: [{ status: "Paid", date: "2026-07-22T08:45:00Z", admin: "System" }],
  },
  {
    id: "EMH-10245",
    trackingId: "EMH-CR-2X7UB5JP",
    customer: "Ngozi Adeyemi",
    email: "ngozi@example.com",
    date: "2026-07-23T09:00:00Z",
    total: 613000,
    subtotal: 610000,
    shippingFee: 3000,
    paymentStatus: "Paid",
    deliveryMethod: "Courier",
    status: "Processing",
    items: [
      { name: "Leather Chelsea Boot", variant: "Size 41", qty: 1, price: 128000, subtotal: 128000 },
      { name: "Oversized Wool Blazer", variant: "Black, M", qty: 1, price: 84500, subtotal: 84500 },
      { name: "Structured Tote", qty: 1, price: 96000, subtotal: 96000 },
      { name: "Everyday Crossbody", qty: 1, price: 54000, subtotal: 54000 },
      { name: "Ribbed Merino Knit", variant: "L", qty: 2, price: 42000, subtotal: 84000 },
      { name: "Relaxed Poplin Shirt", qty: 1, price: 28500, subtotal: 28500 },
      { name: "Braided Leather Belt", qty: 1, price: 22000, subtotal: 22000 },
      { name: "Modern Wool Cap", qty: 2, price: 14500, subtotal: 29000 },
      { name: "Ritual Body Oil", qty: 2, price: 24000, subtotal: 48000 },
      { name: "Gentle Cleansing Balm", qty: 1, price: 18500, subtotal: 18500 },
      { name: "Wireless Earbuds", qty: 1, price: 89000, subtotal: 89000 },
      { name: "Smart Desk Lamp", qty: 1, price: 46500, subtotal: 46500 },
    ],
    address: "7 Bourdillon Road, Ikoyi, Lagos",
    trackingHistory: [
      { status: "Paid", date: "2026-07-23T09:00:00Z", admin: "System" },
      { status: "Processing", date: "2026-07-23T11:30:00Z", admin: "Michael Olarewaju" },
    ],
  },
  {
    id: "EMH-10246",
    trackingId: "EMH-PK-1M9CF3YK",
    customer: "Rotimi Adeleke",
    email: "rotimi@example.com",
    date: "2026-07-24T14:00:00Z",
    total: 239000,
    subtotal: 239000,
    shippingFee: 0,
    paymentStatus: "Paid",
    deliveryMethod: "Pickup Station",
    status: "Ready for Pick-up",
    items: [
      { name: "Weekend Duffle", qty: 1, price: 118000, subtotal: 118000 },
      { name: "Linen Bedding Set", qty: 1, price: 89000, subtotal: 89000 },
      { name: "Copper Moka Pot", qty: 1, price: 38000, subtotal: 38000 },
    ],
    address: "Victoria Island Hub — 23 Adeola Odeku Street, VI, Lagos",
    trackingHistory: [
      { status: "Paid", date: "2026-07-24T14:00:00Z", admin: "System" },
      { status: "Processing", date: "2026-07-24T16:00:00Z", admin: "Michael Olarewaju" },
      { status: "Ready for Pick-up", date: "2026-07-25T09:30:00Z", admin: "VI Hub Desk" },
    ],
  },
  {
    id: "EMH-10247",
    trackingId: "EMH-PK-7V4ZA8GT",
    customer: "Folashade Alabi",
    email: "folashade@example.com",
    date: "2026-07-25T11:15:00Z",
    total: 118000,
    subtotal: 118000,
    shippingFee: 0,
    paymentStatus: "Paid",
    deliveryMethod: "Pickup Station",
    status: "Ready for Pick-up",
    items: [
      { name: "Everyday Crossbody", qty: 1, price: 54000, subtotal: 54000 },
      { name: "Ribbed Merino Knit", variant: "Beige, S", qty: 1, price: 42000, subtotal: 42000 },
      { name: "Ritual Body Oil", qty: 1, price: 24000, subtotal: 24000 },
    ],
    address: "Lekki Hub — 14 Admiralty Way, Lekki Phase 1, Lagos",
    trackingHistory: [
      { status: "Paid", date: "2026-07-25T11:15:00Z", admin: "System" },
      { status: "Processing", date: "2026-07-25T13:00:00Z", admin: "Michael Olarewaju" },
      { status: "Ready for Pick-up", date: "2026-07-26T10:00:00Z", admin: "Lekki Station Lead" },
    ],
  },
  {
    id: "EMH-10248",
    trackingId: "EMH-PK-3N6XR1WL",
    customer: "Chuka Obi",
    email: "chuka@example.com",
    date: "2026-07-26T09:40:00Z",
    total: 174500,
    subtotal: 174500,
    shippingFee: 0,
    paymentStatus: "Paid",
    deliveryMethod: "Pickup Station",
    status: "Processing",
    items: [
      { name: "Leather Chelsea Boot", variant: "Size 43", qty: 1, price: 128000, subtotal: 128000 },
      { name: "Smart Desk Lamp", qty: 1, price: 46500, subtotal: 46500 },
    ],
    address: "Ikeja Hub — 12 Allen Avenue, Ikeja, Lagos",
    trackingHistory: [
      { status: "Paid", date: "2026-07-26T09:40:00Z", admin: "System" },
      { status: "Processing", date: "2026-07-26T11:20:00Z", admin: "Warehouse Staff" },
    ],
  },
  {
    id: "EMH-10249",
    trackingId: "EMH-PK-5J2HD7PQ",
    customer: "Aisha Mohammed",
    email: "aisha.m@example.com",
    date: "2026-07-26T14:30:00Z",
    total: 84500,
    subtotal: 84500,
    shippingFee: 0,
    paymentStatus: "Paid",
    deliveryMethod: "Pickup Station",
    status: "Paid",
    items: [
      {
        name: "Oversized Wool Blazer",
        variant: "Oatmeal, S",
        qty: 1,
        price: 84500,
        subtotal: 84500,
      },
    ],
    address: "Abuja Central Hub — 8 Aminu Kano Crescent, Wuse 2, Abuja",
    trackingHistory: [{ status: "Paid", date: "2026-07-26T14:30:00Z", admin: "System" }],
  },
  {
    id: "EMH-10250",
    trackingId: "EMH-PK-8B4KT9NS",
    customer: "Oluwaseun Davies",
    email: "seun.davies@example.com",
    date: "2026-07-24T08:20:00Z",
    total: 96000,
    subtotal: 96000,
    shippingFee: 0,
    paymentStatus: "Paid",
    deliveryMethod: "Pickup Station",
    status: "Collected",
    items: [{ name: "Structured Tote", qty: 1, price: 96000, subtotal: 96000 }],
    address: "Yaba Tech Hub — 3 Herbert Macaulay Way, Yaba, Lagos",
    trackingHistory: [
      { status: "Paid", date: "2026-07-24T08:20:00Z", admin: "System" },
      { status: "Processing", date: "2026-07-24T10:00:00Z", admin: "Michael Olarewaju" },
      { status: "Ready for Pick-up", date: "2026-07-24T15:00:00Z", admin: "Yaba Station Lead" },
      { status: "Collected", date: "2026-07-25T12:45:00Z", admin: "Customer Collection" },
    ],
  },
  {
    id: "EMH-10251",
    trackingId: "EMH-PK-6F1MC5VR",
    customer: "Kelechi Nnamdi",
    email: "kelechi@example.com",
    date: "2026-07-23T16:10:00Z",
    total: 147000,
    subtotal: 147000,
    shippingFee: 0,
    paymentStatus: "Paid",
    deliveryMethod: "Pickup Station",
    status: "Collected",
    items: [
      { name: "Wireless Earbuds", qty: 1, price: 89000, subtotal: 89000 },
      { name: "Everyday Crossbody", qty: 1, price: 54000, subtotal: 54000 },
      { name: "Modern Wool Cap", qty: 1, price: 14500, subtotal: 14500 },
    ],
    address: "Ibadan Hub — Ring Road by Challenge, Ibadan",
    trackingHistory: [
      { status: "Paid", date: "2026-07-23T16:10:00Z", admin: "System" },
      { status: "Processing", date: "2026-07-24T09:00:00Z", admin: "Michael Olarewaju" },
      { status: "Ready for Pick-up", date: "2026-07-24T14:30:00Z", admin: "Ibadan Station Lead" },
      { status: "Collected", date: "2026-07-25T17:10:00Z", admin: "Customer Collection" },
    ],
  },
];

export const customers = [
  { name: "Adaeze Okonkwo", email: "adaeze@example.com", orders: 8, spent: 640000, city: "Lagos" },
  { name: "Tunde Bakare", email: "tunde@example.com", orders: 3, spent: 210500, city: "Lagos" },
  { name: "Chiamaka Eze", email: "chi@example.com", orders: 12, spent: 984000, city: "Lagos" },
  { name: "Ibrahim Musa", email: "ibrahim@example.com", orders: 2, spent: 92000, city: "Abuja" },
  { name: "Zainab Yusuf", email: "zainab@example.com", orders: 5, spent: 312000, city: "Enugu" },
  {
    name: "Emeka Nwosu",
    email: "emeka@example.com",
    orders: 7,
    spent: 486500,
    city: "Port Harcourt",
  },
];

export const revenueSeries = [
  { m: "Jan", v: 2.4 },
  { m: "Feb", v: 3.1 },
  { m: "Mar", v: 2.9 },
  { m: "Apr", v: 4.2 },
  { m: "May", v: 3.8 },
  { m: "Jun", v: 5.1 },
  { m: "Jul", v: 6.4 },
  { m: "Aug", v: 5.8 },
  { m: "Sep", v: 6.9 },
  { m: "Oct", v: 7.5 },
  { m: "Nov", v: 8.8 },
  { m: "Dec", v: 9.4 },
];
