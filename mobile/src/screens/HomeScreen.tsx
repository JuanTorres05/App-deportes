import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* User Hero Header Card */}
      <View style={styles.heroHeader}>
        <View style={styles.userRow}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: user?.foto_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              }}
              style={styles.avatar}
            />
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.userInfo}>
            <View style={styles.badgeRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>⚡ DEPORTISTA ACTIVO</Text>
              </View>
              <View style={styles.gpsBadge}>
                <Text style={styles.gpsText}>📡 GPS Online</Text>
              </View>
            </View>
            <Text style={styles.greeting}>{user?.nombre || 'Deportista'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          {/* Quick Header Icons */}
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Text style={styles.iconEmoji}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.iconEmoji}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Highlights Counter Bar */}
        <View style={styles.statsBar}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Matches')}
          >
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Partidos</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Teams')}
          >
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Equipos</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Stats')}
          >
            <Text style={styles.statNumber}>4.9 ★</Text>
            <Text style={styles.statLabel}>Calificación</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('MyBookings')}
          >
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Reservas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PRO Membership Highlight Banner */}
      <TouchableOpacity
        style={styles.proBanner}
        onPress={() => navigation.navigate('Premium')}
        activeOpacity={0.88}
      >
        <View style={styles.proContent}>
          <Text style={styles.proBadge}>★ PLAYCONNECT PRO</Text>
          <Text style={styles.proTitle}>Desbloquea equipos ilimitados & 50 km GPS</Text>
        </View>
        <Text style={styles.proArrow}>➔</Text>
      </TouchableOpacity>

      {/* CATEGORY 1: JUGAR & CONECTAR */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>⚡ Jugar & Conectar</Text>
      </View>

      <View style={styles.grid2Col}>
        <TouchableOpacity
          style={[styles.featureCard, { backgroundColor: '#0284C7' }]}
          onPress={() => navigation.navigate('AdvancedSearch')}
          activeOpacity={0.85}
        >
          <Text style={styles.featureIcon}>🔍</Text>
          <Text style={styles.featureTitle}>Búsqueda Avanzada</Text>
          <Text style={styles.featureSub}>Filtra por deporte, nivel y precio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.featureCard, { backgroundColor: '#10B981' }]}
          onPress={() => navigation.navigate('FindPlayers')}
          activeOpacity={0.85}
        >
          <Text style={styles.featureIcon}>📍</Text>
          <Text style={styles.featureTitle}>Jugadores Cercanos</Text>
          <Text style={styles.featureSub}>Radar GPS en vivo de deportistas</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.wideCard}
        onPress={() => navigation.navigate('ActivityFeed')}
        activeOpacity={0.85}
      >
        <View style={[styles.wideIconBox, { backgroundColor: '#CCFBF1' }]}>
          <Text style={styles.wideIconText}>📰</Text>
        </View>
        <View style={styles.wideTextCol}>
          <Text style={styles.wideTitle}>Feed Social de Actividad</Text>
          <Text style={styles.wideSub}>Partidos, reservas y torneos recientes</Text>
        </View>
        <Text style={styles.cardChevron}>➔</Text>
      </TouchableOpacity>

      {/* CATEGORY 2: CANCHAS & RESERVAS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🏟️ Canchas & Turnos</Text>
      </View>

      <View style={styles.grid2Col}>
        <TouchableOpacity
          style={[styles.featureCard, { backgroundColor: '#059669' }]}
          onPress={() => navigation.navigate('Courts')}
          activeOpacity={0.85}
        >
          <Text style={styles.featureIcon}>🏟️</Text>
          <Text style={styles.featureTitle}>Canchas Cercanas</Text>
          <Text style={styles.featureSub}>Fútbol, Pádel, Tenis y más</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.featureCard, { backgroundColor: '#D97706' }]}
          onPress={() => navigation.navigate('MyBookings')}
          activeOpacity={0.85}
        >
          <Text style={styles.featureIcon}>📅</Text>
          <Text style={styles.featureTitle}>Mis Reservas</Text>
          <Text style={styles.featureSub}>Turnos confirmados y pagos</Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORY 3: COMPETICIÓN & EQUIPOS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🏆 Competición & Equipos</Text>
      </View>

      <View style={styles.grid2Col}>
        <TouchableOpacity
          style={[styles.featureCard, { backgroundColor: '#F59E0B' }]}
          onPress={() => navigation.navigate('Tournaments')}
          activeOpacity={0.85}
        >
          <Text style={styles.featureIcon}>🏆</Text>
          <Text style={styles.featureTitle}>Torneos Abiertos</Text>
          <Text style={styles.featureSub}>Inscripciones y cuadros</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.featureCard, { backgroundColor: '#DC2626' }]}
          onPress={() => navigation.navigate('TeamChallenges')}
          activeOpacity={0.85}
        >
          <Text style={styles.featureIcon}>⚔️</Text>
          <Text style={styles.featureTitle}>Retos de Equipos</Text>
          <Text style={styles.featureSub}>Desafía a escuadras rivales</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid2Col}>
        <TouchableOpacity
          style={[styles.featureCard, { backgroundColor: '#8B5CF6' }]}
          onPress={() => navigation.navigate('Teams')}
          activeOpacity={0.85}
        >
          <Text style={styles.featureIcon}>🛡️</Text>
          <Text style={styles.featureTitle}>Mis Equipos</Text>
          <Text style={styles.featureSub}>Gestión de miembros y roles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.featureCard, { backgroundColor: '#6366F1' }]}
          onPress={() => navigation.navigate('Leaderboard')}
          activeOpacity={0.85}
        >
          <Text style={styles.featureIcon}>🥇</Text>
          <Text style={styles.featureTitle}>Tabla de Líderes</Text>
          <Text style={styles.featureSub}>Ranking global de jugadores</Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORY 4: ORGANIZACIÓN & UTILIDADES */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📆 Mi Espacio & Gestión</Text>
      </View>

      <View style={styles.grid2Col}>
        <TouchableOpacity
          style={[styles.featureCard, { backgroundColor: '#7C3AED' }]}
          onPress={() => navigation.navigate('Calendar')}
          activeOpacity={0.85}
        >
          <Text style={styles.featureIcon}>📆</Text>
          <Text style={styles.featureTitle}>Mi Calendario</Text>
          <Text style={styles.featureSub}>Agenda de partidos y turnos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.featureCard, { backgroundColor: '#DB2777' }]}
          onPress={() => navigation.navigate('Favorites')}
          activeOpacity={0.85}
        >
          <Text style={styles.featureIcon}>❤️</Text>
          <Text style={styles.featureTitle}>Mis Favoritos</Text>
          <Text style={styles.featureSub}>Canchas y jugadores top</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.wideCard}
        onPress={() => navigation.navigate('SportsCenterAdmin')}
        activeOpacity={0.85}
      >
        <View style={[styles.wideIconBox, { backgroundColor: '#F1F5F9' }]}>
          <Text style={styles.wideIconText}>🏢</Text>
        </View>
        <View style={styles.wideTextCol}>
          <Text style={styles.wideTitle}>Panel de Centro Deportivo (Admin)</Text>
          <Text style={styles.wideSub}>Ingresos, tasa de ocupación y bloqueos</Text>
        </View>
        <Text style={styles.cardChevron}>➔</Text>
      </TouchableOpacity>

      {/* Quick Profile & Support Row */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.bottomBtnIcon}>👤</Text>
          <Text style={styles.bottomBtnText}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={() => navigation.navigate('HelpSupport')}
        >
          <Text style={styles.bottomBtnIcon}>❓</Text>
          <Text style={styles.bottomBtnText}>Ayuda & FAQ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBtn, { backgroundColor: '#FEF2F2' }]}
          onPress={logout}
        >
          <Text style={styles.bottomBtnIcon}>🚪</Text>
          <Text style={[styles.bottomBtnText, { color: '#EF4444' }]}>Salir</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heroHeader: {
    backgroundColor: '#0F172A', // Obsidian Dark
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  userInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  levelBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gpsBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gpsText: {
    color: '#60A5FA',
    fontSize: 9,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 11,
    color: '#94A3B8',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 16,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    marginTop: 14,
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#334155',
  },
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D97706',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  proContent: {
    flex: 1,
  },
  proBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FEF3C7',
    letterSpacing: 1,
  },
  proTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  proArrow: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid2Col: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  featureCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 100,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  featureSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontWeight: '500',
  },
  wideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wideIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  wideIconText: {
    fontSize: 20,
  },
  wideTextCol: {
    flex: 1,
  },
  wideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  wideSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cardChevron: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  bottomBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bottomBtnIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  bottomBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
});
