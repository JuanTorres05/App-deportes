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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { api } from '../services/api';

type Props = NativeStackScreenProps<MainStackParamList, 'HelpSupport'>;

interface SupportFaq {
  id: string;
  categoria: string;
  pregunta: string;
  respuesta: string;
}

interface SupportTicket {
  id: string;
  tipo: string;
  asunto: string;
  descripcion: string;
  estado: string;
  creado_en: string;
}

const REPORT_TYPES = ['CONDUCTA', 'CANCHA', 'PAGO', 'TORNEO', 'OTRO'];

export const HelpSupportScreen: React.FC<Props> = () => {
  const [faqs, setFaqs] = useState<SupportFaq[]>([]);
  const [reports, setReports] = useState<SupportTicket[]>([]);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState('CONDUCTA');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [faqsRes, reportsRes] = await Promise.all([
        api.get('/support/faqs'),
        api.get('/support/my-reports'),
      ]);
      setFaqs(faqsRes.data.faqs || []);
      setReports(reportsRes.data.reports || []);
    } catch (_err) {
      console.log('Error fetching support data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  const handleSendReport = async () => {
    if (!asunto.trim() || asunto.trim().length < 4) {
      Alert.alert('Error', 'El asunto debe tener al menos 4 caracteres');
      return;
    }

    if (!descripcion.trim() || descripcion.trim().length < 10) {
      Alert.alert('Error', 'La descripción debe tener al menos 10 caracteres');
      return;
    }

    try {
      setSending(true);
      const res = await api.post('/support/reports', {
        tipo: selectedType,
        asunto: asunto.trim(),
        descripcion: descripcion.trim(),
      });

      Alert.alert('¡Reporte Enviado!', res.data.message);
      setAsunto('');
      setDescripcion('');
      setReports((prev) => [res.data.ticket, ...prev]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo enviar el reporte');
    } finally {
      setSending(false);
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
      {/* FAQs Accordion */}
      <Text style={styles.sectionTitle}>Preguntas Frecuentes (FAQs - HU-33)</Text>
      {faqs.map((faq) => {
        const isExpanded = expandedFaqId === faq.id;
        return (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqCard}
            onPress={() => handleToggleFaq(faq.id)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqCategory}>{faq.categoria}</Text>
              <Text style={styles.faqQuestion}>{faq.pregunta}</Text>
              <Text style={styles.faqArrow}>{isExpanded ? '▲' : '▼'}</Text>
            </View>
            {isExpanded && (
              <View style={styles.faqBody}>
                <Text style={styles.faqAnswer}>{faq.respuesta}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Support & Community Report Form */}
      <Text style={styles.sectionTitle}>Enviar Solicitud o Reporte (HU-34)</Text>
      <View style={styles.formCard}>
        <Text style={styles.label}>Motivo del Reporte:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesRow}>
          {REPORT_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, selectedType === t && styles.typeChipActive]}
              onPress={() => setSelectedType(t)}
            >
              <Text style={[styles.typeChipText, selectedType === t && styles.typeChipTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Asunto:</Text>
        <TextInput
          style={styles.input}
          value={asunto}
          onChangeText={setAsunto}
          placeholder="Ej: Jugador ausente / Problema con la cancha"
        />

        <Text style={styles.label}>Descripción Detallada:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Cuéntanos con claridad lo sucedido para que el equipo de soporte pueda ayudarte."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.sendBtn, sending && styles.disabledBtn]}
          onPress={handleSendReport}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.sendBtnText}>Enviar Reporte a Soporte</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* History of Submitted Reports */}
      {reports.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Mis Solicitudes Enviadas ({reports.length})</Text>
          {reports.map((r) => (
            <View key={r.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportType}>{r.tipo}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{r.estado}</Text>
                </View>
              </View>
              <Text style={styles.reportSubject}>{r.asunto}</Text>
              <Text style={styles.reportDesc}>{r.descripcion}</Text>
              <Text style={styles.reportDate}>
                Enviado el {new Date(r.creado_en).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </>
      )}
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
    marginBottom: 10,
    marginTop: 12,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  faqHeader: {
    gap: 4,
  },
  faqCategory: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  faqArrow: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: -16,
  },
  faqBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
    marginBottom: 4,
  },
  typesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: '#10B981',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    minHeight: 80,
  },
  sendBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#D97706',
  },
  reportSubject: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  reportDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 6,
  },
  reportDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
