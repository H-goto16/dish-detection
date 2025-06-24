import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CameraButton } from '@/components/ui/CameraButton';
import { PlatformAlert } from '@/components/ui/PlatformAlert';
import { StyledTextInput } from '@/components/ui/StyledTextInput';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  useColorScheme,
  View
} from 'react-native';

interface TrainingStats {
  total_images: number;
  total_labels: number;
  classes: string[];
  class_counts: Record<string, number>;
  data_directory: string;
}

interface TrainingProgress {
  isTraining: boolean;
  currentEpoch?: number;
  totalEpochs?: number;
  message?: string;
}

const ModelTrainingManager = () => {
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress>({ isTraining: false });
  const [epochs, setEpochs] = useState('50');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Fetch training data statistics
  const fetchTrainingStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/training/data/stats');
      if (response.ok) {
        const stats = await response.json();
        setTrainingStats(stats);
      } else {
        console.error('Failed to fetch training stats');
      }
    } catch (error) {
      console.error('Error fetching training stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start fine-tuning
  const startTraining = async () => {
    console.log('startTraining called with epochs:', epochs);
    const epochCount = parseInt(epochs);
    if (isNaN(epochCount) || epochCount <= 0) {
      console.log('Invalid epoch count:', epochCount);
      PlatformAlert.error('Error', 'Please enter a valid number of epochs');
      return;
    }

    if (epochCount > 500) {
      console.log('Epoch count too high:', epochCount);
      PlatformAlert.error('Error', 'Maximum epochs allowed is 500');
      return;
    }

    if (!trainingStats || trainingStats.total_images === 0) {
      console.log('No training data available:', trainingStats);
      PlatformAlert.error('Error', 'No training data available. Please add some labeled images first.');
      return;
    }

    console.log('All validation passed, showing confirmation dialog');

    PlatformAlert.confirm(
      'Start Training',
      `Are you sure you want to start fine-tuning with ${epochCount} epochs?\n\nThis will train on:\n• ${trainingStats.total_images} images\n• ${trainingStats.total_labels} labels\n• ${trainingStats.classes.length} classes\n\nThis process may take several minutes.`,
      executeTraining
    );
  };

  const executeTraining = async () => {
    try {
      console.log('executeTraining started');
      setTrainingProgress({ isTraining: true, message: 'Starting training...' });

      const url = `http://localhost:8000/training/start?epochs=${epochs}`;
      console.log('Making API request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Training completed successfully:', result);
        PlatformAlert.success('Training Complete', result.message);
        setTrainingProgress({ isTraining: false });
        // Refresh statistics
        await fetchTrainingStats();
      } else {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.detail || 'Training failed');
      }
    } catch (error) {
      console.error('Training error:', error);
      PlatformAlert.error('Training Failed', error instanceof Error ? error.message : 'Unknown error occurred');
      setTrainingProgress({ isTraining: false });
    }
  };

  // Fetch stats on component mount
  useEffect(() => {
    fetchTrainingStats();
  }, []);

  const getTrainingStatusColor = () => {
    if (!trainingStats) return '#6B7280';
    if (trainingStats.total_images === 0) return '#EF4444';
    if (trainingStats.total_images < 10) return '#F59E0B';
    return '#10B981';
  };

  const getTrainingStatusText = () => {
    if (!trainingStats) return 'Loading...';
    if (trainingStats.total_images === 0) return 'No training data';
    if (trainingStats.total_images < 10) return 'Insufficient data';
    return 'Ready for training';
  };

  return (
    <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
      <ThemedText className="text-2xl font-bold text-center mb-5">Model Training</ThemedText>

      {/* Training Data Statistics */}
      <ThemedView className="mb-5 p-5 rounded-xl">
        <ThemedText className="text-xl font-bold mb-4">Training Data Statistics</ThemedText>

        {isLoading ? (
          <View className="flex-row items-center justify-center p-5">
            <ActivityIndicator size="small" color="#3B82F6" />
            <ThemedText className="ml-3 text-base">Loading statistics...</ThemedText>
          </View>
        ) : trainingStats ? (
          <>
            <View className="flex-row justify-around mb-4">
              <View className="items-center">
                <ThemedText className="text-3xl font-bold text-primary-500">{trainingStats.total_images}</ThemedText>
                <ThemedText className="text-sm opacity-70 mt-1">Images</ThemedText>
              </View>
              <View className="items-center">
                <ThemedText className="text-3xl font-bold text-primary-500">{trainingStats.total_labels}</ThemedText>
                <ThemedText className="text-sm opacity-70 mt-1">Labels</ThemedText>
              </View>
              <View className="items-center">
                <ThemedText className="text-3xl font-bold text-primary-500">{trainingStats.classes.length}</ThemedText>
                <ThemedText className="text-sm opacity-70 mt-1">Classes</ThemedText>
              </View>
            </View>

            {/* Training Status */}
            <View className={`flex-row items-center p-3 rounded-lg border mb-4`} style={{ borderColor: getTrainingStatusColor() }}>
              <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: getTrainingStatusColor() }} />
              <ThemedText className="text-base font-semibold">{getTrainingStatusText()}</ThemedText>
            </View>

            {/* Class Statistics */}
            {trainingStats.classes.length > 0 && (
              <View className="mt-4">
                <ThemedText className="text-base font-semibold mb-3">Labels per Class</ThemedText>
                <ScrollView className="max-h-[120px]" showsVerticalScrollIndicator={false}>
                  {trainingStats.classes.map((className, index) => (
                    <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-200">
                      <ThemedText className="text-sm font-medium">{className}</ThemedText>
                      <View className="bg-primary-500 px-2 py-1 rounded-full">
                        <ThemedText className="text-white text-xs font-bold">
                          {trainingStats.class_counts[className] || 0}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        ) : (
          <ThemedText className="text-center text-danger-500 italic">Failed to load training statistics</ThemedText>
        )}
      </ThemedView>

      {/* Training Configuration */}
      <ThemedView className="mb-5 p-5 rounded-xl">
        <ThemedText className="text-xl font-bold mb-4">Training Configuration</ThemedText>

        <StyledTextInput
          label="Number of Epochs"
          placeholder="Enter number of epochs (1-500)"
          value={epochs}
          onChangeText={setEpochs}
        />

        <View className="mt-3 mb-5">
          <ThemedText className="text-sm opacity-70 mb-1">
            • Higher epochs = better accuracy but longer training time
          </ThemedText>
          <ThemedText className="text-sm opacity-70 mb-1">
            • Recommended: 50-100 epochs for most cases
          </ThemedText>
          <ThemedText className="text-sm opacity-70 mb-1">
            • Training time: ~1-5 minutes per 10 epochs
          </ThemedText>
        </View>

        <CameraButton
          variant="success"
          icon="play"
          onPress={startTraining}
          disabled={trainingProgress.isTraining || !trainingStats || trainingStats.total_images === 0}
          size="large"
          style={{ marginTop: 8 }}
        >
          {trainingProgress.isTraining ? "Training in Progress..." : "Start Fine-tuning"}
        </CameraButton>
      </ThemedView>

      {/* Training Progress */}
      {trainingProgress.isTraining && (
        <ThemedView className="mb-5 p-5 rounded-xl">
          <ThemedText className="text-xl font-bold mb-4">Training Progress</ThemedText>
          <View className="items-center p-5">
            <ActivityIndicator size="large" color="#3B82F6" />
            <ThemedText className="text-base font-semibold mt-4 text-center">
              {trainingProgress.message || 'Training in progress...'}
            </ThemedText>
            <ThemedText className="text-sm opacity-70 mt-2 text-center">
              Please wait, this may take several minutes
            </ThemedText>
          </View>
        </ThemedView>
      )}

      {/* Help Information */}
      <ThemedView className="mb-5 p-5 rounded-xl">
        <ThemedText className="text-xl font-bold mb-4">How to Improve Your Model</ThemedText>
        <View className="mt-3">
          {[
            "Capture images of objects that aren't detected well",
            "Use \"Manual Labeling\" to create bounding boxes and labels",
            "Accumulate at least 10-20 labeled images per class",
            "Run fine-tuning to improve detection accuracy"
          ].map((text, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <ThemedText className="w-6 h-6 rounded-full bg-primary-500 text-white text-center leading-6 text-sm font-bold mr-3">
                {index + 1}
              </ThemedText>
              <ThemedText className="flex-1 text-sm leading-5">{text}</ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
  );
};

export default ModelTrainingManager;