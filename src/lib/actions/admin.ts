"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import {
  adminApprovalSchema,
  adminSettingsSchema,
} from "@/lib/validators/schemas";

export type ActionState = { error?: string; success?: string };

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Brak uprawnień administratora");
  }
  return profile;
}

export async function approvePackageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const parsed = adminApprovalSchema.safeParse({
      packageId: formData.get("packageId"),
      status: formData.get("status"),
      adminNotes: formData.get("adminNotes"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" };
    }

    const supabase = await createClient();
    const { data: pkg } = await supabase
      .from("seed_packages")
      .select("*")
      .eq("id", parsed.data.packageId)
      .single();

    if (!pkg) return { error: "Paczka nie istnieje" };

    const updates =
      parsed.data.status === "approved"
        ? {
            status: "approved" as const,
            approved_at: new Date().toISOString(),
            approved_by: admin.id,
            quantity_available: pkg.quantity_total,
            admin_notes: parsed.data.adminNotes || null,
          }
        : {
            status: "rejected" as const,
            admin_notes: parsed.data.adminNotes || null,
          };

    const { error } = await supabase
      .from("seed_packages")
      .update(updates)
      .eq("id", parsed.data.packageId);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/seeds/available");
    return { success: "Status paczki został zaktualizowany" };
  } catch {
    return { error: "Brak uprawnień" };
  }
}

export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const parsed = adminSettingsSchema.safeParse({
      seedDropHour: formData.get("seedDropHour"),
      maxPackagesPerUser: formData.get("maxPackagesPerUser"),
      maxQuantityPerSeedPerUser: formData.get("maxQuantityPerSeedPerUser"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("app_settings")
      .update({
        seed_drop_hour: parsed.data.seedDropHour,
        max_packages_per_user: parsed.data.maxPackagesPerUser,
        max_quantity_per_seed_per_user: parsed.data.maxQuantityPerSeedPerUser,
        updated_by: admin.id,
      })
      .eq("id", 1);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    return { success: "Ustawienia zostały zapisane" };
  } catch {
    return { error: "Brak uprawnień" };
  }
}

export async function getPendingPackages() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("seed_packages")
    .select("*, profiles(full_name, email)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function getAllOrders() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "*, profiles(full_name, email), order_items(*, seed_packages(plant_name, variety))"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}
