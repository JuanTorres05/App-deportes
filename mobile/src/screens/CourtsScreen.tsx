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
import * as Location from 'expo-location';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'Courts'>;

interface CourtItem {
  id: string;
  nombre: string;
  tipo: string;
  precio_hora: number;
  centro_nombre: string;
  distancia_km: number;
  latitude: number | null;
  longitude: number | null;
}

const SPORTS = ['TODOS', 'FUTBOL', 'PADEL'];

export const CourtsScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedSport, setSelectedSport] = useState('TODOS');
  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchUserLocationAndCourts = async () => {
    try {
      setLoading(true);
      let currentCoords = location;

      if (!currentCoords) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          currentCoords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setLocation(currentCoords);
        } else {
          // Fallback coordinates (Buenos Aires Obelisco for testing)
          currentCoords = { latitude: -34.6037, longitude: -58.3816 };
          setLocation(currentCoords);
        }
      }

      const params: { latitude?: number; longitude?: number; radiusKm: number; tipo?: string } = {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        radiusKm: 15,
      };

      if (selectedSport !== 'TODOS') {
        params.tipo = selectedSport;
      }

      const res = await api.get('/canchas/nearby', { params });
      setCourts(res.data.courts || []);
    } catch (_err) {
      console.log('Error fetching nearby courts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserLocationAndCourts();
  }, [selectedSport]);

  const renderCourtCard = ({ item }: { item: CourtItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CourtDetail', { courtId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.courtTitle}>{item.nombre}</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.tipo}</Text>
        </View>
      </View>
      <Text style={styles.centerName}>📍 {item.centro_nombre}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.priceText}>💲 ${item.precio_hora} / hora</Text>
        <Text style={styles.distanceText}>📍 {item.distancia_km} km de distancia</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Deporte:</Text>
        <View style={styles.chipGroup}>
          {SPORTS.map((sp) => (
            <TouchableOpacity
              key={sp}
              style={[styles.chip, selectedSport === sp && styles.chipActive]}
              onPress={() => setSelectedSport(sp)}
            >
              <Text style={[styles.chipText, selectedSport === sp && styles.chipTextActive]}>{sp}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
      ) : courts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No hay canchas disponibles cercanas</Text>
          <Text style={styles.emptySub}>No se encontraron canchas en el radio de búsqueda.</Text>
        </View>
      ) : (
        <FlatList
          data={courts}
          keyExtractor={(item) => item.id}
          renderItem={renderCourtCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchUserLocationAndCourts();
              }}
              colors={['#10B981']}
            />
          }
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
  filterSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#10B981',
  },
  chipText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#FFFFFF',
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courtTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  typeBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: 'bold',
  },
  centerName: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  priceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10B981',
  },
  distanceText: {
    fontSize: 13,
    color: '#6B7280',
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
