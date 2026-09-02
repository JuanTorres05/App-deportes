import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'Teams'>;

interface TeamItem {
  id: string;
  nombre: string;
  deporte: string | null;
  foto_url: string | null;
  rol: string;
  total_miembros: number;
}

interface PendingInvitation {
  equipo_id: string;
  equipo_nombre: string;
  deporte: string | null;
  creador: { nombre: string };
  invitado_en: string;
}

export const TeamsScreen: React.FC<Props> = ({ navigation }) => {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTeamsData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teams');
      setTeams(res.data.teams || []);
      setPendingInvitations(res.data.pendingInvitations || []);
    } catch (_err) {
      console.log('Error fetching teams');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTeamsData();
    });
    return unsubscribe;
  }, [navigation]);

  const handleRespondInvitation = async (equipoId: string, aceptar: boolean) => {
    try {
      await api.put('/teams/respond', { equipo_id: equipoId, aceptar });
      Alert.alert('Éxito', aceptar ? 'Te has unido al equipo' : 'Invitación rechazada');
      fetchTeamsData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo procesar la invitación');
    }
  };

  const renderTeamItem = ({ item }: { item: TeamItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TeamDetail', { teamId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.teamTitle}>{item.nombre}</Text>
        <View style={[styles.roleBadge, item.rol === 'CAPITAN' ? styles.capitanBadge : styles.miembroBadge]}>
          <Text style={styles.roleBadgeText}>{item.rol}</Text>
        </View>
      </View>
      <Text style={styles.infoText}>⚽ Deporte: {item.deporte || 'No especificado'}</Text>
      <Text style={styles.infoText}>👥 Integrantes: {item.total_miembros}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateTeam')}
        >
          <Text style={styles.createButtonText}>+ Crear Nuevo Equipo</Text>
        </TouchableOpacity>
      </View>

      {pendingInvitations.length > 0 && (
        <View style={styles.invitationsSection}>
          <Text style={styles.sectionHeader}>Invitaciones Pendientes ({pendingInvitations.length})</Text>
          {pendingInvitations.map((inv) => (
            <View key={inv.equipo_id} style={styles.invitationCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.invTeamTitle}>{inv.equipo_nombre}</Text>
                <Text style={styles.invSub}>Invitado por {inv.creador.nombre}</Text>
              </View>
              <View style={styles.invActions}>
                <TouchableOpacity
                  style={[styles.invBtn, styles.acceptBtn]}
                  onPress={() => handleRespondInvitation(inv.equipo_id, true)}
                >
                  <Text style={styles.invBtnText}>Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.invBtn, styles.declineBtn]}
                  onPress={() => handleRespondInvitation(inv.equipo_id, false)}
                >
                  <Text style={[styles.invBtnText, { color: '#EF4444' }]}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.sectionHeader, { marginHorizontal: 16, marginTop: 12 }]}>Mis Equipos</Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 20 }} />
      ) : teams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No perteneces a ningún equipo</Text>
          <Text style={styles.emptySub}>¡Crea un nuevo equipo e invita a tus amigos!</Text>
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={renderTeamItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTeamsData} colors={['#10B981']} />}
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  invitationsSection: {
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FCD34D',
  },
  invitationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  invTeamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  invSub: {
    fontSize: 12,
    color: '#B45309',
  },
  invActions: {
    flexDirection: 'row',
    gap: 6,
  },
  invBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  declineBtn: {
    backgroundColor: '#FEE2E2',
  },
  invBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  capitanBadge: {
    backgroundColor: '#F59E0B',
  },
  miembroBadge: {
    backgroundColor: '#3B82F6',
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
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
