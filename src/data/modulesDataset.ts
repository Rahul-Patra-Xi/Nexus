import { distanceKm, estimateDriveMinutes } from "@/lib/geo";

export type Geo = { lat: number; lng: number };

export const DEFAULT_MAP_CENTER: Geo & { label: string } = {
  lat: 12.9716,
  lng: 77.5946,
  label: "Indiranagar · Bengaluru",
};

export const AREA_PRESETS: (Geo & { label: string })[] = [
  { label: "Indiranagar", lat: 12.9716, lng: 77.5946 },
  { label: "Koramangala 5th Block", lat: 12.9352, lng: 77.6245 },
  { label: "Whitefield", lat: 12.9698, lng: 77.75 },
  { label: "MG Road", lat: 12.975, lng: 77.6064 },
  { label: "HSR Layout", lat: 12.9121, lng: 77.6446 },
];

export type CabVehicle = {
  id: string;
  name: string;
  description: string;
  baseFare: number;
  perKm: number;
  pickupMins: number;
};

export const CAB_VEHICLES: CabVehicle[] = [
  { id: "mini", name: "Mini", description: "Swift, compact — best for solo hops", baseFare: 48, perKm: 11, pickupMins: 3 },
  { id: "sedan", name: "Sedan", description: "Etios / Dzire class · extra space", baseFare: 62, perKm: 14, pickupMins: 5 },
  { id: "suv", name: "SUV", description: "Innova / Ertiga · groups & airport runs", baseFare: 89, perKm: 18, pickupMins: 8 },
];

export type DriverProfile = {
  id: string;
  name: string;
  rating: number;
  trips: number;
  vehicle: string;
  plate: string;
  avatar: string;
};

export const DRIVER_POOL: DriverProfile[] = [
  { id: "drv1", name: "Rajesh K.", rating: 4.92, trips: 4200, vehicle: "Toyota Etios", plate: "KA-01-AB-2044", avatar: "RK" },
  { id: "drv2", name: "Priya N.", rating: 4.88, trips: 3100, vehicle: "Maruti Swift", plate: "KA-03-MN-8812", avatar: "PN" },
  { id: "drv3", name: "Vikram S.", rating: 4.95, trips: 6100, vehicle: "Honda City", plate: "KA-05-QZ-4410", avatar: "VS" },
  { id: "drv4", name: "Ananya R.", rating: 4.84, trips: 2800, vehicle: "Innova Crysta", plate: "KA-51-TR-9921", avatar: "AR" },
];

export type DestinationPreset = Geo & { id: string; label: string };

export const DESTINATION_PRESETS: DestinationPreset[] = [
  { id: "blrai", label: "Kempegowda Intl. Airport (T1/T2)", lat: 13.1989, lng: 77.7067 },
  { id: "manyata", label: "Manyata Tech Park", lat: 13.0458, lng: 77.6267 },
  { id: "ubcity", label: "UB City / Vittal Mallya", lat: 12.9716, lng: 77.5965 },
  { id: "ecity", label: "Electronic City Phase 1", lat: 12.8456, lng: 77.6603 },
  { id: "kor6", label: "Koramangala 6th Block", lat: 12.9389, lng: 77.6256 },
];

export function fareForCab(vehicle: CabVehicle, distanceKm: number): number {
  return Math.round(vehicle.baseFare + vehicle.perKm * Math.max(1.2, distanceKm));
}

