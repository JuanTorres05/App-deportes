import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'AdvancedSearch'>;

const SPORTS = ['TODOS', 'FUTBOL', 'PADEL', 'TENIS', 'BASKETBALL'];
const LEVELS = ['TODOS', 'PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'];

interface PlayerItem {
  id: string;
  nombre: string;
  foto_url: string | null;
  perfiles: Array<{
    deporte: string;
    nivel: string | null;
    posicion: string | null;
    activo: boolean;
  }>;
  esta_en_linea: boolean;
}

interface CourtItem {
  id: string;
  nombre: string;
  deporte: string;
  precio_hora: number;
  centro_deportivo_nombre: string;
}

export const AdvancedSearchScreen: React.FC<Props> = ({ navigation }) => {
  const [tab, setTab] = useState<'JUGADORES' | 'CANCHAS'>('JUGADORES');
  const [query, setQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('TODOS');
  const [selectedLevel, setSelectedLevel] = useState('TODOS');
  const [onlyActive, setOnlyActive] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');

  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    try {
      setLoading(true);
      if (tab === 'JUGADORES') {
        const params: any = {};
        if (query) params.query = query;
        if (selectedSport !== 'TODOS') params.deporte = selectedSport;
        if (selectedLevel !== 'TODOS') params.nivel = selectedLevel;
        if (onlyActive) params.solo_activos = 'true';

        const res = await api.get('/discovery/players', { params });
        setPlayers(res.data.players || []);
      } else {
        const params: any = {};
        if (query) params.query = query;
        if (selectedSport !== 'TODOS') params.deporte = selectedSport;
        if (maxPrice) params.precio_max = maxPrice;

        const res = await api.get('/discovery/courts', { params });
        setCourts(res.data.courts || []);
      }
    } catch (_err) {
      console.log('Error fetching discovery results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [tab, selectedSport, selectedLevel, onlyActive]);

  const renderPlayerItem = ({ item }: { item: PlayerItem }) => (
    <View style={styles.resultCard}>
      <Image
        source={{ uri: item.foto_url || 'https://via.placeholder.com/150' }}
        style={styles.avatar}
      />
      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText}>{item.nombre}</Text>
          {item.esta_en_linea && (
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineText}>● En línea</Text>
            </View>
          )}
        </View>
        <View style={styles.tagsRow}>
          {item.perfiles.map((p, idx) => (
            <View key={idx} style={styles.tagBadge}>
              <Text style={styles.tagText}>
                {p.deporte} {p.nivel ? `• ${p.nivel}` : ''} {p.posicion ? `(${p.posicion})` : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderCourtItem = ({ item }: { item: CourtItem }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('CourtDetail', { courtId: item.id })}
    >
      <View style={styles.cardInfo}>
        <Text style={styles.nameText}>{item.nombre}</Text>
        <Text style={styles.centerSubText}>📍 {item.centro_deportivo_nombre}</Text>
        <View style={styles.courtFooter}>
          <Text style={styles.sportBadgeText}>⚽ {item.deporte}</Text>
          <Text style={styles.priceText}>${item.precio_hora.toLocaleString()} / hr</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, tab === 'JUGADORES' && styles.tabItemActive]}
          onPress={() => setTab('JUGADORES')}
        >
          <Text style={[styles.tabItemText, tab === 'JUGADORES' && styles.tabItemTextActive]}>
            🏃 Buscar Jugadores (HU-39)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, tab === 'CANCHAS' && styles.tabItemActive]}
          onPress={() => setTab('CANCHAS')}
        >
          <Text style={[styles.tabItemText, tab === 'CANCHAS' && styles.tabItemTextActive]}>
            📍 Buscar Canchas (HU-40)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={tab === 'JUGADORES' ? 'Buscar por nombre o email...' : 'Buscar cancha o complejo...'}
          returnKeyType="search"
          onSubmitEditing={fetchResults}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={fetchResults}>
          <Text style={styles.searchBtnText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Filters Area */}
      <View style={styles.filtersArea}>
        <Text style={styles.filterLabel}>Deporte:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {SPORTS.map((sp) => (
            <TouchableOpacity
              key={sp}
              style={[styles.filterChip, selectedSport === sp && styles.filterChipActive]}
              onPress={() => setSelectedSport(sp)}
            >
              <Text
                style={[styles.filterChipText, selectedSport === sp && styles.filterChipTextActive]}
              >
                {sp}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {tab === 'JUGADORES' ? (
          <>
            <Text style={styles.filterLabel}>Nivel de Juego:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {LEVELS.map((lv) => (
                <TouchableOpacity
                  key={lv}
                  style={[styles.filterChip, selectedLevel === lv && styles.filterChipActive]}
                  onPress={() => setSelectedLevel(lv)}
                >
                  <Text
                    style={[styles.filterChipText, selectedLevel === lv && styles.filterChipTextActive]}
                  >
                    {lv}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.switchFilterRow}>
              <Text style={styles.switchFilterLabel}>Solo deportistas activos ahora (GPS):</Text>
              <Switch
                value={onlyActive}
                onValueChange={setOnlyActive}
                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              />
            </View>
          </>
        ) : (
          <View style={styles.priceFilterRow}>
            <Text style={styles.filterLabel}>Precio Máx ($/hr):</Text>
            <TextInput
              style={styles.priceInput}
              value={maxPrice}
              onChangeText={setMaxPrice}
              placeholder="Ej: 50000"
              keyboardType="numeric"
              onSubmitEditing={fetchResults}
            />
          </View>
        )}
      </View>

      {/* Results List */}
      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 30 }} />
      ) : (tab === 'JUGADORES' ? players.length === 0 : courts.length === 0) ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
          <Text style={styles.emptySub}>Prueba ajustando los filtros de búsqueda o eliminando criterios.</Text>
        </View>
      ) : (
        <FlatList
          data={tab === 'JUGADORES' ? (players as any) : (courts as any)}
          keyExtractor={(item) => item.id}
          renderItem={tab === 'JUGADORES' ? (renderPlayerItem as any) : (renderCourtItem as any)}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#10B981',
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabItemTextActive: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  filtersArea: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 6,
    marginBottom: 4,
  },
  chipsScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#10B981',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  switchFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  switchFilterLabel: {
    fontSize: 13,
    color: '#374151',
  },
  priceFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  priceInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: 100,
    fontSize: 13,
  },
  listContent: {
    padding: 12,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  onlineBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#4B5563',
  },
  centerSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  courtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sportBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
  priceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});
