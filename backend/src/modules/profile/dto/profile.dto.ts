import { z } from 'zod';

export const updateProfileSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  foto_url: z.string().url('URL de foto inválida').optional().nullable(),
  radio_busqueda_km: z.number().int().min(1).max(50).optional(),
});

export const upsertSportSchema = z.object({
  deporte: z.string().min(2, 'El nombre del deporte es requerido'),
  posicion: z.string().optional().nullable(),
  nivel: z.string().optional().nullable(),
});

export const toggleActivationSchema = z.object({
  deporte: z.string().min(2, 'El nombre del deporte es requerido'),
  activo: z.boolean(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const updateRadiusSchema = z.object({
  radio_busqueda_km: z.number().int().min(1).max(50),
});

export const nearbyPlayersQuerySchema = z.object({
  deporte: z.string().min(1, 'El deporte es requerido'),
  latitude: z.string().transform(Number).optional(),
  longitude: z.string().transform(Number).optional(),
  radiusKm: z.string().transform(Number).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpsertSportDto = z.infer<typeof upsertSportSchema>;
export type ToggleActivationDto = z.infer<typeof toggleActivationSchema>;
export type UpdateLocationDto = z.infer<typeof updateLocationSchema>;
export type UpdateRadiusDto = z.infer<typeof updateRadiusSchema>;
