import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'PublicProfile'>;

interface Profile {
  id: string;
  nombre: string;
  foto_url: string | null;
  estadisticas: {
    total_partidos: number;
    partidos_finalizados: number;
    total_calificaciones: number;
    promedio_juego: number;
    promedio_puntualidad: number;
    promedio_actitud: number;
  };
  equipos: Array<{ id: string; nombre: string; deporte: string | null }>;
}

const RatingBar: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <View style={styles.ratingRow}>
    <Text style={styles.ratingLabel}>{label}</Text>
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${(value / 5) * 100}%` as any, backgroundColor: color }]} />
    </View>
    <Text style={styles.ratingValue}>{value.toFixed(1)}</Text>
  </View>
);

export const PublicProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/social/profile/${userId}`);
        setProfile(res.data.profile);
      } catch (_err) {
        Alert.alert('Error', 'No se pudo cargar el perfil del jugador');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleInviteToMatch = () => {
    navigation.navigate('CreateMatch');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Perfil no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Player Header */}
      <View style={styles.headerCard}>
        <Image
          source={{ uri: profile.foto_url || 'https://via.placeholder.com/120' }}
          style={styles.avatar}
        />
        <Text style={styles.playerName}>{profile.nombre}</Text>
        <Text style={styles.playerSub}>
          {profile.estadisticas.total_partidos} partidos · {profile.estadisticas.total_calificaciones} calificaciones
        </Text>

        <TouchableOpacity style={styles.inviteBtn} onPress={handleInviteToMatch}>
          <Text style={styles.inviteBtnText}>⚽ Invitar a un Partido</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile.estadisticas.total_partidos}</Text>
          <Text style={styles.statLabel}>Partidos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile.estadisticas.partidos_finalizados}</Text>
          <Text style={styles.statLabel}>Finalizados</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile.equipos.length}</Text>
          <Text style={styles.statLabel}>Equipos</Text>
        </View>
      </View>

      {/* Rating Section (HU-41) */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>⭐ Calificaciones Promedio</Text>
        <RatingBar
          label="🎮 Juego"
          value={profile.estadisticas.promedio_juego}
          color="#10B981"
        />
        <RatingBar
          label="⏰ Puntualidad"
          value={profile.estadisticas.promedio_puntualidad}
          color="#3B82F6"
        />
        <RatingBar
          label="😊 Actitud"
          value={profile.estadisticas.promedio_actitud}
          color="#8B5CF6"
        />
      </View>

      {/* Active Teams */}
      {profile.equipos.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🛡️ Equipos</Text>
          {profile.equipos.map((eq) => (
            <TouchableOpacity
              key={eq.id}
              style={styles.teamItem}
              onPress={() => navigation.navigate('TeamDetail', { teamId: eq.id })}
            >
              <Text style={styles.teamName}>{eq.nombre}</Text>
              <Text style={styles.teamDeporte}>{eq.deporte || 'Varios'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6B7280' },
  headerCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#374151',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  playerSub: { fontSize: 13, color: '#9CA3AF', marginBottom: 14 },
  inviteBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  inviteBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 1,
  },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingLabel: { fontSize: 13, color: '#374151', width: 100 },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: { height: '100%', borderRadius: 5 },
  ratingValue: { fontSize: 13, fontWeight: 'bold', color: '#111827', width: 30 },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  teamName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  teamDeporte: { fontSize: 12, color: '#10B981', fontWeight: '600' },
});
