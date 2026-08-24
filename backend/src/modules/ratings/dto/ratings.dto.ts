import { z } from 'zod';

const scoreField = z.number().int().min(1, 'Mínimo 1').max(5, 'Máximo 5');

export const submitRatingSchema = z.object({
  partido_id: z.string().uuid('ID de partido inválido'),
  usuario_calificado_id: z.string().uuid('ID de usuario inválido'),
  puntuacion_juego: scoreField,
  puntuacion_puntualidad: scoreField,
  puntuacion_actitud: scoreField,
  comentario: z.string().max(500).optional(),
});

export type SubmitRatingDto = z.infer<typeof submitRatingSchema>;
