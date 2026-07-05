export type UserRole = "user" | "admin";
export type PackageStatus = "pending" | "approved" | "rejected";
export type OrderStatus =
  | "submitted"
  | "approved"
  | "packed"
  | "shipped"
  | "cancelled";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  address_line1: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  shipping_notes: string | null;
  created_at: string;
}

export interface AppSettings {
  id: number;
  seed_drop_hour: number;
  max_packages_per_user: number;
  max_quantity_per_seed_per_user: number;
  updated_at: string;
  updated_by: string | null;
}

export interface SeedPackage {
  id: string;
  user_id: string;
  plant_name: string;
  variety: string | null;
  quantity_total: number;
  quantity_available: number;
  description: string | null;
  status: PackageStatus;
  delivered_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, "full_name">;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  created_at: string;
  approved_at: string | null;
  packed_at: string | null;
  shipped_at: string | null;
  tracking_number: string | null;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  seed_package_id: string;
  quantity: number;
  created_at: string;
  seed_packages?: SeedPackage;
}

export interface CartItem {
  seedPackageId: string;
  plantName: string;
  variety: string | null;
  quantity: number;
  maxAvailable: number;
}
