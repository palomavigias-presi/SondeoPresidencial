import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/constants";

export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
  fullName: string | null;
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    userId: profile.id,
    email: profile.email,
    role: profile.role as AdminRole,
    fullName: profile.full_name,
  };
}

export async function requireAdmin(
  minRole: AdminRole = "viewer",
): Promise<AdminSession> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHENTICATED");
  if (!hasRole(admin.role, minRole)) throw new Error("FORBIDDEN");
  return admin;
}

const ROLE_RANK: Record<AdminRole, number> = {
  viewer: 1,
  analyst: 2,
  campaign_manager: 3,
  super_admin: 4,
};

export function hasRole(actual: AdminRole, required: AdminRole): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}
