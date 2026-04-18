import { Car, Stethoscope, ShoppingBasket, Wallet, Plane, Utensils, Home, Dumbbell, GraduationCap, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Service = {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  hue: string; // tailwind-friendly tint label
  accent: string; // hsl color for icon gradient
  stats: { label: string; value: string }[];
  cta: string;
};

export const services: Service[] = [
  {
    id: "transport",
    name: "Transport",
    tagline: "Cabs, metro & rentals",
    icon: Car,
    hue: "amber",
    accent: "28 92% 55%",
    stats: [{ label: "Next ride", value: "8 min" }, { label: "Saved", value: "$142" }],
    cta: "Book a cab",
  },
  {
    id: "health",
    name: "Healthcare",
    tagline: "Doctors, labs & pharmacy",
    icon: Stethoscope,
    hue: "rose",
    accent: "350 78% 58%",
    stats: [{ label: "Appointments", value: "2" }, { label: "Records", value: "18" }],
    cta: "Book consult",
  },
  {
    id: "groceries",
    name: "Groceries",
    tagline: "Daily essentials, 30 min",
    icon: ShoppingBasket,
    hue: "emerald",
    accent: "150 60% 42%",
    stats: [{ label: "Cart", value: "12" }, { label: "Delivery", value: "Today" }],
    cta: "Reorder list",
  },
  {
    id: "finance",
    name: "Finance",
    tagline: "Pay bills & track money",
    icon: Wallet,
    hue: "indigo",
    accent: "230 75% 58%",
    stats: [{ label: "Due", value: "$284" }, { label: "Bills", value: "3" }],
    cta: "Pay bills",
  },
  {
    id: "travel",
    name: "Travel",
    tagline: "Flights, hotels, trips",
    icon: Plane,
    hue: "sky",
    accent: "200 80% 50%",
    stats: [{ label: "Trip", value: "Bali" }, { label: "In", value: "12d" }],
    cta: "Plan trip",
  },
  {
    id: "food",
    name: "Food",
    tagline: "Restaurants & dine-in",
    icon: Utensils,
    hue: "orange",
    accent: "18 90% 55%",
    stats: [{ label: "Favorites", value: "24" }, { label: "Last order", value: "$32" }],
    cta: "Order food",
  },
  {
    id: "home",
    name: "Home Services",
    tagline: "Cleaning, repairs & more",
    icon: Home,
    hue: "violet",
    accent: "265 70% 60%",
    stats: [{ label: "Pros", value: "150+" }, { label: "Booked", value: "1" }],
    cta: "Book a pro",
  },
  {
    id: "fitness",
    name: "Fitness",
    tagline: "Gyms, classes, coaches",
    icon: Dumbbell,
    hue: "teal",
    accent: "175 65% 42%",
    stats: [{ label: "Streak", value: "12d" }, { label: "Classes", value: "4" }],
    cta: "Book class",
  },
  {
    id: "learn",
    name: "Learning",
    tagline: "Courses & tutors",
    icon: GraduationCap,
    hue: "cyan",
    accent: "190 75% 45%",
    stats: [{ label: "Courses", value: "3" }, { label: "Hours", value: "47" }],
    cta: "Continue",
  },
];

export type QuickAction = { id: string; label: string; icon: LucideIcon; service: string };

export const quickActions: QuickAction[] = [
  { id: "qa-cab", label: "Book Cab", icon: Car, service: "transport" },
  { id: "qa-grocery", label: "Groceries", icon: ShoppingBasket, service: "groceries" },
  { id: "qa-doctor", label: "Doctor", icon: Stethoscope, service: "health" },
  { id: "qa-bills", label: "Pay Bills", icon: Wallet, service: "finance" },
  { id: "qa-food", label: "Order Food", icon: Utensils, service: "food" },
  { id: "qa-magic", label: "Smart Plan", icon: Sparkles, service: "ai" },
];

export type ActivityItem = {
  id: string;
  service: string;
  title: string;
  meta: string;
  amount?: string;
  status: "completed" | "ongoing" | "scheduled";
  time: string;
};

export const activity: ActivityItem[] = [
  { id: "a1", service: "transport", title: "Cab to Indiranagar", meta: "Sedan · 4.9★", amount: "$12.40", status: "completed", time: "2h ago" },
  { id: "a2", service: "groceries", title: "Weekly essentials", meta: "32 items", amount: "$84.20", status: "ongoing", time: "Arriving 6:40pm" },
  { id: "a3", service: "health", title: "Dr. Mehta — Cardiology", meta: "Apollo Clinic", status: "scheduled", time: "Tomorrow, 11:00" },
  { id: "a4", service: "finance", title: "Electricity bill", meta: "BESCOM", amount: "$48.00", status: "completed", time: "Yesterday" },
  { id: "a5", service: "food", title: "Pizza & wings", meta: "Toscano", amount: "$26.80", status: "completed", time: "Yesterday" },
];

export type NotificationItem = {
  id: string;
  type: "info" | "success" | "warning";
  title: string;
  body: string;
  time: string;
};

export const notifications: NotificationItem[] = [
  { id: "n1", type: "success", title: "Cab arriving", body: "Toyota Etios · KA-05-MN-1284 · 3 min away", time: "Now" },
  { id: "n2", type: "info", title: "Lab results ready", body: "Your blood report from Apollo is available.", time: "12m" },
  { id: "n3", type: "warning", title: "Bill due in 2 days", body: "Internet — $42.00. Auto-pay is off.", time: "1h" },
  { id: "n4", type: "info", title: "Smart suggestion", body: "Skip traffic — leave for the airport by 5:20pm.", time: "2h" },
];

export type Provider = {
  id: string;
  name: string;
  service: string;
  rating: number;
  price: string;
  eta: string;
  badge?: string;
};

export const providers: Provider[] = [
  { id: "p1", name: "SwiftCab Sedan", service: "transport", rating: 4.9, price: "$11.20", eta: "4 min", badge: "Fastest" },
  { id: "p2", name: "MetroGo Premium", service: "transport", rating: 4.7, price: "$9.80", eta: "7 min", badge: "Cheapest" },
  { id: "p3", name: "EcoRide Electric", service: "transport", rating: 4.8, price: "$10.40", eta: "6 min", badge: "Greenest" },
];

export const user = {
  name: "Aarav Sharma",
  handle: "@aarav",
  city: "Bengaluru",
  initials: "AS",
  level: "Nexus Gold",
};
