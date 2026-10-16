import { jsonOk } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { getDashboardStats } from "@/services/stats.service";

export const GET = adminRoute("stats:read", async () => jsonOk(await getDashboardStats(), { headers: { "Cache-Control": "no-store" } }));
