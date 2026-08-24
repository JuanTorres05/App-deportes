import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import { api } from '../services/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

interface NearbyPlayer {
  id: string;
  nombre: string;
  foto_url: string | null;
  deporte: string;
  posicion: string | null;
  nivel: string | null;
  distancia_km: number;
}

export const FindPlayersScreen: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('FUTBOL');
  const [isActive, setIsActive] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [permissionError, setPermissionError] = useState(false);

  const [players, setPlayers] = useState<NearbyPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    checkCurrentState();
  }, [selectedSport]);

  useEffect(() => {
    if (isActive && location) {
      fetchNearbyPlayers();
    }
  }, [selectedSport, isActive, radiusKm, location]);

  const checkCurrentState = async () => {
    try {
      const res = await api.get('/profile/me');
      const profile = res.data.profile;
      if (profile.radio_busqueda_km) setRadiusKm(profile.radio_busqueda_km);

      const sportProf = profile.perfiles_deportivos?.find(
        (sp: { deporte: string; activo?: boolean }) => sp.deporte.toUpperCase() === selectedSport.toUpperCase()
      );
      setIsActive(sportProf?.activo || false);
    } catch (_err) {
      console.log('Error checking initial profile state');
    }
  };

  const requestUserLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      setPermissionError(false);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError(true);
        Alert.alert(
          'Permiso de Ubicación Requedido',
          'Para encontrar jugadores cerca necesitas otorgar acceso a tu ubicación. Se usará una ubicación predeterminada para pruebas.'
        );
        // Fallback Obelisco Buenos Aires coordinates for testing
        const fallback = { latitude: -34.6037, longitude: -58.3816 };
        setLocation(fallback);
        return fallback;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(coords);
      return coords;
    } catch (_err) {
      setPermissionError(true);
      const fallback = { latitude: -34.6037, longitude: -58.3816 };
      setLocation(fallback);
      return fallback;
    }
  };

  const handleToggleActivation = async (value: boolean) => {
    try {
      setToggling(true);
      let currentCoords = location;

      if (value && !currentCoords) {
        currentCoords = await requestUserLocation();
      }

      const payload: { deporte: string; activo: boolean; latitude?: number; longitude?: number } = {
        deporte: selectedSport,
        activo: value,
      };

      if (currentCoords) {
        payload.latitude = currentCoords.latitude;
        payload.longitude = currentCoords.longitude;
      }

      await api.put('/profile/activation', payload);
      setIsActive(value);

      if (value) {
        Alert.alert('¡En Línea!', `Te has activado en ${selectedSport}. Ahora otros jugadores cerca podrán encontrarte.`);
        fetchNearbyPlayers();
      } else {
        setPlayers([]);
      }
    } catch (_err) {
      Alert.alert('Error', 'No se pudo cambiar el estado de activación');
    } finally {
      setToggling(false);
    }
  };

  const handleSelectRadius = async (r: number) => {
    setRadiusKm(r);
    try {
      await api.put('/profile/radius', { radio_busqueda_km: r });
    } catch (_err) {
      console.log('Error updating radius');
    }
  };

  const fetchNearbyPlayers = async () => {
    try {
      setLoading(true);
      const params: { deporte: string; radiusKm: number; latitude?: number; longitude?: number } = {
        deporte: selectedSport,
        radiusKm,
      };

      if (location) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
      }

      const res = await api.get('/profile/nearby', { params });
      setPlayers(res.data.players || []);
    } catch (_err) {
      console.log('Error fetching nearby players');
    } finally {
      setLoading(false);
    }
  };

  const renderPlayerCard = ({ item }: { item: NearbyPlayer }) => {
    const avatarUrl = item.foto_url
      ? item.foto_url.startsWith('http')
        ? item.foto_url
        : `${API_BASE_URL}${item.foto_url}`
      : null;

    return (
      <View style={styles.playerCard}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{item.nombre.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.nombre}</Text>
          <Text style={styles.playerMeta}>
            {item.deporte} • {item.nivel || 'Nivel No Especificado'}
          </Text>
          {item.posicion ? <Text style={styles.playerPosition}>Posición: {item.posicion}</Text> : null}
        </View>

        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>📍 a {item.distancia_km} km</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sport Tabs */}
      <View style={styles.sportsTabs}>
        {['FUTBOL', 'PADEL', 'TENIS'].map((sp) => (
          <TouchableOpacity
            key={sp}
            style={[styles.tab, selectedSport === sp && styles.tabActive]}
            onPress={() => setSelectedSport(sp)}
          >
            <Text style={[styles.tabText, selectedSport === sp && styles.tabTextActive]}>
              {sp}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Activation Banner Card */}
      <View style={styles.activationCard}>
        <View style={styles.activationRow}>
          <View style={styles.activationTextContainer}>
            <Text style={styles.activationTitle}>
              {isActive ? '🟢 Modo En Línea Activo' : '⚪ Modo Inactivo'}
            </Text>
            <Text style={styles.activationSub}>
              {isActive
                ? `Disponible para jugar ${selectedSport} en tu zona`
                : `Actívate para que otros deportistas te encuentren`}
            </Text>
          </View>

          {toggling ? (
            <ActivityIndicator color="#10B981" />
          ) : (
            <Switch
              value={isActive}
              onValueChange={handleToggleActivation}
              trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
              thumbColor={isActive ? '#10B981' : '#F3F4F6'}
            />
          )}
        </View>

        {permissionError && (
          <Text style={styles.permissionWarning}>
            ⚠️ Sin permiso de ubicación real. Usando coordenadas de prueba para búsqueda.
          </Text>
        )}

        {/* Radius Selector */}
        <View style={styles.radiusContainer}>
          <Text style={styles.radiusLabel}>Radio de búsqueda:</Text>
          <View style={styles.radiusPills}>
            {[1, 5, 10, 20].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.radiusPill, radiusKm === r && styles.radiusPillActive]}
                onPress={() => handleSelectRadius(r)}
              >
                <Text style={[styles.radiusPillText, radiusKm === r && styles.radiusPillTextActive]}>
                  {r} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Players List Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Jugadores Activos Cerca</Text>
        <TouchableOpacity onPress={fetchNearbyPlayers}>
          <Text style={styles.refreshText}>🔄 Actualizar</Text>
        </TouchableOpacity>
      </View>

      {!isActive ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyBoxTitle}>Estás Inactivo</Text>
          <Text style={styles.emptyBoxSub}>
            Activa el switch superior para compartir tu disponibilidad y ver jugadores en tu área.
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : players.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyBoxTitle}>Sin Jugadores Cercanos</Text>
          <Text style={styles.emptyBoxSub}>
            No hay otros jugadores activos de {selectedSport} dentro de {radiusKm} km en este momento.
          </Text>
        </View>
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayerCard}
          contentContainerStyle={styles.listContent}
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
  sportsTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#10B981',
  },
  activationCard: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  activationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activationTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  activationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  activationSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  permissionWarning: {
    fontSize: 12,
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  radiusContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radiusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  radiusPills: {
    flexDirection: 'row',
  },
  radiusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginLeft: 6,
    backgroundColor: '#F9FAFB',
  },
  radiusPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  radiusPillText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  radiusPillTextActive: {
    color: '#FFF',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  refreshText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  playerMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  playerPosition: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
    fontWeight: '600',
  },
  distanceBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  distanceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#047857',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  emptyBoxSub: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
  },
});
