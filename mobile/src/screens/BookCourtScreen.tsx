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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'BookCourt'>;

interface OccupiedSlot {
  hora_inicio: string;
  hora_fin: string;
}

const TIME_SLOTS = [
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
  { start: '18:00', end: '19:00' },
  { start: '19:00', end: '20:00' },
  { start: '20:00', end: '21:00' },
  { start: '21:00', end: '22:00' },
];

export const BookCourtScreen: React.FC<Props> = ({ route, navigation }) => {
  const { courtId, courtName } = route.params;
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);

  const [checking, setChecking] = useState(false);
  const [booking, setBooking] = useState(false);

  const fetchAvailability = async () => {
    try {
      setChecking(true);
      const res = await api.get('/reservas/availability', {
        params: { cancha_id: courtId, fecha },
      });
      setOccupiedSlots(res.data.occupiedSlots || []);
    } catch (_err) {
      console.log('Error checking availability');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [fecha, courtId]);

  const isSlotOccupied = (start: string, end: string) => {
    return occupiedSlots.some((occ) => occ.hora_inicio < end && start < occ.hora_fin);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('Error', 'Selecciona un turno de horario disponible');
      return;
    }

    try {
      setBooking(true);
      await api.post('/reservas', {
        cancha_id: courtId,
        fecha,
        hora_inicio: selectedSlot.start,
        hora_fin: selectedSlot.end,
      });

      Alert.alert('¡Reserva Confirmada!', `Has reservado ${courtName || 'la cancha'} para el ${fecha} de ${selectedSlot.start} a ${selectedSlot.end} hs.`, [
        { text: 'Ver Mis Reservas', onPress: () => navigation.navigate('MyBookings') },
      ]);
    } catch (err: any) {
      Alert.alert('Error al reservar', err.response?.data?.message || 'No se pudo procesar la reserva');
    } finally {
      setBooking(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.courtHeader}>Cancha: {courtName || 'Seleccionada'}</Text>

      <Text style={styles.sectionTitle}>1. Selecciona la Fecha (YYYY-MM-DD):</Text>
      <TextInput
        style={styles.input}
        value={fecha}
        onChangeText={setFecha}
        placeholder="YYYY-MM-DD"
      />

      <View style={styles.slotHeaderRow}>
        <Text style={styles.sectionTitle}>2. Selecciona un Turno Horario:</Text>
        {checking && <ActivityIndicator size="small" color="#10B981" />}
      </View>

      <View style={styles.slotsGrid}>
        {TIME_SLOTS.map((slot) => {
          const occupied = isSlotOccupied(slot.start, slot.end);
          const isSelected = selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;

          return (
            <TouchableOpacity
              key={slot.start}
              style={[
                styles.slotBtn,
                occupied && styles.slotOccupied,
                isSelected && styles.slotSelected,
              ]}
              disabled={occupied}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text
                style={[
                  styles.slotText,
                  occupied && styles.slotOccupiedText,
                  isSelected && styles.slotSelectedText,
                ]}
              >
                {slot.start} - {slot.end}
              </Text>
              <Text style={styles.slotSubText}>
                {occupied ? 'Ocupado' : isSelected ? 'Seleccionado' : 'Disponible'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.confirmBtn, (!selectedSlot || booking) && styles.disabledBtn]}
        disabled={!selectedSlot || booking}
        onPress={handleConfirmBooking}
      >
        {booking ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.confirmBtnText}>Confirmar Reserva en Tiempo Real</Text>
        )}
      </TouchableOpacity>
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
  courtHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  slotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  slotBtn: {
    width: '48%',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  slotOccupied: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  slotSelected: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  slotText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
  },
  slotOccupiedText: {
    color: '#991B1B',
  },
  slotSelectedText: {
    color: '#FFFFFF',
  },
  slotSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  confirmBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
