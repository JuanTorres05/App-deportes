import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../services/api';

interface SportProfile {
  deporte: string;
  posicion?: string | null;
  nivel?: string | null;
  activo?: boolean;
}

export const EditProfileScreen: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [sports, setSports] = useState<SportProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New sport form inputs
  const [newDeporte, setNewDeporte] = useState('FUTBOL');
  const [newPosicion, setNewPosicion] = useState('DELANTERO');
  const [newNivel, setNewNivel] = useState('INTERMEDIO');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile/me');
      const p = res.data.profile;
      setNombre(p.nombre || '');
      setFotoUrl(p.foto_url || '');
      setSports(p.perfiles_deportivos || []);
    } catch (_err) {
      Alert.alert('Error', 'No se pudo cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await api.put('/profile/me', {
        nombre: nombre.trim(),
        foto_url: fotoUrl.trim() || null,
      });
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (_err) {
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSport = async () => {
    try {
      await api.put('/profile/sports', {
        deporte: newDeporte,
        posicion: newPosicion,
        nivel: newNivel,
      });
      Alert.alert('Deporte Agregado', `Perfil de ${newDeporte} actualizado`);
      fetchProfile();
    } catch (_err) {
      Alert.alert('Error', 'No se pudo guardar el deporte');
    }
  };

  const handleRemoveSport = async (deporte: string) => {
    try {
      await api.delete(`/profile/sports/${deporte}`);
      fetchProfile();
    } catch (_err) {
      Alert.alert('Error', 'No se pudo eliminar el deporte');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Editar Perfil Deportivo</Text>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

        <Text style={styles.label}>URL Foto de Perfil (Avatar)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          value={fotoUrl}
          onChangeText={setFotoUrl}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>Guardar Datos Personales</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Deportes que Practicas</Text>

        {sports.length === 0 ? (
          <Text style={styles.emptyText}>No has agregado deportes aún.</Text>
        ) : (
          sports.map((s) => (
            <View key={s.deporte} style={styles.sportItem}>
              <View>
                <Text style={styles.sportName}>{s.deporte}</Text>
                <Text style={styles.sportDetail}>
                  Posición: {s.posicion || 'N/A'} | Nivel: {s.nivel || 'N/A'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveSport(s.deporte)}>
                <Text style={styles.removeText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={styles.divider} />

        <Text style={styles.subTitle}>Agregar / Actualizar Deporte</Text>

        <Text style={styles.label}>Deporte</Text>
        <View style={styles.pillContainer}>
          {['FUTBOL', 'PADEL', 'TENIS'].map((dep) => (
            <TouchableOpacity
              key={dep}
              style={[styles.pill, newDeporte === dep && styles.pillActive]}
              onPress={() => setNewDeporte(dep)}
            >
              <Text style={[styles.pillText, newDeporte === dep && styles.pillTextActive]}>
                {dep}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Posición Habitual</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Delantero, Drive, Defensa..."
          value={newPosicion}
          onChangeText={setNewPosicion}
        />

        <Text style={styles.label}>Nivel Autodeclarado</Text>
        <View style={styles.pillContainer}>
          {['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'].map((niv) => (
            <TouchableOpacity
              key={niv}
              style={[styles.pill, newNivel === niv && styles.pillActive]}
              onPress={() => setNewNivel(niv)}
            >
              <Text style={[styles.pillText, newNivel === niv && styles.pillTextActive]}>
                {niv}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleAddSport}>
          <Text style={styles.addBtnText}>+ Agregar Perfil Deportivo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  sportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sportName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111827',
  },
  sportDetail: {
    fontSize: 13,
    color: '#6B7280',
  },
  removeText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  pillContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    backgroundColor: '#F9FAFB',
  },
  pillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  pillText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFF',
  },
  addBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
