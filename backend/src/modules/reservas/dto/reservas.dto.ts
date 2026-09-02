import { z } from 'zod';

export const createReservaSchema = z.object({
  cancha_id: z.string().uuid('ID de cancha inválido'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
}).refine((data) => data.hora_inicio < data.hora_fin, {
  message: 'La hora de inicio debe ser anterior a la hora de fin',
});

export const availabilityQuerySchema = z.object({
  cancha_id: z.string().uuid('ID de cancha inválido'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
});

export type CreateReservaDto = z.infer<typeof createReservaSchema>;
export type AvailabilityQueryDto = z.infer<typeof availabilityQuerySchema>;
