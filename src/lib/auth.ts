import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function userHasApprovedPackage(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("seed_packages")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "approved");

  return (count ?? 0) > 0;
}
