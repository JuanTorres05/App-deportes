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

type Props = NativeStackScreenProps<MainStackParamList, 'TournamentDetail'>;

interface RegisteredTeam {
  equipo_id: string;
  equipo_nombre: string;
  deporte: string | null;
  capitan_nombre: string;
  inscrito_en: string;
}

interface TournamentDetail {
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

interface UserTeam {
  id: string;
  nombre: string;
}

export const TournamentDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { tournamentId } = route.params;
  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const fetchDetailAndUserTeams = async () => {
    try {
      setLoading(true);
      const [tRes, uRes] = await Promise.all([
        api.get(`/tournaments/${tournamentId}`),
        api.get('/teams'),
      ]);
      setTournament(tRes.data.tournament);
      const myTeams = uRes.data.teams || [];
      setUserTeams(myTeams);
      if (myTeams.length > 0) setSelectedTeamId(myTeams[0].id);
    } catch (_err) {
      Alert.alert('Error', 'No se pudo cargar el detalle del torneo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailAndUserTeams();
  }, [tournamentId]);

  const handleRegisterTeam = async () => {
    if (!selectedTeamId) {
      Alert.alert('Error', 'Debes crear o seleccionar un equipo para inscribirte');
      return;
    }

    try {
      setRegistering(true);
      const res = await api.post(`/tournaments/${tournamentId}/register-team`, {
        equipo_id: selectedTeamId,
      });

      Alert.alert('¡Inscripción Exitosa!', res.data.message);
      setTournament(res.data.tournament);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo inscribir al equipo');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Torneo no encontrado</Text>
      </View>
    );
  }

  const isFull = tournament.equipos.length >= tournament.cupo_maximo;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.tournTitle}>{tournament.nombre}</Text>
        <Text style={styles.detailText}>⚽ Deporte: {tournament.deporte}</Text>
        <Text style={styles.detailText}>📍 Organizador: {tournament.organizador_nombre}</Text>
        <Text style={styles.detailText}>📅 Fecha de Inicio: {tournament.fecha_inicio}</Text>
        <Text style={styles.detailText}>💵 Inscripción: ${tournament.precio_inscripcion} / equipo</Text>
        <Text style={styles.slotsText}>
          🏆 Equipos Confirmados: {tournament.equipos.length} de {tournament.cupo_maximo}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.bracketBtn}
        onPress={() => navigation.navigate('TournamentBracket', { tournamentId: tournament.id })}
      >
        <Text style={styles.bracketBtnText}>🌳 Ver Cuadro de Brackets y Resultados (HU-25)</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Inscribir mi Equipo (HU-24)</Text>
      {isFull ? (
        <View style={styles.fullBadge}>
          <Text style={styles.fullBadgeText}>🔒 CUPO COMPLETO PARA ESTE TORNEO</Text>
        </View>
      ) : userTeams.length === 0 ? (
        <View style={styles.noTeamCard}>
          <Text style={styles.noTeamText}>No tienes ningún equipo registrado.</Text>
          <Text style={styles.noTeamSub}>Crea un equipo en "Mis Equipos" para inscribirte.</Text>
        </View>
      ) : (
        <View style={styles.registerCard}>
          <Text style={styles.label}>Selecciona tu Equipo:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamSelector}>
            {userTeams.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.teamChip, selectedTeamId === t.id && styles.teamChipActive]}
                onPress={() => setSelectedTeamId(t.id)}
              >
                <Text style={[styles.teamChipText, selectedTeamId === t.id && styles.teamChipTextActive]}>
                  {t.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.registerBtn, registering && styles.disabledBtn]}
            onPress={handleRegisterTeam}
            disabled={registering}
          >
            {registering ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerBtnText}>Inscribir Equipo Seleccionado</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Equipos Inscritos ({tournament.equipos.length})</Text>
      {tournament.equipos.map((e, idx) => (
        <View key={e.equipo_id} style={styles.teamRow}>
          <Text style={styles.teamIndex}>{idx + 1}.</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.registeredTeamName}>{e.equipo_nombre}</Text>
            <Text style={styles.registeredCaptain}>Capitán: {e.capitan_nombre}</Text>
          </View>
        </View>
      ))}
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
  tournTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 15,
    color: '#374151',
  },
  slotsText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    marginTop: 8,
  },
  bracketBtn: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  bracketBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  fullBadge: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  fullBadgeText: {
    color: '#991B1B',
    fontWeight: 'bold',
  },
  noTeamCard: {
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  noTeamText: {
    fontWeight: 'bold',
    color: '#92400E',
  },
  noTeamSub: {
    fontSize: 13,
    color: '#B45309',
  },
  registerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  teamSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  teamChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  teamChipActive: {
    backgroundColor: '#10B981',
  },
  teamChipText: {
    color: '#374151',
    fontWeight: '600',
  },
  teamChipTextActive: {
    color: '#FFFFFF',
  },
  registerBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  teamIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    width: 28,
  },
  registeredTeamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  registeredCaptain: {
    fontSize: 12,
    color: '#6B7280',
  },
});