export function withDistance<T extends Geo>(origin: Geo, items: T[]): (T & { distanceKm: number; etaMin: number })[] {
  return items
    .map((it) => {
      const d = distanceKm(origin, it);
      return { ...it, distanceKm: d, etaMin: estimateDriveMinutes(d) };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/* —— Groceries —— */

export type GroceryCategory = "fruits" | "vegetables" | "dairy" | "snacks";

export type GroceryProduct = {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: GroceryCategory;
  image: string;
};

export type GroceryStore = Geo & {
  id: string;
  name: string;
  tagline: string;
  rating: number;
  deliveryBand: string;
  open: boolean;
};

export const GROCERY_STORES: GroceryStore[] = [
  { id: "gs1", name: "BlinkNexus Express", tagline: "10–15 min · cold chain", lat: 12.978, lng: 77.588, rating: 4.8, deliveryBand: "10–15 min", open: true },
  { id: "gs2", name: "FreshCart Hub", tagline: "Organic focus", lat: 12.965, lng: 77.612, rating: 4.6, deliveryBand: "18–24 min", open: true },
  { id: "gs3", name: "DailyMart 24", tagline: "Late night snacks", lat: 12.958, lng: 77.598, rating: 4.4, deliveryBand: "20–28 min", open: true },
];

export const GROCERY_CATALOG: GroceryProduct[] = [
  { id: "gf1", name: "Alphonso Mango (6 pcs)", price: 420, unit: "tray", category: "fruits", image: "🥭" },
  { id: "gf2", name: "Washington Apples (4)", price: 180, unit: "pack", category: "fruits", image: "🍎" },
  { id: "gf3", name: "Banana Robusta (dozen)", price: 55, unit: "bunch", category: "fruits", image: "🍌" },
  { id: "gv1", name: "Cherry Tomatoes 250g", price: 65, unit: "pack", category: "vegetables", image: "🍅" },
  { id: "gv2", name: "Baby Spinach 200g", price: 72, unit: "pack", category: "vegetables", image: "🥬" },
  { id: "gv3", name: "Button Mushrooms 200g", price: 95, unit: "pack", category: "vegetables", image: "🍄" },
  { id: "gd1", name: "A2 Cow Milk 1L", price: 78, unit: "bottle", category: "dairy", image: "🥛" },
  { id: "gd2", name: "Greek Yogurt 400g", price: 165, unit: "tub", category: "dairy", image: "🫙" },
  { id: "gd3", name: "Mozzarella Block 200g", price: 210, unit: "pack", category: "dairy", image: "🧀" },
  { id: "gsn1", name: "Dark Chocolate Bar", price: 120, unit: "bar", category: "snacks", image: "🍫" },
  { id: "gsn2", name: "Roasted Almonds 150g", price: 199, unit: "pack", category: "snacks", image: "🌰" },
  { id: "gsn3", name: "Kettle Chips Sea Salt", price: 85, unit: "pack", category: "snacks", image: "🥔" },
];

/* —— Doctors —— */

export type DoctorRow = Geo & {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviews: number;
  fee: number;
  nextSlot: string;
};

export const DOCTORS: DoctorRow[] = [
  { id: "doc1", name: "Dr. Meera Iyer", specialty: "Cardiology", hospital: "Apollo Clinic Indiranagar", lat: 12.973, lng: 77.641, rating: 4.9, reviews: 842, fee: 800, nextSlot: "Today 4:30 PM" },
  { id: "doc2", name: "Dr. Arjun Patel", specialty: "General Physician", hospital: "Manipal Outpatient", lat: 12.96, lng: 77.59, rating: 4.7, reviews: 1204, fee: 450, nextSlot: "Today 2:00 PM" },
  { id: "doc3", name: "Dr. Sarah Thomas", specialty: "Dermatology", hospital: "SkinFirst Koramangala", lat: 12.935, lng: 77.622, rating: 4.85, reviews: 560, fee: 650, nextSlot: "Tomorrow 10:00 AM" },
  { id: "doc4", name: "Dr. Vikram Rao", specialty: "Orthopedics", hospital: "Bone & Joint Center", lat: 12.988, lng: 77.57, rating: 4.8, reviews: 430, fee: 900, nextSlot: "Today 6:00 PM" },
  { id: "doc5", name: "Dr. Nina Kulkarni", specialty: "General Physician", hospital: "Practo Care Suites", lat: 12.949, lng: 77.605, rating: 4.6, reviews: 2100, fee: 400, nextSlot: "Today 3:15 PM" },
];

export const SPECIALTIES = ["All", "Cardiology", "General Physician", "Dermatology", "Orthopedics"] as const;

/* —— Bills —— */

export type BillCategoryId = "electricity" | "mobile" | "water";

export const BILL_PROVIDERS: Record<
  BillCategoryId,
  { id: string; name: string; mockAmount: number; placeholder: string; fieldLabel: string }[]
> = {
  electricity: [
    { id: "bescom", name: "BESCOM Bengaluru", mockAmount: 1840, placeholder: "10 digit account", fieldLabel: "Consumer number" },
    { id: "tata", name: "Tata Power-DDL", mockAmount: 920, placeholder: "CA number", fieldLabel: "Account / CA number" },
  ],
  mobile: [
    { id: "airtel", name: "Airtel Prepaid", mockAmount: 349, placeholder: "10 digit mobile", fieldLabel: "Mobile number" },
    { id: "jio", name: "Jio Prepaid", mockAmount: 299, placeholder: "10 digit mobile", fieldLabel: "Mobile number" },
  ],
  water: [
    { id: "bwssb", name: "BWSSB", mockAmount: 640, placeholder: "RR number", fieldLabel: "RR / connection number" },
  ],
};

/* —— Food —— */

export type FoodMenuItem = { id: string; name: string; price: number; veg: boolean; bestseller?: boolean };

export type RestaurantRow = Geo & {
  id: string;
  name: string;
  cuisines: string[];
  priceForTwo: number;
  rating: number;
  offer: string;
  menu: FoodMenuItem[];
};

export const RESTAURANTS: RestaurantRow[] = [
  {
    id: "r1",
    name: "Toscano Indiranagar",
    cuisines: ["Italian", "Continental"],
    priceForTwo: 1600,
    rating: 4.45,
    lat: 12.978,
    lng: 77.64,
    offer: "20% off above ₹800",
    menu: [
      { id: "m1", name: "Wood-fired Margherita", price: 520, veg: true, bestseller: true },
      { id: "m2", name: "Truffle Mushroom Risotto", price: 640, veg: true },
      { id: "m3", name: "Aglio Olio Pepperoncino", price: 480, veg: true },
      { id: "m4", name: "Chicken Roulade", price: 720, veg: false },
    ],
  },
  {
    id: "r2",
    name: "Meghana Foods",
    cuisines: ["Andhra", "Biryani"],
    priceForTwo: 700,
    rating: 4.6,
    lat: 12.968,
    lng: 77.597,
    offer: "Free dessert on ₹599+",
    menu: [
      { id: "b1", name: "Chicken Dum Biryani", price: 340, veg: false, bestseller: true },
      { id: "b2", name: "Mutton Biryani", price: 420, veg: false },
      { id: "b3", name: "Paneer Biryani", price: 280, veg: true },
      { id: "b4", name: "Ghee Roast (Half)", price: 320, veg: false },
    ],
  },
  {
    id: "r3",
    name: "Sly Granny",
    cuisines: ["Cafe", "European"],
    priceForTwo: 1400,
    rating: 4.35,
    lat: 12.934,
    lng: 77.627,
    offer: "Happy hours 4–7pm",
    menu: [
      { id: "c1", name: "Sourdough Avocado Toast", price: 380, veg: true },
      { id: "c2", name: "Truffle Fries", price: 320, veg: true, bestseller: true },
      { id: "c3", name: "Grilled River Sole", price: 780, veg: false },
    ],
  },
];

/* —— Smart Plan bundles —— */

export type SmartBundle = {
  id: string;
  title: string;
  subtitle: string;
  savings: string;
  tags: string[];
  cta: { label: string; path: string }[];
};

export const SMART_BUNDLES: SmartBundle[] = [
  {
    id: "sp1",
    title: "Doctor + Cab + Pharmacy",
    subtitle: "After your consult, auto-queue a cab to the nearest Nexus Pharmacy partner.",
    savings: "~₹120 saved vs booking separately",
    tags: ["health", "transport"],
    cta: [
      { label: "Open Doctor", path: "/mod/doctor" },
      { label: "Book Cab", path: "/mod/cab" },
    ],
  },
  {
    id: "sp2",
    title: "Groceries + evening chef slot",
    subtitle: "Order staples now; we’ll align delivery with your home-service window.",
    savings: "15 min handover overlap",
    tags: ["groceries", "home"],
    cta: [{ label: "Start groceries", path: "/mod/groceries" }],
  },
  {
    id: "sp3",
    title: "Food + late bill pay",
    subtitle: "Order dinner while we surface your due utility bills in one sheet.",
    savings: "Single checkout mindset",
    tags: ["food", "finance"],
    cta: [
      { label: "Order food", path: "/mod/food" },
      { label: "Pay bills", path: "/mod/bills" },
    ],
  },
];
