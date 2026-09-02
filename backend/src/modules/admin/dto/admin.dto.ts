import { z } from 'zod';

export const blockCourtSlotSchema = z.object({
  cancha_id: z.string().uuid('ID de cancha inválido'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  motivo: z.string().min(3, 'Motivo requerido (ej: Mantenimiento de césped)'),
});

export type BlockCourtSlotDto = z.infer<typeof blockCourtSlotSchema>;
