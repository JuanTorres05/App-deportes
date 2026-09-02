import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'Calendar'>;

type EventType = 'PARTIDO' | 'RESERVA' | 'TORNEO';

interface CalendarEvent {
  id: string;
  tipo: EventType;
  icono: string;
  titulo: string;
  subtitulo: string;
  fecha: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  ref_id: string;
  dias_restantes: number | null;
}

const TYPE_COLORS: Record<EventType, string> = {
  PARTIDO: '#3B82F6',
  RESERVA: '#10B981',
  TORNEO: '#F59E0B',
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Fecha por confirmar';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const DaysChip: React.FC<{ dias: number | null }> = ({ dias }) => {
  if (dias === null) return null;
  const label =
    dias < 0
      ? 'Pasado'
      : dias === 0
      ? '¡Hoy!'
      : dias === 1
      ? 'Mañana'
      : `En ${dias} días`;
  const bg = dias === 0 ? '#10B981' : dias <= 2 ? '#F59E0B' : '#E5E7EB';
  const color = dias <= 2 ? '#FFFFFF' : '#4B5563';
  return (
    <View style={[styles.daysChip, { backgroundColor: bg }]}>
      <Text style={[styles.daysChipText, { color }]}>{label}</Text>
    </View>
  );
};

export const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCalendar = useCallback(async () => {
    try {
      const res = await api.get('/calendar');
      setEvents(res.data.events || []);
    } catch (_err) {
      console.log('Error fetching calendar');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handlePress = (event: CalendarEvent) => {
    if (event.tipo === 'PARTIDO') {
      navigation.navigate('MatchDetail', { matchId: event.ref_id });
    } else if (event.tipo === 'RESERVA') {
      navigation.navigate('MyBookings');
    } else if (event.tipo === 'TORNEO') {
      navigation.navigate('TournamentDetail', { tournamentId: event.ref_id });
    }
  };

  const renderItem = ({ item, index }: { item: CalendarEvent; index: number }) => {
    const color = TYPE_COLORS[item.tipo];
    const isNext = index === 0;
    return (
      <TouchableOpacity
        style={[styles.eventCard, isNext && styles.nextEventCard]}
        onPress={() => handlePress(item)}
      >
        {isNext && <Text style={styles.nextBadge}>PRÓXIMO EVENTO</Text>}
        <View style={styles.eventRow}>
          <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
            <Text style={styles.iconText}>{item.icono}</Text>
          </View>
          <View style={styles.eventInfo}>
            <Text style={[styles.eventTitle, isNext && styles.nextTitle]}>{item.titulo}</Text>
            <Text style={styles.eventSub}>{item.subtitulo}</Text>
            <View style={styles.eventMeta}>
              <Text style={styles.eventDate}>{formatDate(item.fecha)}</Text>
              {item.hora_inicio && (
                <Text style={styles.eventTime}>
                  · {item.hora_inicio}
                  {item.hora_fin ? ` – ${item.hora_fin}` : ''}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.rightCol}>
            <DaysChip dias={item.dias_restantes} />
            <View style={[styles.typePill, { backgroundColor: `${color}20` }]}>
              <Text style={[styles.typePillText, { color }]}>{item.tipo}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBanner}>
        <Text style={styles.headerTitle}>📆 Mi Calendario Deportivo</Text>
        <Text style={styles.headerSub}>
          {events.length} evento{events.length !== 1 ? 's' : ''} próximo{events.length !== 1 ? 's' : ''} (HU-44)
        </Text>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📆</Text>
          <Text style={styles.emptyTitle}>Sin eventos próximos</Text>
          <Text style={styles.emptySub}>
            Únete a partidos, reserva canchas o inscríbete en torneos para ver tu agenda aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchCalendar(); }}
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
  headerBanner: {
    backgroundColor: '#1F2937',
    padding: 18,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  listContent: { padding: 12 },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  nextEventCard: {
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  nextBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10B981',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  eventRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: { fontSize: 22 },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  nextTitle: { fontSize: 15, color: '#065F46' },
  eventSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  eventMeta: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
  eventDate: { fontSize: 11, color: '#374151', fontWeight: '600' },
  eventTime: { fontSize: 11, color: '#6B7280', marginLeft: 4 },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  daysChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  daysChipText: { fontSize: 10, fontWeight: 'bold' },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typePillText: { fontSize: 10, fontWeight: 'bold' },
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
