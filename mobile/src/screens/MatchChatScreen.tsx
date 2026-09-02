import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<MainStackParamList, 'MatchChat'>;

interface MessageItem {
  id: string;
  partido_id: string;
  emisor: {
    id: string;
    nombre: string;
    foto_url: string | null;
  };
  contenido: string;
  creado_en: string;
}

export const MatchChatScreen: React.FC<Props> = ({ route }) => {
  const { matchId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/matches/${matchId}/messages`);
      setMessages(res.data.messages || []);
    } catch (_err) {
      console.log('Error fetching chat messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      setSending(true);
      await api.post(`/matches/${matchId}/messages`, {
        contenido: inputText.trim(),
      });
      setInputText('');
      fetchMessages();
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = ({ item }: { item: MessageItem }) => {
    const isMe = item.emisor.id === user?.id;

    return (
      <View style={[styles.msgRow, isMe ? styles.myMsgRow : styles.otherMsgRow]}>
        <View style={[styles.msgBubble, isMe ? styles.myMsgBubble : styles.otherMsgBubble]}>
          {!isMe && <Text style={styles.senderName}>{item.emisor.nombre}</Text>}
          <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.otherMsgText]}>
            {item.contenido}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 20 }} />
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Chat del Partido (HU-13)</Text>
          <Text style={styles.emptySub}>¡Coordina la hora, camisetas o transporte con tus compañeros!</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.chatContent}
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escribe un mensaje al grupo..."
        />
        <TouchableOpacity
          style={[styles.sendBtn, sending && styles.disabledBtn]}
          onPress={handleSendMessage}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.sendBtnText}>Enviar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  chatContent: {
    padding: 16,
  },
  msgRow: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  myMsgRow: {
    justifyContent: 'flex-end',
  },
  otherMsgRow: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '75%',
    borderRadius: 12,
    padding: 12,
  },
  myMsgBubble: {
    backgroundColor: '#10B981',
  },
  otherMsgBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 2,
  },
  msgText: {
    fontSize: 15,
  },
  myMsgText: {
    color: '#FFFFFF',
  },
  otherMsgText: {
    color: '#1F2937',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
