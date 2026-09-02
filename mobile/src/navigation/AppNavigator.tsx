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
import { MatchesScreen } from '../screens/MatchesScreen';
import { CreateMatchScreen } from '../screens/CreateMatchScreen';
import { MatchDetailScreen } from '../screens/MatchDetailScreen';
import { RatePlayersScreen } from '../screens/RatePlayersScreen';
import { TeamsScreen } from '../screens/TeamsScreen';
import { CreateTeamScreen } from '../screens/CreateTeamScreen';
import { TeamDetailScreen } from '../screens/TeamDetailScreen';
import { CourtsScreen } from '../screens/CourtsScreen';
import { CourtDetailScreen } from '../screens/CourtDetailScreen';
import { BookCourtScreen } from '../screens/BookCourtScreen';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { MatchChatScreen } from '../screens/MatchChatScreen';
import { MatchCostSplitScreen } from '../screens/MatchCostSplitScreen';
import { PremiumScreen } from '../screens/PremiumScreen';
import { TournamentsScreen } from '../screens/TournamentsScreen';
import { CreateTournamentScreen } from '../screens/CreateTournamentScreen';
import { TournamentDetailScreen } from '../screens/TournamentDetailScreen';
import { TournamentBracketScreen } from '../screens/TournamentBracketScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { TeamChallengesScreen } from '../screens/TeamChallengesScreen';
import { SportsCenterAdminScreen } from '../screens/SportsCenterAdminScreen';
import { AdvancedSearchScreen } from '../screens/AdvancedSearchScreen';
import { PublicProfileScreen } from '../screens/PublicProfileScreen';
import { ActivityFeedScreen } from '../screens/ActivityFeedScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { CalendarScreen } from '../screens/CalendarScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  EditProfile: undefined;
  PhotoGallery: undefined;
  FindPlayers: undefined;
  Matches: undefined;
  CreateMatch: undefined;
  MatchDetail: { matchId: string };
  MatchChat: { matchId: string };
  MatchCostSplit: { matchId: string };
  RatePlayers: { matchId: string };
  Teams: undefined;
  CreateTeam: undefined;
  TeamDetail: { teamId: string };
  Courts: undefined;
  CourtDetail: { courtId: string };
  BookCourt: { courtId: string; courtName?: string };
  MyBookings: undefined;
  Premium: undefined;
  Tournaments: undefined;
  CreateTournament: undefined;
  TournamentDetail: { tournamentId: string };
  TournamentBracket: { tournamentId: string };
  Stats: undefined;
  Leaderboard: undefined;
  Notifications: undefined;
  Settings: undefined;
  HelpSupport: undefined;
  TeamChallenges: undefined;
  SportsCenterAdmin: undefined;
  AdvancedSearch: undefined;
  PublicProfile: { userId: string };
  ActivityFeed: undefined;
  Favorites: undefined;
  Calendar: undefined;
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
            name="AdvancedSearch"
            component={AdvancedSearchScreen}
            options={{ title: 'Búsqueda Avanzada' }}
          />
          <MainStack.Screen
            name="ActivityFeed"
            component={ActivityFeedScreen}
            options={{ title: 'Feed de Actividad Social' }}
          />
          <MainStack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ title: 'Mis Favoritos' }}
          />
          <MainStack.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{ title: 'Mi Calendario Deportivo' }}
          />
          <MainStack.Screen
            name="PublicProfile"
            component={PublicProfileScreen}
            options={{ title: 'Perfil de Jugador' }}
          />
          <MainStack.Screen
            name="SportsCenterAdmin"
            component={SportsCenterAdminScreen}
            options={{ title: 'Panel de Centro Deportivo' }}
          />
          <MainStack.Screen
            name="TeamChallenges"
            component={TeamChallengesScreen}
            options={{ title: 'Retos entre Equipos' }}
          />
          <MainStack.Screen
            name="HelpSupport"
            component={HelpSupportScreen}
            options={{ title: 'Ayuda y Soporte' }}
          />
          <MainStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Configuración' }}
          />
          <MainStack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ title: 'Centro de Notificaciones' }}
          />
          <MainStack.Screen
            name="Stats"
            component={StatsScreen}
            options={{ title: 'Mis Estadísticas' }}
          />
          <MainStack.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{ title: 'Tabla de Líderes' }}
          />
          <MainStack.Screen
            name="Tournaments"
            component={TournamentsScreen}
            options={{ title: 'Torneos Abiertos' }}
          />
          <MainStack.Screen
            name="CreateTournament"
            component={CreateTournamentScreen}
            options={{ title: 'Publicar Torneo' }}
          />
          <MainStack.Screen
            name="TournamentDetail"
            component={TournamentDetailScreen}
            options={{ title: 'Detalle del Torneo' }}
          />
          <MainStack.Screen
            name="TournamentBracket"
            component={TournamentBracketScreen}
            options={{ title: 'Cuadro de Eliminatorias' }}
          />
          <MainStack.Screen
            name="Premium"
            component={PremiumScreen}
            options={{ title: 'PlayConnect PRO' }}
          />
          <MainStack.Screen
            name="FindPlayers"
            component={FindPlayersScreen}
            options={{ title: 'Jugadores Cercanos' }}
          />
          <MainStack.Screen
            name="Courts"
            component={CourtsScreen}
            options={{ title: 'Canchas Cercanas' }}
          />
          <MainStack.Screen
            name="CourtDetail"
            component={CourtDetailScreen}
            options={{ title: 'Detalle de Cancha' }}
          />
          <MainStack.Screen
            name="BookCourt"
            component={BookCourtScreen}
            options={{ title: 'Reservar Turno' }}
          />
          <MainStack.Screen
            name="MyBookings"
            component={MyBookingsScreen}
            options={{ title: 'Mis Reservas' }}
          />
          <MainStack.Screen
            name="Matches"
            component={MatchesScreen}
            options={{ title: 'Mis Partidos' }}
          />
          <MainStack.Screen
            name="CreateMatch"
            component={CreateMatchScreen}
            options={{ title: 'Organizar Partido' }}
          />
          <MainStack.Screen
            name="MatchDetail"
            component={MatchDetailScreen}
            options={{ title: 'Detalle del Partido' }}
          />
          <MainStack.Screen
            name="MatchChat"
            component={MatchChatScreen}
            options={{ title: 'Chat del Partido' }}
          />
          <MainStack.Screen
            name="MatchCostSplit"
            component={MatchCostSplitScreen}
            options={{ title: 'División de Pago' }}
          />
          <MainStack.Screen
            name="RatePlayers"
            component={RatePlayersScreen}
            options={{ title: 'Calificar Jugadores' }}
          />
          <MainStack.Screen
            name="Teams"
            component={TeamsScreen}
            options={{ title: 'Mis Equipos' }}
          />
          <MainStack.Screen
            name="CreateTeam"
            component={CreateTeamScreen}
            options={{ title: 'Crear Equipo' }}
          />
          <MainStack.Screen
            name="TeamDetail"
            component={TeamDetailScreen}
            options={{ title: 'Detalle del Equipo' }}
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
