import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<MainStackParamList, 'MatchDetail'>;

interface MatchDetail {
  id: string;
  deporte: string;
  estado: string;
  fecha: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  nivel_requerido: string | null;
  organizador_id: string;
  organizador: {
    id: string;
    nombre: string;
    foto_url: string | null;
  };
  jugadores: Array<{
    usuario: {
      id: string;
      nombre: string;
      foto_url: string | null;
    };
  }>;
}

export const MatchDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { matchId } = route.params;
  const { user } = useAuth();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/matches/${matchId}`);
      setMatch(res.data.match);
    } catch (_err) {
      Alert.alert('Error', 'No se pudo cargar el detalle del partido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [matchId]);

  const isOrganizer = user?.id === match?.organizador_id;
  const isParticipant = match?.jugadores?.some((j) => j.usuario.id === user?.id);

  const handleMarkAsPlayed = async () => {
    try {
      setActionLoading(true);
      await api.put(`/matches/${matchId}/mark-played`);
      Alert.alert('¡Partido Finalizado!', 'El partido se marcó como jugado. Ahora puedes calificar a los deportistas.');
      fetchDetail();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo cambiar el estado');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Partido no encontrado</Text>
      </View>
    );
  }

  const fechaFormatted = match.fecha ? new Date(match.fecha).toLocaleDateString() : 'Sin fecha';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.sportTitle}>{match.deporte}</Text>
        <Text style={styles.statusBadge}>Estado: {match.estado}</Text>
        <Text style={styles.detailText}>📅 Fecha: {fechaFormatted}</Text>
        <Text style={styles.detailText}>⏰ Horario: {match.hora_inicio || '--'} - {match.hora_fin || '--'}</Text>
        <Text style={styles.detailText}>⭐ Nivel: {match.nivel_requerido || 'Libre'}</Text>
        <Text style={styles.detailText}>👑 Organizador: {match.organizador.nombre}</Text>
      </View>

      <Text style={styles.sectionTitle}>Jugadores Confirmados ({match.jugadores.length})</Text>
      {match.jugadores.map((j) => (
        <View key={j.usuario.id} style={styles.playerCard}>
          <Image
            source={{ uri: j.usuario.foto_url || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <Text style={styles.playerName}>{j.usuario.nombre}</Text>
          {j.usuario.id === match.organizador_id && (
            <Text style={styles.orgTag}>Organizador</Text>
          )}
        </View>
      ))}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.playedButton, { backgroundColor: '#3B82F6' }]}
          onPress={() => navigation.navigate('MatchChat', { matchId: match.id })}
        >
          <Text style={styles.buttonText}>💬 Chat del Partido (HU-13)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playedButton, { backgroundColor: '#8B5CF6' }]}
          onPress={() => navigation.navigate('MatchCostSplit', { matchId: match.id })}
        >
          <Text style={styles.buttonText}>💵 Dividir Costo de Cancha (HU-18)</Text>
        </TouchableOpacity>

        {isOrganizer && match.estado !== 'JUGADO' && match.estado !== 'CALIFICADO' && (
          <TouchableOpacity
            style={styles.playedButton}
            onPress={handleMarkAsPlayed}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>✓ Marcar como Partido Jugado</Text>
            )}
          </TouchableOpacity>
        )}

        {(match.estado === 'JUGADO' || match.estado === 'CALIFICADO') && isParticipant && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => navigation.navigate('RatePlayers', { matchId: match.id })}
          >
            <Text style={styles.buttonText}>⭐ Calificar a los Jugadores</Text>
          </TouchableOpacity>
        )}
      </View>
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
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    gap: 6,
  },
  sportTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 15,
    color: '#374151',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    marginTop: 8,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  orgTag: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  actionsContainer: {
    marginTop: 24,
    gap: 12,
  },
  playedButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  rateButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
