import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Podaj poprawny adres e-mail"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Imię i nazwisko jest wymagane"),
  email: z.string().email("Podaj poprawny adres e-mail"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
});

export const seedPackageSchema = z.object({
  plantName: z.string().min(2, "Nazwa rośliny jest wymagana"),
  variety: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Ilość musi być większa od 0"),
  description: z.string().optional(),
  deliveredAt: z.string().optional(),
});

export const adminSettingsSchema = z.object({
  seedDropHour: z.coerce.number().int().min(0).max(23),
  maxPackagesPerUser: z.coerce.number().int().min(1),
  maxQuantityPerSeedPerUser: z.coerce.number().int().min(1),
});

export const adminApprovalSchema = z.object({
  packageId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  adminNotes: z.string().optional(),
});

export const adminOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["submitted", "approved", "packed", "shipped", "cancelled"]),
  trackingNumber: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SeedPackageInput = z.infer<typeof seedPackageSchema>;
