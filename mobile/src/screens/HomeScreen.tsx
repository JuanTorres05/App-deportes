import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.topHeaderRow}>
          <View>
            <Text style={styles.greeting}>¡Hola, {user?.nombre || 'Deportista'}!</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.proBanner}
          onPress={() => navigation.navigate('Premium')}
        >
          <Text style={styles.proBannerText}>★ Suscripción Premium PRO (HU-20)</Text>
        </TouchableOpacity>

        {/* Unified Discovery Action */}
        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: '#0284C7' }]}
          onPress={() => navigation.navigate('AdvancedSearch')}
        >
          <Text style={styles.primaryActionIcon}>🔍</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Búsqueda Avanzada & Filtros (HU-39)</Text>
            <Text style={styles.primaryActionSub}>
              Filtra jugadores y canchas por deporte, nivel y precio
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: '#0F766E' }]}
          onPress={() => navigation.navigate('ActivityFeed')}
        >
          <Text style={styles.primaryActionIcon}>📰</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Feed de Actividad Social (HU-42)</Text>
            <Text style={styles.primaryActionSub}>
              Partidos, reservas y torneos recientes de tu comunidad
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: '#BE185D' }]}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.primaryActionIcon}>❤️</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Mis Favoritos (HU-43)</Text>
            <Text style={styles.primaryActionSub}>
              Canchas, jugadores y torneos guardados
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: '#7C3AED' }]}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Text style={styles.primaryActionIcon}>📆</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Mi Calendario Deportivo (HU-44)</Text>
            <Text style={styles.primaryActionSub}>
              Partidos, reservas y torneos próximos en un solo lugar
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Action Navigation Buttons */}
        <TouchableOpacity
          style={styles.primaryActionBtn}
          onPress={() => navigation.navigate('FindPlayers')}
        >
          <Text style={styles.primaryActionIcon}>⚽</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Buscar Jugadores Cercanos</Text>
            <Text style={styles.primaryActionSub}>
              Actívate en línea y encuentra deportistas cerca
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: '#4F46E5' }]}
          onPress={() => navigation.navigate('Stats')}
        >
          <Text style={styles.primaryActionIcon}>📊</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Mis Estadísticas & Rendimiento (HU-27)</Text>
            <Text style={styles.primaryActionSub}>
              Promedios por criterio, partidos jugados y Leaderboard
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: '#059669' }]}
          onPress={() => navigation.navigate('Courts')}
        >
          <Text style={styles.primaryActionIcon}>📍</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Canchas y Centros Cercanos (HU-15)</Text>
            <Text style={styles.primaryActionSub}>
              Encuentra canchas disponibles con PostGIS y consulta precios
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: '#D97706' }]}
          onPress={() => navigation.navigate('Tournaments')}
        >
          <Text style={styles.primaryActionIcon}>🏆</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Torneos e Inscripciones (HU-23)</Text>
            <Text style={styles.primaryActionSub}>
              Compite en torneos públicos e inscribe tu equipo
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: '#DC2626' }]}
          onPress={() => navigation.navigate('TeamChallenges')}
        >
          <Text style={styles.primaryActionIcon}>⚔️</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Retos entre Equipos (HU-35)</Text>
            <Text style={styles.primaryActionSub}>
              Desafía a equipos rivales y pacta partidos
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: '#3B82F6' }]}
          onPress={() => navigation.navigate('Matches')}
        >
          <Text style={styles.primaryActionIcon}>⚽</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Mis Partidos & Calificaciones</Text>
            <Text style={styles.primaryActionSub}>
              Organiza juegos, mira historial y califica jugadores
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: '#8B5CF6' }]}
          onPress={() => navigation.navigate('Teams')}
        >
          <Text style={styles.primaryActionIcon}>🛡️</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Mis Equipos (HU-09)</Text>
            <Text style={styles.primaryActionSub}>
              Crea tu equipo, gestiona miembros e invita amigos
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: '#1E293B' }]}
          onPress={() => navigation.navigate('SportsCenterAdmin')}
        >
          <Text style={styles.primaryActionIcon}>🏢</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Panel Centro Deportivo (Admin HU-37)</Text>
            <Text style={styles.primaryActionSub}>
              Ingresos mensuales, ocupación y bloqueo por mantenimiento
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => navigation.navigate('MyBookings')}
          >
            <Text style={styles.secondaryActionIcon}>📅</Text>
            <Text style={styles.secondaryActionTitle}>Mis Reservas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.secondaryActionIcon}>👤</Text>
            <Text style={styles.secondaryActionTitle}>Mi Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => navigation.navigate('PhotoGallery')}
          >
            <Text style={styles.secondaryActionIcon}>🖼️</Text>
            <Text style={styles.secondaryActionTitle}>Galería</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.secondaryActionIcon}>⚙️</Text>
            <Text style={styles.secondaryActionTitle}>Ajustes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <Text style={styles.secondaryActionIcon}>❓</Text>
            <Text style={styles.secondaryActionTitle}>Ayuda</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F3F4F6',
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  bellBtn: {
    backgroundColor: '#F3F4F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 22,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  email: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
  },
  proBanner: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  proBannerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  badge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 12,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 14,
  },
  primaryActionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  actionBtnTextCol: {
    flex: 1,
  },
  primaryActionTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryActionSub: {
    color: '#D1FAE5',
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  secondaryActionBtn: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  secondaryActionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  secondaryActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
