import { z } from 'zod';

export const playerFilterSchema = z.object({
  query: z.string().optional(),
  deporte: z.string().optional(),
  nivel: z.string().optional(),
  posicion: z.string().optional(),
  solo_activos: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

export const courtFilterSchema = z.object({
  query: z.string().optional(),
  deporte: z.string().optional(),
  precio_max: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  superficie: z.string().optional(),
});

export type PlayerFilterDto = z.infer<typeof playerFilterSchema>;
export type CourtFilterDto = z.infer<typeof courtFilterSchema>;
