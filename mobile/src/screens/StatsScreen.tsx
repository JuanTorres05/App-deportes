import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'Stats'>;

interface RatingStats {
  total_calificaciones: number;
  promedio_juego: number;
  promedio_puntualidad: number;
  promedio_actitud: number;
  promedio_global: number;
}

interface MyStats {
  usuario: {
    id: string;
    nombre: string;
    foto_url: string | null;
  };
  calificaciones: RatingStats;
  partidos: {
    total_organizados: number;
    total_participados: number;
  };
  equipos: {
    total_creados: number;
    total_miembro: number;
  };
  deportes: string[];
}

export const StatsScreen: React.FC<Props> = ({ navigation }) => {
  const [stats, setStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stats/me');
      setStats(res.data.stats);
    } catch (_err) {
      console.log('Error fetching stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const renderRatingBar = (label: string, value: number, icon: string) => {
    const percentage = Math.min(100, (value / 5) * 100);

    return (
      <View style={styles.metricRow}>
        <View style={styles.metricLabelRow}>
          <Text style={styles.metricLabel}>
            {icon} {label}
          </Text>
          <Text style={styles.metricValue}>{value.toFixed(1)} / 5.0</Text>
        </View>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${percentage}%` }]} />
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const calif = stats?.calificaciones;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchStats();
          }}
          colors={['#10B981']}
        />
      }
    >
      {/* User Header */}
      <View style={styles.userCard}>
        <Image
          source={{ uri: stats?.usuario.foto_url || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{stats?.usuario.nombre}</Text>
          <Text style={styles.userBadge}>★ Calificación General</Text>
          <Text style={styles.overallScore}>
            {calif?.promedio_global.toFixed(1) || '0.0'} ⭐
          </Text>
          <Text style={styles.ratingsCount}>
            ({calif?.total_calificaciones || 0} evaluaciones recibidas)
          </Text>
        </View>
      </View>

      {/* Button to Leaderboard */}
      <TouchableOpacity
        style={styles.leaderboardBtn}
        onPress={() => navigation.navigate('Leaderboard')}
      >
        <Text style={styles.leaderboardBtnText}>🏆 Ver Tabla de Líderes Global (HU-28)</Text>
      </TouchableOpacity>

      {/* 3 Rating Criteria Breakdown */}
      <Text style={styles.sectionTitle}>Evaluación por Criterio (HU-27)</Text>
      <View style={styles.card}>
        {renderRatingBar('Nivel de Juego', calif?.promedio_juego || 0, '⚽')}
        {renderRatingBar('Puntualidad', calif?.promedio_puntualidad || 0, '⏰')}
        {renderRatingBar('Actitud Deportiva', calif?.promedio_actitud || 0, '🤝')}
      </View>

      {/* Match & Team Activity Summary */}
      <Text style={styles.sectionTitle}>Resumen de Actividad Deportiva</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats?.partidos.total_participados || 0}</Text>
          <Text style={styles.statLabel}>Partidos Jugados</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats?.partidos.total_organizados || 0}</Text>
          <Text style={styles.statLabel}>Organizados</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats?.equipos.total_miembro || 0}</Text>
          <Text style={styles.statLabel}>Equipos</Text>
        </View>
      </View>

      {/* Sports Profile */}
      {stats?.deportes && stats.deportes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Deportes Practicados</Text>
          <View style={styles.sportsRow}>
            {stats.deportes.map((d) => (
              <View key={d} style={styles.sportChip}>
                <Text style={styles.sportChipText}>{d}</Text>
              </View>
            ))}
          </View>
        </>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  userBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  overallScore: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 2,
  },
  ratingsCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  leaderboardBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 18,
  },
  leaderboardBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 14,
  },
  metricRow: {
    gap: 4,
  },
  metricLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  barBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  sportsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  sportChip: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sportChipText: {
    color: '#065F46',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
