import { z } from 'zod';

export const nearbyCourtsQuerySchema = z.object({
  latitude: z.string().transform(Number).optional(),
  longitude: z.string().transform(Number).optional(),
  radiusKm: z.string().transform(Number).default('10'),
  tipo: z.string().optional(),
});

export type NearbyCourtsQueryDto = z.infer<typeof nearbyCourtsQuerySchema>;
