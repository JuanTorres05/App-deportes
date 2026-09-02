import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'Matches'>;

export interface MatchItem {
  id: string;
  deporte: string;
  estado: string;
  fecha: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  nivel_requerido: string | null;
  organizador: {
    id: string;
    nombre: string;
    foto_url: string | null;
  };
  participantes?: Array<{ id: string; nombre: string; foto_url: string | null }>;
  puede_calificar?: boolean;
}

export const MatchesScreen: React.FC<Props> = ({ navigation }) => {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/matches/history');
      setMatches(res.data.matches || []);
    } catch (_err) {
      console.log('Error fetching matches history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMatches();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const renderStatusBadge = (estado: string) => {
    let color = '#3B82F6';
    let text = estado;
    if (estado === 'BUSCANDO_GENTE') { color = '#F59E0B'; text = 'Buscando Gente'; }
    else if (estado === 'COMPLETO') { color = '#10B981'; text = 'Completo'; }
    else if (estado === 'CONFIRMADO') { color = '#059669'; text = 'Confirmado'; }
    else if (estado === 'JUGADO') { color = '#6B7280'; text = 'Jugado'; }
    else if (estado === 'CALIFICADO') { color = '#8B5CF6'; text = 'Calificado'; }

    return (
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{text}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: MatchItem }) => {
    const fechaFormatted = item.fecha ? new Date(item.fecha).toLocaleDateString() : 'Sin fecha';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.sportTitle}>{item.deporte}</Text>
          {renderStatusBadge(item.estado)}
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.infoText}>📅 {fechaFormatted} {item.hora_inicio ? `• ${item.hora_inicio}` : ''}</Text>
          <Text style={styles.infoText}>👤 Org: {item.organizador?.nombre || 'Desconocido'}</Text>
          {item.nivel_requerido && (
            <Text style={styles.infoText}>⭐ Nivel: {item.nivel_requerido}</Text>
          )}
        </View>

        {item.puede_calificar && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => navigation.navigate('RatePlayers', { matchId: item.id })}
          >
            <Text style={styles.rateButtonText}>⭐ Calificar Jugadores</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateMatch')}
        >
          <Text style={styles.createButtonText}>+ Organizar Nuevo Partido</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
      ) : matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No tienes partidos programados</Text>
          <Text style={styles.emptySub}>¡Crea un nuevo partido para comenzar a invitar jugadores!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  topActions: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  createButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
  },
  rateButton: {
    marginTop: 12,
    backgroundColor: '#EEF2FF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  rateButtonText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
