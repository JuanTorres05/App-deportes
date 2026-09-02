import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'Settings'>;

const RADIUS_OPTIONS = [2, 5, 10, 20, 50];

export const SettingsScreen: React.FC<Props> = () => {
  const [radiusKm, setRadiusKm] = useState(5);
  const [notifPartidos, setNotifPartidos] = useState(true);
  const [notifEquipos, setNotifEquipos] = useState(true);
  const [notifTorneos, setNotifTorneos] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      const prefs = res.data.preferences;
      if (prefs) {
        setRadiusKm(prefs.radio_busqueda_km || 5);
        setNotifPartidos(prefs.notif_partidos !== false);
        setNotifEquipos(prefs.notif_equipos !== false);
        setNotifTorneos(prefs.notif_torneos !== false);
      }
    } catch (_err) {
      console.log('Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSavePreferences = async (newRadius?: number) => {
    const radiusToSave = newRadius ?? radiusKm;
    try {
      setSavingPrefs(true);
      await api.put('/settings/preferences', {
        radio_busqueda_km: radiusToSave,
        notif_partidos: notifPartidos,
        notif_equipos: notifEquipos,
        notif_torneos: notifTorneos,
      });
      Alert.alert('¡Preferencias Guardadas!', 'Tus ajustes se han actualizado con éxito');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudieron guardar las preferencias');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Completa los campos de contraseña');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las nuevas contraseñas no coinciden');
      return;
    }

    try {
      setChangingPass(true);
      await api.put('/settings/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      Alert.alert('¡Contraseña Actualizada!', 'Tu contraseña ha sido cambiada exitosamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo cambiar la contraseña');
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Search Radius Preference */}
      <Text style={styles.sectionTitle}>Radio de Búsqueda GPS (HU-31)</Text>
      <View style={styles.card}>
        <Text style={styles.cardSub}>
          Determina la distancia máxima a tu alrededor para encontrar jugadores y canchas deportivas.
        </Text>
        <View style={styles.radiusRow}>
          {RADIUS_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusChip, radiusKm === r && styles.radiusChipActive]}
              onPress={() => {
                setRadiusKm(r);
              }}
            >
              <Text
                style={[
                  styles.radiusChipText,
                  radiusKm === r && styles.radiusChipTextActive,
                ]}
              >
                {r} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications Preference */}
      <Text style={styles.sectionTitle}>Preferencias de Notificaciones</Text>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Avisos de Partidos</Text>
            <Text style={styles.switchSub}>Recordatorios de horarios y cambios de estado.</Text>
          </View>
          <Switch
            value={notifPartidos}
            onValueChange={setNotifPartidos}
            trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Invitaciones a Equipos</Text>
            <Text style={styles.switchSub}>Alertas cuando un capitán te convoque.</Text>
          </View>
          <Switch
            value={notifEquipos}
            onValueChange={setNotifEquipos}
            trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Torneos y Brackets</Text>
            <Text style={styles.switchSub}>Avisos de apertura de inscripciones y resultados.</Text>
          </View>
          <Switch
            value={notifTorneos}
            onValueChange={setNotifTorneos}
            trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, savingPrefs && styles.disabledBtn]}
        onPress={() => handleSavePreferences()}
        disabled={savingPrefs}
      >
        {savingPrefs ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveBtnText}>Guardar Ajustes de Preferencias</Text>
        )}
      </TouchableOpacity>

      {/* Change Password Section */}
      <Text style={styles.sectionTitle}>Seguridad y Contraseña (HU-32)</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Contraseña Actual</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <Text style={styles.label}>Nueva Contraseña</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
        />

        <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repite la nueva contraseña"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.passBtn, changingPass && styles.disabledBtn]}
          onPress={handleChangePassword}
          disabled={changingPass}
        >
          {changingPass ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.passBtnText}>Actualizar Contraseña</Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  cardSub: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  radiusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  radiusChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  radiusChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  radiusChipTextActive: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  switchSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  saveBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
  },
  passBtn: {
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  passBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
