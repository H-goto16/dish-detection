import { StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface Detection {
  class: string;
  confidence: number;
  bbox: number[];
}

interface DetectionCardProps {
  detection: Detection;
  index: number;
}

export const DetectionCard = ({ detection, index }: DetectionCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10B981'; // green
    if (confidence >= 0.6) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const getCardStyle = () => ({
    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: getConfidenceColor(detection.confidence)
  });

  const getTextColors = () => ({
    className: isDark ? '#F9FAFB' : '#111827',
    confidence: isDark ? '#D1D5DB' : '#6B7280',
    position: isDark ? '#9CA3AF' : '#6B7280',
  });

  const textColors = getTextColors();

  return (
    <ThemedView style={[styles.card, getCardStyle()]}>
      <ThemedView style={styles.header}>
        <ThemedText style={[styles.className, { color: textColors.className }]}>
          {detection.class}
        </ThemedText>
        <ThemedView style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(detection.confidence) }]}>
          <ThemedText style={styles.confidenceText}>
            {getConfidenceLevel(detection.confidence)}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedText style={[styles.confidencePercent, { color: textColors.confidence }]}>
        Confidence: {(detection.confidence * 100).toFixed(1)}%
      </ThemedText>

      <ThemedText style={[styles.position, { color: textColors.position }]}>
        Position: [{detection.bbox.map(coord => Math.round(coord)).join(', ')}]
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  className: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  confidencePercent: {
    fontSize: 14,
    marginBottom: 4,
  },
  position: {
    fontSize: 12,
  },
});