export function serviceToModulePath(serviceId: string): string | null {
  switch (serviceId) {
    case "transport":
      return "/mod/cab";
    case "groceries":
      return "/mod/groceries";
    case "health":
      return "/mod/doctor";
    case "finance":
      return "/mod/bills";
    case "food":
      return "/mod/food";
    default:
      return null;
  }
}

export function quickActionToPath(service: string): string {
  if (service === "ai") return "/mod/smart-plan";
  const mod = serviceToModulePath(service);
  return mod ?? `/service/${service}`;
}
