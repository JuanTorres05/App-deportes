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

type Props = NativeStackScreenProps<MainStackParamList, 'CourtDetail'>;

interface CourtDetail {
  id: string;
  nombre: string;
  tipo: string;
  precio_hora: number;
  centro_deportivo: {
    id: string;
    nombre: string;
  };
}

export const CourtDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { courtId } = route.params;
  const [court, setCourt] = useState<CourtDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCourtDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/canchas/${courtId}`);
      setCourt(res.data.court);
    } catch (_err) {
      Alert.alert('Error', 'No se pudo obtener el detalle de la cancha');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourtDetail();
  }, [courtId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!court) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cancha no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.courtTitle}>{court.nombre}</Text>
        <Text style={styles.centerName}>📍 Centro Deportivo: {court.centro_deportivo.nombre}</Text>
        <Text style={styles.detailText}>⚽ Tipo de Deporte: {court.tipo}</Text>
        <Text style={styles.priceText}>💲 Precio: ${court.precio_hora} / hora</Text>
      </View>

      <TouchableOpacity
        style={styles.reserveButton}
        onPress={() => navigation.navigate('BookCourt', { courtId: court.id, courtName: court.nombre })}
      >
        <Text style={styles.reserveButtonText}>📅 Reservar Turno en esta Cancha</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reserveButton, { backgroundColor: '#3B82F6', marginTop: 12 }]}
        onPress={() => navigation.navigate('CreateMatch')}
      >
        <Text style={styles.reserveButtonText}>🏆 Organizar Partido en esta Cancha</Text>
      </TouchableOpacity>
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
    gap: 8,
  },
  courtTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B981',
  },
  centerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  detailText: {
    fontSize: 15,
    color: '#4B5563',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 4,
  },
  reserveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
