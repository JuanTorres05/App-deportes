import { z } from 'zod';

export const createReportSchema = z.object({
  tipo: z.enum(['CONDUCTA', 'CANCHA', 'PAGO', 'TORNEO', 'OTRO']),
  asunto: z.string().min(4, 'El asunto debe tener al menos 4 caracteres'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  usuario_reportado_id: z.string().uuid().optional(),
});

export type CreateReportDto = z.infer<typeof createReportSchema>;
