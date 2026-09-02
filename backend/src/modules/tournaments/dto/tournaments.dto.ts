import { z } from 'zod';

export const createTournamentSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  deporte: z.string().min(2, 'Deporte requerido'),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  cupo_maximo: z.number().int().min(2, 'Mínimo 2 equipos').max(64, 'Máximo 64 equipos').default(8),
  precio_inscripcion: z.number().min(0).default(0),
});

export const registerTeamSchema = z.object({
  equipo_id: z.string().uuid('ID de equipo inválido'),
});

export type CreateTournamentDto = z.infer<typeof createTournamentSchema>;
export type RegisterTeamDto = z.infer<typeof registerTeamSchema>;
