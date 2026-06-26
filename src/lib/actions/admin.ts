"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getAllSeedPackages() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("seed_packages")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

import { getCurrentProfile } from "@/lib/auth";
import {
  adminApprovalSchema,
  adminSettingsSchema,
} from "@/lib/validators/schemas";
import { error } from "console";

export type ActionState = { error?: string; success?: string };

async function requireAdmin() {
  const profile = await getCurrentProfile();

  if (!profile) {
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

  const { data, error } = await supabase
    .from("seed_packages")
    .select("*, profiles!seed_packages_user_id_fkey(full_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getAllOrders() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "*, profiles(full_name), order_items(*, seed_packages(plant_name, variety))"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function getAdminDashboardStats() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ count: usersCount }, { count: pendingCount }, { data: latestUsers }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("seed_packages")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return {
    totalUsers: usersCount ?? 0,
    pendingSeedSubmissions: pendingCount ?? 0,
    latestUsers: latestUsers ?? [],
  };
}

export async function approvePackageDirect(formData: FormData) {
  const supabase = await createClient();

  const packageId = formData.get("packageId");

  if (!packageId) return;

  const { data: pkg } = await supabase
    .from("seed_packages")
    .select("*")
    .eq("id", packageId)
    .single();

  if (!pkg) return;

  await supabase
    .from("seed_packages")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      quantity_available: pkg.quantity_total,
    })
    .eq("id", packageId);

  revalidatePath("/admin/packages");
  revalidatePath("/seeds/available");
  revalidatePath("/dashboard");
}

export async function rejectPackageDirect(formData: FormData) {
  const supabase = await createClient();

  const packageId = formData.get("packageId");

  if (!packageId) return;

  await supabase
    .from("seed_packages")
    .update({
      status: "rejected",
    })
    .eq("id", packageId);

  revalidatePath("/admin/packages");
}
export async function deletePackageDirect(formData: FormData) {
  await requireAdmin();

  const supabase = await createClient();

  const packageId = formData.get("packageId") as string;

  if (!packageId) {
    return;
  }

  const { error } = await supabase
    .from("seed_packages")
    .delete()
    .eq("id", packageId);

  if (error) {
    console.error(error);
    return;
  }

  revalidatePath("/admin/packages");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/seeds/available");
}