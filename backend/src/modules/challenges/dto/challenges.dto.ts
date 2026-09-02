import { z } from 'zod';

export const createChallengeSchema = z.object({
  equipo_retador_id: z.string().uuid('ID de equipo retador inválido'),
  equipo_rival_nombre: z.string().min(2, 'El nombre del rival debe tener al menos 2 caracteres'),
  deporte: z.string().min(2, 'Deporte requerido'),
  fecha_propuesta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  hora_propuesta: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  cancha_nombre: z.string().min(3, 'Nombre de cancha requerido'),
  mensaje: z.string().optional(),
});

export const respondChallengeSchema = z.object({
  respuesta: z.enum(['ACEPTADO', 'RECHAZADO']),
});

export type CreateChallengeDto = z.infer<typeof createChallengeSchema>;
export type RespondChallengeDto = z.infer<typeof respondChallengeSchema>;
