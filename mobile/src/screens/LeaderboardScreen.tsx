import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'Leaderboard'>;

interface LeaderboardEntry {
  posicion: number;
  usuario_id: string;
  nombre: string;
  foto_url: string | null;
  promedio_global: number;
  promedio_juego: number;
  promedio_puntualidad: number;
  promedio_actitud: number;
  total_calificaciones: number;
}

export const LeaderboardScreen: React.FC<Props> = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stats/leaderboard');
      setLeaderboard(res.data.leaderboard || []);
    } catch (_err) {
      console.log('Error fetching leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getMedal = (pos: number) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `#${pos}`;
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => {
    const isTop3 = item.posicion <= 3;

    return (
      <View style={[styles.playerCard, isTop3 && styles.top3Card]}>
        <Text style={[styles.medalText, isTop3 && styles.top3Medal]}>
          {getMedal(item.posicion)}
        </Text>

        <Image
          source={{ uri: item.foto_url || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />

        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.nombre}</Text>
          <Text style={styles.evalCount}>
            {item.total_calificaciones} {item.total_calificaciones === 1 ? 'partido calificado' : 'partidos calificados'}
          </Text>
          <View style={styles.subScores}>
            <Text style={styles.subScoreText}>⚽ {item.promedio_juego.toFixed(1)}</Text>
            <Text style={styles.subScoreText}>⏰ {item.promedio_puntualidad.toFixed(1)}</Text>
            <Text style={styles.subScoreText}>🤝 {item.promedio_actitud.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.overallScore}>{item.promedio_global.toFixed(1)}</Text>
          <Text style={styles.starText}>⭐</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Top 10 Deportistas Destacados</Text>
        <Text style={styles.headerSub}>Basado en evaluaciones de juego, puntualidad y actitud (HU-28)</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
      ) : leaderboard.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aún no hay suficientes calificaciones</Text>
          <Text style={styles.emptySub}>¡Juega partidos y califica a tus compañeros para ingresar al ranking!</Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.usuario_id}
          renderItem={renderLeaderboardItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchLeaderboard();
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
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  top3Card: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  medalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    width: 36,
    textAlign: 'center',
  },
  top3Medal: {
    fontSize: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  evalCount: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  subScores: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  subScoreText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'center',
    marginLeft: 8,
  },
  overallScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  starText: {
    fontSize: 12,
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
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
