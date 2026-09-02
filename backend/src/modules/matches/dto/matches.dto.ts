import { z } from 'zod';

export const createMatchSchema = z.object({
  deporte: z.string().min(2),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').optional(),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:MM)').optional(),
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:MM)').optional(),
  nivel_requerido: z.string().optional(),
});

export const addParticipantSchema = z.object({
  usuario_id: z.string().uuid('ID de usuario inválido'),
});

export const matchHistoryQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

export const sendMessageSchema = z.object({
  contenido: z.string().min(1, 'El mensaje no puede estar vacío').max(500, 'Máximo 500 caracteres'),
});

export const updatePaymentSchema = z.object({
  usuario_id: z.string().uuid('ID de usuario inválido'),
  pagado: z.boolean(),
});

export type CreateMatchDto = z.infer<typeof createMatchSchema>;
export type AddParticipantDto = z.infer<typeof addParticipantSchema>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type UpdatePaymentDto = z.infer<typeof updatePaymentSchema>;
