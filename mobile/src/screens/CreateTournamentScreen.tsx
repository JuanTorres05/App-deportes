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

type Props = NativeStackScreenProps<MainStackParamList, 'CreateTournament'>;

const SPORTS = ['FUTBOL', 'PADEL', 'TENIS', 'BASKETBALL'];

export const CreateTournamentScreen: React.FC<Props> = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [deporte, setDeporte] = useState('FUTBOL');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [cupoMaximo, setCupoMaximo] = useState('8');
  const [precioInscripcion, setPrecioInscripcion] = useState('15000');
  const [loading, setLoading] = useState(false);

  const handleCreateTournament = async () => {
    if (!nombre.trim() || nombre.trim().length < 3) {
      Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres');
      return;
    }

    try {
      setLoading(true);
      await api.post('/tournaments', {
        nombre: nombre.trim(),
        deporte,
        fecha_inicio: fechaInicio,
        cupo_maximo: parseInt(cupoMaximo, 10) || 8,
        precio_inscripcion: parseFloat(precioInscripcion) || 0,
      });

      Alert.alert('¡Torneo Publicado!', 'El torneo está abierto para inscripciones de equipos', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo publicar el torneo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Nombre del Torneo</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej: Copa Apertura PlayConnect"
      />

      <Text style={styles.sectionTitle}>Deporte</Text>
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

      <Text style={styles.sectionTitle}>Fecha de Inicio (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={fechaInicio}
        onChangeText={setFechaInicio}
        placeholder="YYYY-MM-DD"
      />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.sectionTitle}>Cupo Máx. Equipos</Text>
          <TextInput
            style={styles.input}
            value={cupoMaximo}
            onChangeText={setCupoMaximo}
            keyboardType="numeric"
          />
        </View>
        <View style={{ width: 12 }} />
        <View style={styles.flex1}>
          <Text style={styles.sectionTitle}>Precio Inscripción ($)</Text>
          <TextInput
            style={styles.input}
            value={precioInscripcion}
            onChangeText={setPrecioInscripcion}
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleCreateTournament}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Publicar Torneo Publicamente</Text>
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
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
