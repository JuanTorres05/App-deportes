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

type Props = NativeStackScreenProps<MainStackParamList, 'TournamentBracket'>;

interface BracketMatch {
  match_id: string;
  ronda: string;
  equipo_a: string | null;
  equipo_b: string | null;
  goles_a: number | null;
  goles_b: number | null;
  ganador: string | null;
  estado: 'PENDIENTE' | 'JUGADO';
}

interface Bracket {
  generado_en: string;
  rondas: Record<string, BracketMatch[]>;
  campeon: string | null;
}

const RONDA_ORDER = ['Cuartos de Final', 'Semifinales', 'Final'];

export const TournamentBracketScreen: React.FC<Props> = ({ route }) => {
  const { tournamentId } = route.params;
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Score entry state
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [golesA, setGolesA] = useState('');
  const [golesB, setGolesB] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBracket = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tournaments/${tournamentId}/bracket`);
      setBracket(res.data.bracket);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setBracket(null); // Not generated yet
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBracket();
  }, [tournamentId]);

  const handleGenerateBracket = async () => {
    try {
      setGenerating(true);
      const res = await api.post(`/tournaments/${tournamentId}/generate-bracket`);
      setBracket(res.data.bracket);
      Alert.alert('¡Cuadro Generado!', 'El árbol de eliminatoria está listo.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo generar el cuadro');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitScore = async (matchId: string) => {
    if (!golesA || !golesB) {
      Alert.alert('Error', 'Ingresa los goles de ambos equipos');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.put(`/tournaments/${tournamentId}/matches/${matchId}/score`, {
        goles_a: parseInt(golesA, 10),
        goles_b: parseInt(golesB, 10),
      });

      Alert.alert('¡Resultado Registrado!', res.data.message);
      setBracket(res.data.bracket);
      setEditingMatchId(null);
      setGolesA('');
      setGolesB('');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo registrar el resultado');
    } finally {
      setSubmitting(false);
    }
  };

  const renderMatchCard = (match: BracketMatch) => {
    const isEditing = editingMatchId === match.match_id;
    const isPendiente = match.estado === 'PENDIENTE';
    const hasTeams = match.equipo_a && match.equipo_b;

    return (
      <View key={match.match_id} style={styles.matchCard}>
        {/* Team A */}
        <View style={[styles.teamRow, match.ganador === match.equipo_a && styles.winnerRow]}>
          <Text style={[styles.teamName, match.ganador === match.equipo_a && styles.winnerText]}>
            {match.equipo_a || '— Por definir —'}
          </Text>
          {match.goles_a !== null && (
            <Text style={styles.score}>{match.goles_a}</Text>
          )}
        </View>

        {/* VS Divider */}
        <View style={styles.vsDivider}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Team B */}
        <View style={[styles.teamRow, match.ganador === match.equipo_b && styles.winnerRow]}>
          <Text style={[styles.teamName, match.ganador === match.equipo_b && styles.winnerText]}>
            {match.equipo_b || '— Por definir —'}
          </Text>
          {match.goles_b !== null && (
            <Text style={styles.score}>{match.goles_b}</Text>
          )}
        </View>

        {/* Score Entry */}
        {isPendiente && hasTeams && (
          <View style={styles.scoreSection}>
            {isEditing ? (
              <View>
                <View style={styles.scoreInputRow}>
                  <TextInput
                    style={styles.scoreInput}
                    value={golesA}
                    onChangeText={setGolesA}
                    keyboardType="numeric"
                    placeholder={match.equipo_a || 'Equipo A'}
                    maxLength={2}
                  />
                  <Text style={styles.scoreDash}>-</Text>
                  <TextInput
                    style={styles.scoreInput}
                    value={golesB}
                    onChangeText={setGolesB}
                    keyboardType="numeric"
                    placeholder={match.equipo_b || 'Equipo B'}
                    maxLength={2}
                  />
                </View>
                <View style={styles.scoreButtonRow}>
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={() => handleSubmitScore(match.match_id)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.confirmBtnText}>✓ Confirmar</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => { setEditingMatchId(null); setGolesA(''); setGolesB(''); }}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.enterScoreBtn}
                onPress={() => { setEditingMatchId(match.match_id); setGolesA(''); setGolesB(''); }}
              >
                <Text style={styles.enterScoreBtnText}>📝 Cargar Resultado</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {match.estado === 'JUGADO' && (
          <View style={styles.playedBadge}>
            <Text style={styles.playedBadgeText}>✓ JUGADO</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!bracket) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>🌳 Cuadro de Brackets (HU-25)</Text>
        <Text style={styles.emptySub}>
          El organizador del torneo aún no ha generado el árbol de eliminatorias.
        </Text>
        <TouchableOpacity
          style={[styles.generateBtn, generating && styles.disabledBtn]}
          onPress={handleGenerateBracket}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.generateBtnText}>Generar Cuadro de Eliminatorias</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {bracket.campeon && (
        <View style={styles.championCard}>
          <Text style={styles.championIcon}>🏆</Text>
          <Text style={styles.championTitle}>¡CAMPEÓN DEL TORNEO!</Text>
          <Text style={styles.championName}>{bracket.campeon}</Text>
        </View>
      )}

      {RONDA_ORDER.map((ronda) => {
        const matches = bracket.rondas[ronda];
        if (!matches) return null;
        return (
          <View key={ronda}>
            <View style={styles.rondaHeader}>
              <Text style={styles.rondaTitle}>{ronda}</Text>
            </View>
            {matches.map((match) => renderMatchCard(match))}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  generateBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledBtn: { opacity: 0.6 },
  generateBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  championCard: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  championIcon: { fontSize: 40, marginBottom: 8 },
  championTitle: { color: '#F59E0B', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  championName: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 22, marginTop: 4 },
  rondaHeader: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 10,
  },
  rondaTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  winnerRow: {
    backgroundColor: '#D1FAE5',
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  winnerText: {
    color: '#065F46',
    fontWeight: 'bold',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    minWidth: 24,
    textAlign: 'right',
  },
  vsDivider: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  vsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  scoreSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  scoreInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreDash: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  scoreButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#374151', fontWeight: '600' },
  enterScoreBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  enterScoreBtnText: { color: '#1D4ED8', fontWeight: '600' },
  playedBadge: {
    marginTop: 8,
    backgroundColor: '#D1FAE5',
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  playedBadgeText: {
    color: '#065F46',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
