import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<MainStackParamList, 'TeamDetail'>;

interface TeamMember {
  rol: string;
  estado: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    foto_url: string | null;
  };
}

interface TeamDetail {
  id: string;
  nombre: string;
  deporte: string | null;
  creado_por: string;
  creador: { nombre: string };
  miembros: TeamMember[];
}

export const TeamDetailScreen: React.FC<Props> = ({ route }) => {
  const { teamId } = route.params;
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchTeamDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/teams/${teamId}`);
      setTeam(res.data.team);
    } catch (_err) {
      Alert.alert('Error', 'No se pudo obtener el detalle del equipo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetail();
  }, [teamId]);

  const isCaptain = user?.id === team?.creado_por;

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Ingresa el correo electrónico del usuario');
      return;
    }

    try {
      setInviting(true);
      await api.post(`/teams/${teamId}/members`, { email: inviteEmail.trim() });
      Alert.alert('¡Invitación Enviada!', `Se envió la invitación a ${inviteEmail.trim()}`);
      setInviteEmail('');
      fetchTeamDetail();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo enviar la invitación');
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Equipo no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.teamTitle}>{team.nombre}</Text>
        <Text style={styles.deporteText}>⚽ Deporte: {team.deporte || 'No especificado'}</Text>
        <Text style={styles.captainText}>👑 Capitán: {team.creador.nombre}</Text>
      </View>

      {isCaptain && (
        <View style={styles.inviteCard}>
          <Text style={styles.sectionTitle}>Invitar Integrante por Email (HU-09)</Text>
          <View style={styles.inviteRow}>
            <TextInput
              style={styles.input}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.inviteBtn, inviting && styles.disabledBtn]}
              onPress={handleInviteMember}
              disabled={inviting}
            >
              {inviting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.inviteBtnText}>Invitar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Integrantes ({team.miembros.length})</Text>
      {team.miembros.map((m) => (
        <View key={m.usuario.id} style={styles.memberCard}>
          <Image
            source={{ uri: m.usuario.foto_url || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.memberName}>{m.usuario.nombre}</Text>
            <Text style={styles.memberEmail}>{m.usuario.email}</Text>
          </View>
          <View style={[styles.statusBadge, m.estado === 'ACEPTADO' ? styles.accepted : styles.pending]}>
            <Text style={styles.statusText}>{m.rol === 'CAPITAN' ? 'Capitán' : m.estado}</Text>
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
  },
  teamTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  deporteText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 2,
  },
  captainText: {
    fontSize: 14,
    color: '#6B7280',
  },
  inviteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  inviteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F9FAFB',
  },
  inviteBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  inviteBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  memberEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  accepted: {
    backgroundColor: '#D1FAE5',
  },
  pending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
});
