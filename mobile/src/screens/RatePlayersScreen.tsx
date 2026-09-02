import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<MainStackParamList, 'RatePlayers'>;

interface PlayerToRate {
  id: string;
  nombre: string;
  foto_url: string | null;
}

export const RatePlayersScreen: React.FC<Props> = ({ route, navigation }) => {
  const { matchId } = route.params;
  const { user } = useAuth();
  const [players, setPlayers] = useState<PlayerToRate[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerToRate | null>(null);

  const [puntuacionJuego, setPuntuacionJuego] = useState(5);
  const [puntuacionPuntualidad, setPuntuacionPuntualidad] = useState(5);
  const [puntuacionActitud, setPuntuacionActitud] = useState(5);
  const [comentario, setComentario] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPendingPlayers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/matches/${matchId}`);
      const match = res.data.match;
      const otherPlayers = match.jugadores
        .filter((j: any) => j.usuario.id !== user?.id)
        .map((j: any) => j.usuario);

      // Check existing ratings submitted by user
      const ratingsRes = await api.get(`/ratings/match/${matchId}`);
      const ratedUserIds = new Set((ratingsRes.data.ratings || []).map((r: any) => r.usuario_calificado_id));

      const pending = otherPlayers.filter((p: any) => !ratedUserIds.has(p.id));
      setPlayers(pending);
      if (pending.length > 0) {
        setSelectedPlayer(pending[0]);
      }
    } catch (_err) {
      Alert.alert('Error', 'No se pudo cargar la lista de participantes a calificar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPlayers();
  }, [matchId]);

  const handleSubmitRating = async () => {
    if (!selectedPlayer) return;

    try {
      setSubmitting(true);
      await api.post('/ratings', {
        partido_id: matchId,
        usuario_calificado_id: selectedPlayer.id,
        puntuacion_juego: puntuacionJuego,
        puntuacion_puntualidad: puntuacionPuntualidad,
        puntuacion_actitud: puntuacionActitud,
        comentario: comentario.trim() || undefined,
      });

      Alert.alert('¡Calificado!', `Has calificado a ${selectedPlayer.nombre}`);

      // Filter out submitted player
      const remaining = players.filter((p) => p.id !== selectedPlayer.id);
      setPlayers(remaining);
      setSelectedPlayer(remaining.length > 0 ? remaining[0] : null);
      setComentario('');
      setPuntuacionJuego(5);
      setPuntuacionPuntualidad(5);
      setPuntuacionActitud(5);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo enviar la calificación');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (value: number, onChange: (v: number) => void) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)} style={styles.starTouch}>
          <Text style={[styles.starText, star <= value && styles.starActive]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (players.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>¡Todo Calificado!</Text>
        <Text style={styles.emptySub}>Has calificado a todos los deportistas de este partido.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver a Partidos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Selecciona al Deportista:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playerSelector}>
        {players.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.playerChip, selectedPlayer?.id === p.id && styles.playerChipActive]}
            onPress={() => setSelectedPlayer(p)}
          >
            <Text style={[styles.playerChipText, selectedPlayer?.id === p.id && styles.playerChipTextActive]}>
              {p.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedPlayer && (
        <View style={styles.ratingForm}>
          <Text style={styles.ratingTarget}>Calificando a: {selectedPlayer.nombre}</Text>

          <Text style={styles.ratingLabel}>⚽ Nivel de Juego (1-5): {puntuacionJuego}/5</Text>
          {renderStarRating(puntuacionJuego, setPuntuacionJuego)}

          <Text style={styles.ratingLabel}>⏰ Puntualidad (1-5): {puntuacionPuntualidad}/5</Text>
          {renderStarRating(puntuacionPuntualidad, setPuntuacionPuntualidad)}

          <Text style={styles.ratingLabel}>🤝 Actitud / Juego Limpio (1-5): {puntuacionActitud}/5</Text>
          {renderStarRating(puntuacionActitud, setPuntuacionActitud)}

          <Text style={styles.ratingLabel}>💬 Comentario (Opcional):</Text>
          <TextInput
            style={styles.commentInput}
            value={comentario}
            onChangeText={setComentario}
            placeholder="Ej: Excelente compañero y puntual..."
            multiline
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleSubmitRating}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Enviar Calificación</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  playerSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  playerChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  playerChipActive: {
    backgroundColor: '#10B981',
  },
  playerChipText: {
    color: '#374151',
    fontWeight: '600',
  },
  playerChipTextActive: {
    color: '#FFFFFF',
  },
  ratingForm: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingTarget: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  starTouch: {
    padding: 4,
  },
  starText: {
    fontSize: 28,
    color: '#D1D5DB',
  },
  starActive: {
    color: '#F59E0B',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
