import { z } from 'zod';

export const createTeamSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  deporte: z.string().optional(),
  foto_url: z.string().url('URL de foto inválida').optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  usuario_id: z.string().uuid('ID de usuario inválido').optional(),
}).refine((data) => data.email || data.usuario_id, {
  message: 'Debes proporcionar email o usuario_id para invitar',
});

export const respondInvitationSchema = z.object({
  equipo_id: z.string().uuid('ID de equipo inválido'),
  aceptar: z.boolean(),
});

export type CreateTeamDto = z.infer<typeof createTeamSchema>;
export type InviteMemberDto = z.infer<typeof inviteMemberSchema>;
export type RespondInvitationDto = z.infer<typeof respondInvitationSchema>;
