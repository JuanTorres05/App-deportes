import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { PhotoGalleryScreen } from '../screens/PhotoGalleryScreen';
import { FindPlayersScreen } from '../screens/FindPlayersScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  EditProfile: undefined;
  PhotoGallery: undefined;
  FindPlayers: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainStack.Navigator>
          <MainStack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'PlayConnect' }}
          />
          <MainStack.Screen
            name="FindPlayers"
            component={FindPlayersScreen}
            options={{ title: 'Buscar Partido' }}
          />
          <MainStack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ title: 'Editar Perfil' }}
          />
          <MainStack.Screen
            name="PhotoGallery"
            component={PhotoGalleryScreen}
            options={{ title: 'Galería de Fotos' }}
          />
        </MainStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});
