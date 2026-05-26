import { createClient } from "@/lib/supabase/server";
import type { AppSettings } from "@/types/database";

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return {
      id: 1,
      seed_drop_hour: 18,
      max_packages_per_user: 5,
      max_quantity_per_seed_per_user: 3,
      updated_at: new Date().toISOString(),
      updated_by: null,
    };
  }

  return data;
}

export function isSeedDropOpen(settings: AppSettings): boolean {
  const currentHour = new Date().getHours();
  return currentHour >= settings.seed_drop_hour;
}
