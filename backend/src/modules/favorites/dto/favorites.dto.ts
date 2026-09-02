import { z } from 'zod';

export const addFavoriteSchema = z.object({
  tipo: z.enum(['CANCHA', 'JUGADOR', 'TORNEO']),
  ref_id: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
});

export type AddFavoriteDto = z.infer<typeof addFavoriteSchema>;
