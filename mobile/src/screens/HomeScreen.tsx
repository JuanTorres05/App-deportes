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
        <Text style={styles.greeting}>¡Hola, {user?.nombre || 'Deportista'}!</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Sprint 1 • Perfil & Búsqueda Geográfica</Text>
        </View>

        {/* Quick Action Navigation Buttons */}
        <TouchableOpacity
          style={styles.primaryActionBtn}
          onPress={() => navigation.navigate('FindPlayers')}
        >
          <Text style={styles.primaryActionIcon}>⚽</Text>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.primaryActionTitle}>Buscar Partido / Jugadores</Text>
            <Text style={styles.primaryActionSub}>
              Actívate en línea y encuentra deportistas cerca
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionRow}>
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
            <Text style={styles.secondaryActionTitle}>Galería Fotos</Text>
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
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 16,
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
