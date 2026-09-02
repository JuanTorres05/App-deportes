import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'Favorites'>;

type FavoriteType = 'CANCHA' | 'JUGADOR' | 'TORNEO';

interface FavoriteItem {
  id: string;
  tipo: FavoriteType;
  ref_id: string;
  nombre: string;
  descripcion?: string;
  creado_en: string;
}

const TYPE_TABS: Array<{ key: FavoriteType; label: string; icon: string; color: string }> = [
  { key: 'CANCHA', label: 'Canchas', icon: '🏟️', color: '#10B981' },
  { key: 'JUGADOR', label: 'Jugadores', icon: '🏃', color: '#3B82F6' },
  { key: 'TORNEO', label: 'Torneos', icon: '🏆', color: '#F59E0B' },
];

export const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<FavoriteType>('CANCHA');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await api.get('/favorites');
      setFavorites(res.data.favorites || []);
    } catch (_err) {
      console.log('Error fetching favorites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemove = (item: FavoriteItem) => {
    Alert.alert(
      'Eliminar favorito',
      `¿Quitar "${item.nombre}" de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/favorites/${item.id}`);
              setFavorites((prev) => prev.filter((f) => f.id !== item.id));
            } catch (_err) {
              Alert.alert('Error', 'No se pudo eliminar el favorito');
            }
          },
        },
      ],
    );
  };

  const handleNavigate = (item: FavoriteItem) => {
    if (item.tipo === 'CANCHA') {
      navigation.navigate('CourtDetail', { courtId: item.ref_id });
    } else if (item.tipo === 'JUGADOR') {
      navigation.navigate('PublicProfile', { userId: item.ref_id });
    } else if (item.tipo === 'TORNEO') {
      navigation.navigate('TournamentDetail', { tournamentId: item.ref_id });
    }
  };

  const filtered = favorites.filter((f) => f.tipo === activeTab);
  const activeTabInfo = TYPE_TABS.find((t) => t.key === activeTab)!;

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity
      style={styles.favCard}
      onPress={() => handleNavigate(item)}
    >
      <View style={[styles.favIconCircle, { backgroundColor: `${activeTabInfo.color}20` }]}>
        <Text style={styles.favIcon}>{activeTabInfo.icon}</Text>
      </View>
      <View style={styles.favInfo}>
        <Text style={styles.favName}>{item.nombre}</Text>
        {item.descripcion ? (
          <Text style={styles.favDesc}>{item.descripcion}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemove(item)}
      >
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Type Tabs */}
      <View style={styles.tabBar}>
        {TYPE_TABS.map((tab) => {
          const count = favorites.filter((f) => f.tipo === tab.key).length;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && { borderBottomColor: tab.color, borderBottomWidth: 3 }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.key && { color: tab.color }]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[styles.badge, { backgroundColor: tab.color }]}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{activeTabInfo.icon}</Text>
          <Text style={styles.emptyTitle}>Sin {activeTabInfo.label.toLowerCase()} favoritas</Text>
          <Text style={styles.emptySub}>
            Guarda tus {activeTabInfo.label.toLowerCase()} preferidas desde sus pantallas de detalle.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchFavorites(); }}
              colors={['#10B981']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'column',
    position: 'relative',
  },
  tabIcon: { fontSize: 18, marginBottom: 2 },
  tabLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  badge: {
    position: 'absolute',
    top: 6,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: 'bold' },
  listContent: { padding: 12 },
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
  },
  favIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  favIcon: { fontSize: 20 },
  favInfo: { flex: 1 },
  favName: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  favDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeBtnText: { fontSize: 13, color: '#EF4444', fontWeight: 'bold' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
});
