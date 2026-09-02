import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'TeamChallenges'>;

interface ChallengeItem {
  id: string;
  equipo_retador_id: string;
  equipo_retador_nombre: string;
  capitan_retador_nombre: string;
  equipo_rival_nombre: string;
  deporte: string;
  fecha_propuesta: string;
  hora_propuesta: string;
  cancha_nombre: string;
  mensaje?: string;
  estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
  creado_en: string;
}

interface UserTeam {
  id: string;
  nombre: string;
  deporte: string | null;
}

export const TeamChallengesScreen: React.FC<Props> = () => {
  const [tab, setTab] = useState<'RECIBIDOS' | 'LANZAR'>('RECIBIDOS');
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [myTeams, setMyTeams] = useState<UserTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Form State
  const [rivalName, setRivalName] = useState('');
  const [deporte, setDeporte] = useState('FUTBOL');
  const [fechaPropuesta, setFechaPropuesta] = useState(new Date().toISOString().split('T')[0]);
  const [horaPropuesta, setHoraPropuesta] = useState('20:00');
  const [canchaNombre, setCanchaNombre] = useState('Centro Deportivo Central');
  const [mensaje, setMensaje] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chalRes, teamsRes] = await Promise.all([
        api.get('/challenges'),
        api.get('/teams'),
      ]);
      setChallenges(chalRes.data.challenges || []);
      const teams = teamsRes.data.teams || [];
      setMyTeams(teams);
      if (teams.length > 0 && !selectedTeamId) {
        setSelectedTeamId(teams[0].id);
      }
    } catch (_err) {
      console.log('Error fetching challenges');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRespond = async (id: string, respuesta: 'ACEPTADO' | 'RECHAZADO') => {
    try {
      const res = await api.put(`/challenges/${id}/respond`, { respuesta });
      Alert.alert('Listo', res.data.message);
      setChallenges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: respuesta } : c))
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo responder al reto');
    }
  };

  const handleCreateChallenge = async () => {
    if (!selectedTeamId) {
      Alert.alert('Error', 'Debes tener un equipo para lanzar un reto');
      return;
    }

    if (!rivalName.trim() || rivalName.trim().length < 2) {
      Alert.alert('Error', 'Ingresa el nombre del equipo rival');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/challenges', {
        equipo_retador_id: selectedTeamId,
        equipo_rival_nombre: rivalName.trim(),
        deporte,
        fecha_propuesta: fechaPropuesta,
        hora_propuesta: horaPropuesta,
        cancha_nombre: canchaNombre.trim(),
        mensaje: mensaje.trim() || undefined,
      });

      Alert.alert('¡Desafío Enviado!', res.data.message);
      setRivalName('');
      setMensaje('');
      setChallenges((prev) => [res.data.challenge, ...prev]);
      setTab('RECIBIDOS');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo enviar el desafío');
    } finally {
      setSubmitting(false);
    }
  };

  const renderChallengeCard = ({ item }: { item: ChallengeItem }) => {
    const isPending = item.estado === 'PENDIENTE';
    const isAccepted = item.estado === 'ACEPTADO';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.challengeTitle}>
              {item.equipo_retador_nombre} ⚔️ {item.equipo_rival_nombre}
            </Text>
            <Text style={styles.capText}>Capitán: {item.capitan_retador_nombre}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isAccepted ? styles.acceptedBadge : isPending ? styles.pendingBadge : styles.rejectedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isAccepted ? styles.acceptedText : isPending ? styles.pendingText : styles.rejectedText,
              ]}
            >
              {item.estado}
            </Text>
          </View>
        </View>

        <Text style={styles.detailText}>⚽ Deporte: {item.deporte}</Text>
        <Text style={styles.detailText}>📅 Fecha: {item.fecha_propuesta} a las {item.hora_propuesta} hrs</Text>
        <Text style={styles.detailText}>📍 Cancha: {item.cancha_nombre}</Text>
        {item.mensaje && <Text style={styles.messageBox}>💬 "{item.mensaje}"</Text>}

        {isPending && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => handleRespond(item.id, 'ACEPTADO')}
            >
              <Text style={styles.acceptBtnText}>✓ Aceptar Desafío</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handleRespond(item.id, 'RECHAZADO')}
            >
              <Text style={styles.rejectBtnText}>✕ Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'RECIBIDOS' && styles.tabBtnActive]}
          onPress={() => setTab('RECIBIDOS')}
        >
          <Text style={[styles.tabText, tab === 'RECIBIDOS' && styles.tabTextActive]}>
            Desafíos & Retos ({challenges.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'LANZAR' && styles.tabBtnActive]}
          onPress={() => setTab('LANZAR')}
        >
          <Text style={[styles.tabText, tab === 'LANZAR' && styles.tabTextActive]}>
            + Lanzar Reto (HU-35)
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'RECIBIDOS' ? (
        loading && !refreshing ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
        ) : challenges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No tienes desafíos pendientes</Text>
            <Text style={styles.emptySub}>
              Lanza un reto a otro equipo para organizar un partido competitivo.
            </Text>
          </View>
        ) : (
          <FlatList
            data={challenges}
            keyExtractor={(item) => item.id}
            renderItem={renderChallengeCard}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchData();
                }}
                colors={['#10B981']}
              />
            }
          />
        )
      ) : (
        <ScrollView contentContainerStyle={styles.formContent}>
          <Text style={styles.sectionTitle}>Selecciona tu Equipo Retador</Text>
          {myTeams.length === 0 ? (
            <View style={styles.noTeamCard}>
              <Text style={styles.noTeamText}>No tienes equipos creados.</Text>
              <Text style={styles.noTeamSub}>Crea un equipo en "Mis Equipos" para poder desafiar.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {myTeams.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.teamChip, selectedTeamId === t.id && styles.teamChipActive]}
                  onPress={() => setSelectedTeamId(t.id)}
                >
                  <Text
                    style={[
                      styles.teamChipText,
                      selectedTeamId === t.id && styles.teamChipTextActive,
                    ]}
                  >
                    {t.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={styles.label}>Nombre del Equipo Rival:</Text>
          <TextInput
            style={styles.input}
            value={rivalName}
            onChangeText={setRivalName}
            placeholder="Ej: Rayo FC / Guerreros del Pádel"
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Fecha Propuesta:</Text>
              <TextInput
                style={styles.input}
                value={fechaPropuesta}
                onChangeText={setFechaPropuesta}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={{ width: 10 }} />
            <View style={styles.flex1}>
              <Text style={styles.label}>Hora Propuesta:</Text>
              <TextInput
                style={styles.input}
                value={horaPropuesta}
                onChangeText={setHoraPropuesta}
                placeholder="HH:MM"
              />
            </View>
          </View>

          <Text style={styles.label}>Cancha Propuesta:</Text>
          <TextInput
            style={styles.input}
            value={canchaNombre}
            onChangeText={setCanchaNombre}
            placeholder="Ej: Cancha Sintética 1 - Centro Deportivo"
          />

          <Text style={styles.label}>Mensaje de Desafío (Opcional):</Text>
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            value={mensaje}
            onChangeText={setMensaje}
            placeholder="¿Listos para medir fuerzas este fin de semana?"
            multiline
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.disabledBtn]}
            onPress={handleCreateChallenge}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Enviar Desafío al Rival</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#10B981',
    fontWeight: 'bold',
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
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  challengeTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
  },
  capText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  acceptedBadge: {
    backgroundColor: '#D1FAE5',
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  pendingText: {
    color: '#D97706',
  },
  acceptedText: {
    color: '#059669',
  },
  rejectedText: {
    color: '#DC2626',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
  },
  messageBox: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#4B5563',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  teamChipTextActive: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noTeamCard: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noTeamText: {
    fontWeight: 'bold',
    color: '#92400E',
  },
  noTeamSub: {
    fontSize: 12,
    color: '#B45309',
  },
});
