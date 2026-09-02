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

type Props = NativeStackScreenProps<MainStackParamList, 'Tournaments'>;

interface RegisteredTeam {
  equipo_id: string;
  equipo_nombre: string;
  deporte: string | null;
  capitan_nombre: string;
}

interface TournamentItem {
  id: string;
  nombre: string;
  deporte: string;
  organizador_nombre: string;
  fecha_inicio: string;
  cupo_maximo: number;
  precio_inscripcion: number;
  estado: string;
  equipos: RegisteredTeam[];
}

export const TournamentsScreen: React.FC<Props> = ({ navigation }) => {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tournaments');
      setTournaments(res.data.tournaments || []);
    } catch (_err) {
      console.log('Error fetching tournaments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTournaments();
    });
    return unsubscribe;
  }, [navigation]);

  const renderTournamentCard = ({ item }: { item: TournamentItem }) => {
    const cuposRestantes = item.cupo_maximo - item.equipos.length;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('TournamentDetail', { tournamentId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.tournTitle}>{item.nombre}</Text>
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{item.deporte}</Text>
          </View>
        </View>

        <Text style={styles.orgText}>📍 Org: {item.organizador_nombre}</Text>
        <Text style={styles.infoText}>📅 Fecha Inicio: {item.fecha_inicio}</Text>
        <Text style={styles.infoText}>💵 Inscripción: ${item.precio_inscripcion} / equipo</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.slotsText}>
            🏆 Cupos: {item.equipos.length} / {item.cupo_maximo} ({cuposRestantes} disponibles)
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateTournament')}
        >
          <Text style={styles.createButtonText}>+ Publicar Nuevo Torneo</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
      ) : tournaments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No hay torneos abiertos en este momento</Text>
          <Text style={styles.emptySub}>¡Sé el primero en organizar un torneo público!</Text>
        </View>
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(item) => item.id}
          renderItem={renderTournamentCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchTournaments();
              }}
              colors={['#10B981']}
            />
          }
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
    elevation: 2,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tournTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  sportBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sportBadgeText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orgText: {
    fontSize: 14,
    color: '#4B5563',
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  slotsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  emptyContainer: {
    alignItems: 'center',
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
