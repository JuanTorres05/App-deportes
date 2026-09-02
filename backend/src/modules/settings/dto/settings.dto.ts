import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  radio_busqueda_km: z.number().int().min(1).max(50).optional(),
  notif_partidos: z.boolean().optional(),
  notif_equipos: z.boolean().optional(),
  notif_torneos: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(6, 'La contraseña actual debe tener al menos 6 caracteres'),
  new_password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

export type UpdatePreferencesDto = z.infer<typeof updatePreferencesSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
