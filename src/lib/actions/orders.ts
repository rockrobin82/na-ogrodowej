"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, userHasApprovedPackage } from "@/lib/auth";
import { getAppSettings, isSeedDropOpen } from "@/lib/settings";
import type { CartItem } from "@/types/database";

export type ActionState = { error?: string; success?: string };

export async function submitOrderAction(
  items: CartItem[]
): Promise<ActionState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Musisz być zalogowany" };

  if (items.length === 0) {
    return { error: "Koszyk jest pusty" };
  }

  const hasApproved = await userHasApprovedPackage(profile.id);
  if (!hasApproved) {
    return {
      error:
        "Musisz mieć co najmniej jedną zatwierdzoną paczkę nasion, zanim złożysz zamówienie",
    };
  }

  const settings = await getAppSettings();
  if (!isSeedDropOpen(settings)) {
    return {
      error: `Zamówienia są dostępne od godziny ${settings.seed_drop_hour}:00`,
    };
  }

  const supabase = await createClient();

  for (const item of items) {
    if (item.quantity > settings.max_quantity_per_seed_per_user) {
      return {
        error: `Maksymalna ilość na rodzaj nasion: ${settings.max_quantity_per_seed_per_user}`,
      };
    }

    const { data: pkg } = await supabase
      .from("seed_packages")
      .select("quantity_available, status, user_id")
      .eq("id", item.seedPackageId)
      .single();

    if (!pkg || pkg.status !== "approved" || pkg.quantity_available < item.quantity) {
      return { error: `Brak wystarczającej ilości: ${item.plantName}` };
    }

    if (pkg.user_id === profile.id) {
      return { error: "Nie możesz zamawiać własnych nasion" };
    }

    const { data: userOrders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", profile.id);

    const orderIds = userOrders?.map((o) => o.id) ?? [];
    let alreadyOrdered = 0;

    if (orderIds.length > 0) {
      const { data: priorItems } = await supabase
        .from("order_items")
        .select("quantity")
        .eq("seed_package_id", item.seedPackageId)
        .in("order_id", orderIds);

      alreadyOrdered =
        priorItems?.reduce((sum, row) => sum + row.quantity, 0) ?? 0;
    }

    if (
      alreadyOrdered + item.quantity >
      settings.max_quantity_per_seed_per_user
    ) {
      return {
        error: `Przekroczono limit dla ${item.plantName} (łącznie z wcześniejszymi zamówieniami)`,
      };
    }
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: profile.id, status: "submitted" })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: orderError?.message ?? "Nie udało się utworzyć zamówienia" };
  }

  for (const item of items) {
    const { data: pkg } = await supabase
      .from("seed_packages")
      .select("quantity_available")
      .eq("id", item.seedPackageId)
      .single();

    if (!pkg || pkg.quantity_available < item.quantity) {
      return { error: `Brak wystarczającej ilości: ${item.plantName}` };
    }

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      seed_package_id: item.seedPackageId,
      quantity: item.quantity,
    });

    if (itemError) return { error: itemError.message };

    const { error: updateError } = await supabase
      .from("seed_packages")
      .update({
        quantity_available: pkg.quantity_available - item.quantity,
      })
      .eq("id", item.seedPackageId);

    if (updateError) return { error: updateError.message };
  }

  revalidatePath("/seeds/available");
  revalidatePath("/cart");
  revalidatePath("/dashboard");
  return { success: "Zamówienie zostało złożone" };
}

export async function getMyOrders() {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*, seed_packages(plant_name, variety))")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
