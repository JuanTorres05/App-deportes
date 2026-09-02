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
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'SportsCenterAdmin'>;

interface AdminDashboard {
  centro_nombre: string;
  ingresos_mes: number;
  total_reservas: number;
  tasa_ocupacion_porcentaje: number;
  canchas: Array<{
    id: string;
    nombre: string;
    deporte: string;
    precio_hora: number;
    reservas_hoy: number;
    estado: string;
  }>;
  bloqueos_mantenimiento: Array<{
    id: string;
    cancha_id: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    motivo: string;
  }>;
}

export const SportsCenterAdminScreen: React.FC<Props> = () => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Maintenance Block Form State
  const [selectedCanchaId, setSelectedCanchaId] = useState<string | null>(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('11:00');
  const [motivo, setMotivo] = useState('Mantenimiento y arreglo de césped');
  const [blocking, setBlocking] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/center/dashboard');
      setDashboard(res.data.dashboard);
      if (res.data.dashboard?.canchas?.length > 0 && !selectedCanchaId) {
        setSelectedCanchaId(res.data.dashboard.canchas[0].id);
      }
    } catch (_err) {
      console.log('Error fetching admin dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleBlockSlot = async () => {
    if (!selectedCanchaId) {
      Alert.alert('Error', 'Selecciona una cancha para bloquear');
      return;
    }

    if (!motivo.trim()) {
      Alert.alert('Error', 'Ingresa el motivo del bloqueo de mantenimiento');
      return;
    }

    try {
      setBlocking(true);
      const res = await api.post('/admin/center/block-slot', {
        cancha_id: selectedCanchaId,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        motivo: motivo.trim(),
      });

      Alert.alert('¡Horario Bloqueado!', res.data.message);
      fetchDashboard();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo bloquear el turno');
    } finally {
      setBlocking(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchDashboard();
          }}
          colors={['#10B981']}
        />
      }
    >
      {/* Center Header */}
      <View style={styles.headerCard}>
        <Text style={styles.centerBadge}>🏢 ADMINISTRACIÓN DE COMPLEJO</Text>
        <Text style={styles.centerTitle}>{dashboard?.centro_nombre}</Text>
        <Text style={styles.centerSub}>Panel de Control Operativo y Financiero (HU-37)</Text>
      </View>

      {/* KPI Cards Grid */}
      <Text style={styles.sectionTitle}>Métricas del Mes en Curso</Text>
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: '#10B981' }]}>
          <Text style={styles.kpiIcon}>💵</Text>
          <Text style={styles.kpiValue}>
            ${dashboard?.ingresos_mes.toLocaleString()}
          </Text>
          <Text style={styles.kpiLabel}>Ingresos por Reservas</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: '#3B82F6' }]}>
          <Text style={styles.kpiIcon}>📅</Text>
          <Text style={styles.kpiValue}>{dashboard?.total_reservas}</Text>
          <Text style={styles.kpiLabel}>Reservas Atendidas</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: '#8B5CF6' }]}>
          <Text style={styles.kpiIcon}>📊</Text>
          <Text style={styles.kpiValue}>
            {dashboard?.tasa_ocupacion_porcentaje}%
          </Text>
          <Text style={styles.kpiLabel}>Tasa de Ocupación</Text>
        </View>
      </View>

      {/* Courts Live Status */}
      <Text style={styles.sectionTitle}>
        Canchas Administradas ({dashboard?.canchas.length || 0})
      </Text>
      {dashboard?.canchas.map((c) => (
        <View key={c.id} style={styles.courtCard}>
          <View style={styles.courtHeader}>
            <Text style={styles.courtName}>{c.nombre}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{c.estado}</Text>
            </View>
          </View>
          <Text style={styles.courtInfo}>⚽ Deporte: {c.deporte}</Text>
          <Text style={styles.courtInfo}>💵 Tarifa: ${c.precio_hora.toLocaleString()} / hora</Text>
          <Text style={styles.courtInfo}>📋 Turnos confirmados: {c.reservas_hoy}</Text>
        </View>
      ))}

      {/* Maintenance Block Slot Form */}
      <Text style={styles.sectionTitle}>Bloqueo por Mantenimiento (HU-38)</Text>
      <View style={styles.formCard}>
        <Text style={styles.label}>Selecciona la Cancha:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {dashboard?.canchas.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, selectedCanchaId === c.id && styles.chipActive]}
              onPress={() => setSelectedCanchaId(c.id)}
            >
              <Text style={[styles.chipText, selectedCanchaId === c.id && styles.chipTextActive]}>
                {c.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Fecha:</Text>
        <TextInput
          style={styles.input}
          value={fecha}
          onChangeText={setFecha}
          placeholder="YYYY-MM-DD"
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Hora Inicio:</Text>
            <TextInput
              style={styles.input}
              value={horaInicio}
              onChangeText={setHoraInicio}
              placeholder="HH:MM"
            />
          </View>
          <View style={{ width: 10 }} />
          <View style={styles.flex1}>
            <Text style={styles.label}>Hora Fin:</Text>
            <TextInput
              style={styles.input}
              value={horaFin}
              onChangeText={setHoraFin}
              placeholder="HH:MM"
            />
          </View>
        </View>

        <Text style={styles.label}>Motivo del Bloqueo:</Text>
        <TextInput
          style={styles.input}
          value={motivo}
          onChangeText={setMotivo}
          placeholder="Ej: Mantenimiento de luminarias / Césped"
        />

        <TouchableOpacity
          style={[styles.blockBtn, blocking && styles.disabledBtn]}
          onPress={handleBlockSlot}
          disabled={blocking}
        >
          {blocking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.blockBtnText}>Bloquear Horario de Cancha</Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },
  centerBadge: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  centerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  centerSub: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    marginTop: 8,
  },
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
  },
  kpiIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  kpiLabel: {
    fontSize: 10,
    color: '#F9FAFB',
    textAlign: 'center',
    marginTop: 2,
  },
  courtCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  courtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  courtName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#065F46',
  },
  courtInfo: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#10B981',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  blockBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  blockBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
