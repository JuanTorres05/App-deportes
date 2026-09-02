import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';

interface PremiumAccount {
  is_premium: boolean;
  plan: string;
  expira_en: string | null;
}

const subscriptionStore: Record<string, PremiumAccount> = {};

export class SubscriptionService {
  static async getSubscriptionStatus(userId: string): Promise<PremiumAccount> {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const sub = subscriptionStore[userId];
    if (!sub) {
      return {
        is_premium: false,
        plan: 'GRATUITO',
        expira_en: null,
      };
    }

    return sub;
  }

  static async upgradeToPremium(userId: string): Promise<PremiumAccount> {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // 30 days valid

    const updatedAccount: PremiumAccount = {
      is_premium: true,
      plan: 'PLAYCONNECT PRO',
      expira_en: expirationDate.toISOString(),
    };

    subscriptionStore[userId] = updatedAccount;
    return updatedAccount;
  }
}
