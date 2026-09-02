import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'Premium'>;

interface PremiumAccount {
  is_premium: boolean;
  plan: string;
  expira_en: string | null;
}

export const PremiumScreen: React.FC<Props> = ({ navigation }) => {
  const [account, setAccount] = useState<PremiumAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscription/status');
      setAccount(res.data);
    } catch (_err) {
      console.log('Error fetching subscription status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      const res = await api.post('/subscription/upgrade');
      Alert.alert('¡Pase PRO Activado!', res.data.message || 'Bienvenido a PlayConnect PRO');
      setAccount(res.data.account);
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo activar la suscripción Premium');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const isPro = account?.is_premium;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, isPro ? styles.heroProCard : styles.heroFreeCard]}>
        <Text style={styles.heroBadge}>{isPro ? '★ MIEMBRO PRO ACTIVO' : 'PLAN GRATUITO'}</Text>
        <Text style={styles.heroTitle}>{isPro ? 'PlayConnect PRO' : 'Pásate a PlayConnect PRO'}</Text>
        <Text style={styles.heroSub}>
          {isPro
            ? `Tu membresía está activa hasta ${new Date(account?.expira_en || '').toLocaleDateString()}`
            : 'Desbloquea todo el potencial de tu carrera deportiva amateur.'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Beneficios Exclusivos PRO (HU-20, HU-21)</Text>

      <View style={styles.benefitCard}>
        <Text style={styles.benefitIcon}>⭐</Text>
        <View style={styles.benefitCol}>
          <Text style={styles.benefitTitle}>Distintivo de Verificación PRO</Text>
          <Text style={styles.benefitSub}>Destaca tu perfil ante otros deportistas y capitanes.</Text>
        </View>
      </View>

      <View style={styles.benefitCard}>
        <Text style={styles.benefitIcon}>🛡️</Text>
        <View style={styles.benefitCol}>
          <Text style={styles.benefitTitle}>Creación de Equipos Ilimitados (HU-20)</Text>
          <Text style={styles.benefitSub}>Crea cuantos equipos necesites de Fútbol, Pádel y más.</Text>
        </View>
      </View>

      <View style={styles.benefitCard}>
        <Text style={styles.benefitIcon}>📡</Text>
        <View style={styles.benefitCol}>
          <Text style={styles.benefitTitle}>Mayor Alcance de Búsqueda (HU-21)</Text>
          <Text style={styles.benefitSub}>Amplía tu radio de localización hasta 50 km alrededor.</Text>
        </View>
      </View>

      <View style={styles.benefitCard}>
        <Text style={styles.benefitIcon}>📊</Text>
        <View style={styles.benefitCol}>
          <Text style={styles.benefitTitle}>Estadísticas Avanzadas de Desempeño</Text>
          <Text style={styles.benefitSub}>Graficos de rendimiento, historial y tendencias de partidos.</Text>
        </View>
      </View>

      {!isPro ? (
        <TouchableOpacity
          style={[styles.upgradeBtn, upgrading && styles.disabledBtn]}
          onPress={handleUpgrade}
          disabled={upgrading}
        >
          {upgrading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.upgradeBtnText}>Activar Pase PRO Ahora</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.activeContainer}>
          <Text style={styles.activeText}>✓ ¡Disfrutas de todos los beneficios PRO!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroFreeCard: {
    backgroundColor: '#374151',
  },
  heroProCard: {
    backgroundColor: '#7C3AED',
  },
  heroBadge: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  heroSub: {
    color: '#E5E7EB',
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  benefitIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  benefitCol: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  benefitSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  upgradeBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeContainer: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  activeText: {
    color: '#065F46',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
