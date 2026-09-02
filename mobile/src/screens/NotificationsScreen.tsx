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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'Notifications'>;

interface NotificationItem {
  id: string;
  usuario_id: string;
  tipo: 'PARTIDO' | 'EQUIPO' | 'RESERVA' | 'TORNEO' | 'SISTEMA';
  titulo: string;
  mensaje: string;
  leido: boolean;
  creado_en: string;
}

const CATEGORIES = ['TODAS', 'PARTIDO', 'EQUIPO', 'RESERVA', 'TORNEO'];

export const NotificationsScreen: React.FC<Props> = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (_err) {
      console.log('Error fetching notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
      );
    } catch (_err) {
      console.log('Error marking notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })));
      Alert.alert('Listo', 'Todas las notificaciones se marcaron como leídas');
    } catch (err: any) {
      Alert.alert('Error', 'No se pudieron marcar las notificaciones');
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredList =
    selectedCategory === 'TODAS'
      ? notifications
      : notifications.filter((n) => n.tipo === selectedCategory);

  const getCategoryIcon = (tipo: string) => {
    switch (tipo) {
      case 'PARTIDO':
        return '⚽';
      case 'EQUIPO':
        return '🛡️';
      case 'RESERVA':
        return '📍';
      case 'TORNEO':
        return '🏆';
      default:
        return '🔔';
    }
  };

  const renderNotificationCard = ({ item }: { item: NotificationItem }) => {
    return (
      <TouchableOpacity
        style={[styles.card, !item.leido && styles.unreadCard]}
        onPress={() => handleMarkAsRead(item.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{getCategoryIcon(item.tipo)}</Text>
          <View style={styles.headerTextCol}>
            <Text style={[styles.title, !item.leido && styles.unreadTitle]}>
              {item.titulo}
            </Text>
            <Text style={styles.timeText}>
              {new Date(item.creado_en).toLocaleDateString()} •{' '}
              {new Date(item.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {!item.leido && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.messageText}>{item.mensaje}</Text>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.leido).length;

  return (
    <View style={styles.container}>
      {/* Top Bar with Mark All Read Action */}
      <View style={styles.topBar}>
        <Text style={styles.unreadSummary}>
          {unreadCount > 0 ? `Tienes ${unreadCount} avisos sin leer` : 'Estás al día con tus avisos'}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <Text style={styles.markAllBtnText}>Marcar todas leídas</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === cat && styles.chipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
      ) : filteredList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>No tienes notificaciones en esta categoría</Text>
          <Text style={styles.emptySub}>
            Te avisaremos aquí cuando recibas invitaciones, confirmaciones de reservas o partidos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications();
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  unreadSummary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllBtnText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
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
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    backgroundColor: '#F9FAFB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  unreadTitle: {
    fontWeight: 'bold',
    color: '#111827',
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  messageText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginLeft: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});
