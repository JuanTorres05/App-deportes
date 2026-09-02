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
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<MainStackParamList, 'MatchCostSplit'>;

interface PlayerPayment {
  usuario: {
    id: string;
    nombre: string;
    foto_url: string | null;
  };
  cuota: number;
  pagado: boolean;
}

interface SplitData {
  partido_id: string;
  precio_total: number;
  cuota_individual: number;
  total_jugadores: number;
  recaudado: number;
  desglose: PlayerPayment[];
}

export const MatchCostSplitScreen: React.FC<Props> = ({ route }) => {
  const { matchId } = route.params;
  const { user } = useAuth();
  const [splitData, setSplitData] = useState<SplitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchCostSplit = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/matches/${matchId}/cost-split`);
      setSplitData(res.data);
    } catch (_err) {
      Alert.alert('Error', 'No se pudo obtener la división de costos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostSplit();
  }, [matchId]);

  const handleTogglePayment = async (targetUserId: string, currentPaid: boolean) => {
    try {
      setTogglingId(targetUserId);
      await api.put(`/matches/${matchId}/payment`, {
        usuario_id: targetUserId,
        pagado: !currentPaid,
      });
      fetchCostSplit();
    } catch (_err) {
      Alert.alert('Error', 'No se pudo actualizar el estado de pago');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!splitData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No hay datos disponibles</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>División de Pago de Cancha (HU-18)</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Precio Total Cancha:</Text>
          <Text style={styles.statValue}>${splitData.precio_total}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Jugadores Confirmados:</Text>
          <Text style={styles.statValue}>{splitData.total_jugadores}</Text>
        </View>
        <View style={styles.highlightRow}>
          <Text style={styles.highlightLabel}>Cuota por Jugador:</Text>
          <Text style={styles.highlightValue}>${splitData.cuota_individual}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Estado de Pago por Jugador</Text>

      {splitData.desglose.map((p) => {
        const isMe = p.usuario.id === user?.id;

        return (
          <View key={p.usuario.id} style={styles.playerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.playerName}>{p.usuario.nombre} {isMe ? '(Tú)' : ''}</Text>
              <Text style={styles.playerCuota}>Cuota: ${p.cuota}</Text>
            </View>

            <TouchableOpacity
              style={[styles.payBadge, p.pagado ? styles.paidBadge : styles.pendingBadge]}
              onPress={() => handleTogglePayment(p.usuario.id, p.pagado)}
              disabled={togglingId === p.usuario.id}
            >
              {togglingId === p.usuario.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.payBadgeText}>{p.pagado ? '✓ PAGADO' : 'PENDIENTE'}</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    marginTop: 8,
  },
  highlightLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  highlightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  playerCuota: {
    fontSize: 13,
    color: '#6B7280',
  },
  payBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  paidBadge: {
    backgroundColor: '#10B981',
  },
  pendingBadge: {
    backgroundColor: '#F59E0B',
  },
  payBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
