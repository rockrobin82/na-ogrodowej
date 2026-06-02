"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { seedPackageSchema } from "@/lib/validators/schemas";

export type ActionState = { error?: string; success?: string };

export async function createSeedPackageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Musisz być zalogowany" };

  const parsed = seedPackageSchema.safeParse({
    plantName: formData.get("plantName"),
    variety: formData.get("variety"),
    quantity: formData.get("quantity"),
    description: formData.get("description"),
    deliveredAt: formData.get("deliveredAt"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" };
  }
  
  const supabase = await createClient();

  const { error } = await supabase.from("seed_packages").insert({
    user_id: profile.id,
    plant_name: parsed.data.plantName,
    variety: parsed.data.variety || null,
    quantity_total: parsed.data.quantity,
    quantity_available: 0,
    description: parsed.data.description || null,
    status: "pending",
    delivered_at: parsed.data.deliveredAt
      ? new Date(parsed.data.deliveredAt).toISOString()
      : null,
  });

  if (error) return { error: error.message };

  revalidatePath("/seeds/add");
  revalidatePath("/dashboard");
  return { success: "Paczka nasion została dodana i oczekuje na zatwierdzenie" };
}

export async function getMySeedPackages() {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("seed_packages")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getAvailableSeeds() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seed_packages")
    .select(`
      *,
      profiles!seed_packages_user_id_fkey(full_name)
    `)
    .eq("status", "approved")
    .gt("quantity_available", 0)
    .order("plant_name");

    console.log("AVAILABLE SEEDS:", data);
    console.log("AVAILABLE SEEDS ERROR:", error);

  return data ?? [];
}
