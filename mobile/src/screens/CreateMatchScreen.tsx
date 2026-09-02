import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateMatch'>;

const SPORTS = ['FUTBOL', 'PADEL', 'TENIS', 'BASKETBALL'];
const LEVELS = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'LIBRE'];

export const CreateMatchScreen: React.FC<Props> = ({ navigation }) => {
  const [deporte, setDeporte] = useState('FUTBOL');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState('19:00');
  const [horaFin, setHoraFin] = useState('20:00');
  const [nivelRequerido, setNivelRequerido] = useState('INTERMEDIO');
  const [loading, setLoading] = useState(false);

  const handleCreateMatch = async () => {
    if (!deporte) {
      Alert.alert('Error', 'Por favor selecciona un deporte');
      return;
    }

    try {
      setLoading(true);
      await api.post('/matches', {
        deporte,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        nivel_requerido: nivelRequerido,
      });

      Alert.alert('¡Éxito!', 'Partido organizado exitosamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'No se pudo crear el partido';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>1. Elige el Deporte</Text>
      <View style={styles.chipGroup}>
        {SPORTS.map((sp) => (
          <TouchableOpacity
            key={sp}
            style={[styles.chip, deporte === sp && styles.chipActive]}
            onPress={() => setDeporte(sp)}
          >
            <Text style={[styles.chipText, deporte === sp && styles.chipTextActive]}>{sp}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>2. Fecha y Horario</Text>
      <Text style={styles.label}>Fecha (YYYY-MM-DD):</Text>
      <TextInput
        style={styles.input}
        value={fecha}
        onChangeText={setFecha}
        placeholder="YYYY-MM-DD"
      />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Hora Inicio (HH:MM):</Text>
          <TextInput
            style={styles.input}
            value={horaInicio}
            onChangeText={setHoraInicio}
            placeholder="19:00"
          />
        </View>
        <View style={{ width: 16 }} />
        <View style={styles.flex1}>
          <Text style={styles.label}>Hora Fin (HH:MM):</Text>
          <TextInput
            style={styles.input}
            value={horaFin}
            onChangeText={setHoraFin}
            placeholder="20:00"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>3. Nivel Requerido</Text>
      <View style={styles.chipGroup}>
        {LEVELS.map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.chip, nivelRequerido === lvl && styles.chipActive]}
            onPress={() => setNivelRequerido(lvl)}
          >
            <Text style={[styles.chipText, nivelRequerido === lvl && styles.chipTextActive]}>{lvl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleCreateMatch}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Publicar Partido</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 10,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#10B981',
  },
  chipText: {
    color: '#374151',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
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
