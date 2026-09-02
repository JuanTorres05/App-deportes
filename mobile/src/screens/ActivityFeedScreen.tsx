import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'ActivityFeed'>;

interface FeedItem {
  id: string;
  tipo: string;
  icono: string;
  titulo: string;
  subtitulo: string;
  fecha: string | null;
  ref_id: string;
}

const TYPE_COLORS: Record<string, string> = {
  PARTIDO: '#3B82F6',
  RESERVA: '#10B981',
  TORNEO: '#F59E0B',
  CALIFICACION: '#8B5CF6',
};

export const ActivityFeedScreen: React.FC<Props> = ({ navigation }) => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await api.get('/social/feed');
      setFeed(res.data.feed || []);
    } catch (_err) {
      console.log('Error fetching activity feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handlePress = (item: FeedItem) => {
    if (item.tipo === 'PARTIDO') {
      navigation.navigate('MatchDetail', { matchId: item.ref_id });
    } else if (item.tipo === 'RESERVA') {
      navigation.navigate('MyBookings');
    } else if (item.tipo === 'TORNEO') {
      navigation.navigate('TournamentDetail', { tournamentId: item.ref_id });
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderItem = ({ item }: { item: FeedItem }) => {
    const color = TYPE_COLORS[item.tipo] || '#6B7280';
    return (
      <TouchableOpacity style={styles.feedCard} onPress={() => handlePress(item)}>
        <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
          <Text style={styles.iconText}>{item.icono}</Text>
        </View>
        <View style={styles.feedInfo}>
          <Text style={styles.feedTitle}>{item.titulo}</Text>
          <Text style={styles.feedSub}>{item.subtitulo}</Text>
          {item.fecha && (
            <Text style={styles.feedDate}>{formatDate(item.fecha)}</Text>
          )}
        </View>
        <View style={[styles.typePill, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.typePillText, { color }]}>{item.tipo}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBanner}>
        <Text style={styles.headerTitle}>📰 Feed de Actividad</Text>
        <Text style={styles.headerSub}>Las últimas acciones de tu comunidad deportiva (HU-42)</Text>
      </View>

      {feed.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Sin actividad reciente</Text>
          <Text style={styles.emptySub}>
            Crea partidos, reserva canchas o inscríbete en torneos para ver actividad aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchFeed();
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
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBanner: {
    backgroundColor: '#1F2937',
    padding: 18,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  listContent: { padding: 12 },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: { fontSize: 22 },
  feedInfo: { flex: 1 },
  feedTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  feedSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  feedDate: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  typePillText: { fontSize: 10, fontWeight: 'bold' },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
});
