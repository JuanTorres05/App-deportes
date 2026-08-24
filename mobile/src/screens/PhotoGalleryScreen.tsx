import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';

const { width } = Dimensions.get('window');
const itemSize = (width - 48) / 3;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

interface PhotoItem {
  id: string;
  url: string;
  tipo: string;
  orden: number;
}

export const PhotoGalleryScreen: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile/me');
      setPhotos(res.data.profile.fotos || []);
    } catch (_err) {
      Alert.alert('Error', 'No se pudo cargar la galería');
    } finally {
      setLoading(false);
    }
  };

  const handlePickAndUploadImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso denegado',
          'Se necesita acceso a la galería para seleccionar fotos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      setUploading(true);

      const formData = new FormData();
      const filename = asset.uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('foto', {
        uri: asset.uri,
        name: filename,
        type,
      } as unknown as Blob);

      await api.post('/profile/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Éxito', 'Foto subida correctamente');
      fetchGallery();
    } catch (_err) {
      Alert.alert('Error', 'No se pudo subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert('Eliminar foto', '¿Estás seguro de eliminar esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/profile/photos/${photoId}`);
            fetchGallery();
          } catch (_err) {
            Alert.alert('Error', 'No se pudo eliminar la foto');
          }
        },
      },
    ]);
  };

  const renderPhoto = ({ item }: { item: PhotoItem }) => {
    const fullUrl = item.url.startsWith('http') ? item.url : `${API_BASE_URL}${item.url}`;

    return (
      <View style={styles.imageCard}>
        <Image source={{ uri: fullUrl }} style={styles.image} />
        <TouchableOpacity
          style={styles.deleteBadge}
          onPress={() => handleDeletePhoto(item.id)}
        >
          <Text style={styles.deleteBadgeText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Galería de Fotos</Text>
        <Text style={styles.subtitle}>Muestra tus partidos y jugadas destacadas</Text>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={handlePickAndUploadImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.uploadBtnText}>+ Subir Nueva Foto</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Galería Vacía</Text>
          <Text style={styles.emptySub}>Aún no has subido fotos a tu perfil deportivo.</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          renderItem={renderPhoto}
          numColumns={3}
          contentContainerStyle={styles.grid}
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
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  uploadBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  uploadBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    padding: 16,
  },
  imageCard: {
    width: itemSize,
    height: itemSize,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  emptySub: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});
