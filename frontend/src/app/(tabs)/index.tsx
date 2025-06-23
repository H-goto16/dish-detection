import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Ionicons } from '@expo/vector-icons';
import { type CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";

interface Detection {
  class: string;
  confidence: number;
  bbox: number[];
}

interface DetectionResponse {
  detections: Detection[];
  message: string;
  processed_image: string;
}

const HomeScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<DetectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [showAddClass, setShowAddClass] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const colorScheme = useColorScheme();

  const addNewClass = async (className: string) => {
    try {
      const response = await fetch("http://localhost:8000/model/classes", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classes: [className.trim()]
        }),
      });

      if (response.ok) {
        console.log(`Class "${className}" added successfully`);
        Alert.alert("Success", `Class "${className}" has been added`);
        setNewClassName('');
        setShowAddClass(false);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to add class:', errorData);
        Alert.alert("Error", errorData.detail || "Failed to add class");
        return false;
      }
    } catch (error) {
      console.error('Error adding class:', error);
      Alert.alert("Error", "Failed to add class");
      return false;
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          imageType: 'jpg',
        });

        if (photo) {
          setCapturedImage(photo.uri);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to take picture");
        console.error(error);
      }
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
      console.error(error);
    }
  };

  const uploadImageToAPI = async (imageUri: string, base64?: string) => {
    console.log('Uploading image to API...', { imageUri });
    setIsLoading(true);
    setDetectionResults(null);

    try {

      let result: DetectionResponse;

      if (Platform.OS === 'web') {
        // Web用: fetchとFormDataを使用
        console.log('Using fetch for web platform');

        const formData = new FormData();

        if (base64) {
          // Base64からBlobを作成
          const response = await fetch(`data:image/jpeg;base64,${base64}`);
          const blob = await response.blob();
          formData.append('image', blob, 'image.jpg');
        } else {
          // URIからBlobを作成
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append('image', blob, 'image.jpg');
        }

        const uploadResponse = await fetch("http://localhost:8000/detect", {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
        }

        result = await uploadResponse.json();
      } else {
        // Native用: FileSystem.uploadAsyncを使用
        console.log('Using FileSystem.uploadAsync for native platform');

        const uploadResult = await FileSystem.uploadAsync(
          "http://localhost:8000/detect",
          imageUri,
          {
            fieldName: 'image',
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          }
        );

        console.log('Upload result:', uploadResult);

        if (uploadResult.status !== 200) {
          console.error('Upload failed:', uploadResult.body);
          throw new Error(`Upload failed with status ${uploadResult.status}: ${uploadResult.body}`);
        }

        result = JSON.parse(uploadResult.body);
      }

      console.log('Detection successful:', result);
      setDetectionResults(result);

      if (result.detections.length > 0) {
        Alert.alert("Detection Complete", `${result.detections.length} objects detected`);
      } else {
        Alert.alert("Detection Result", "No objects detected");
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "Failed to analyze image";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClass = async () => {
    if (newClassName.trim()) {
      const success = await addNewClass(newClassName);
      if (success && capturedImage) {
        await uploadImageToAPI(capturedImage);
      }
    } else {
      Alert.alert("Error", "Please enter a class name");
    }
  };

  if (!permission) {
    return (
      <ThemedView className="flex-1 justify-center items-center p-5">
        <ThemedText>
          Checking camera permission...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView className="flex-1 justify-center items-center p-5">
        <ThemedText className="mb-4">Camera permission not granted</ThemedText>
        <TouchableOpacity className="bg-blue-600 py-4 px-6 rounded-lg" onPress={requestPermission}>
          <ThemedText className="text-white text-center font-bold">Request permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (capturedImage) {
    console.log('Rendering captured image view:', {
      capturedImage: !!capturedImage,
      detectionResults: !!detectionResults,
      detectionsCount: detectionResults?.detections.length || 0,
      hasProcessedImage: !!detectionResults?.processed_image
    });

    return (
      <ThemedView className="flex-1 justify-center items-center p-5">
        {detectionResults && detectionResults.processed_image ? (
          <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>
            <ThemedText className="text-lg font-bold mb-2">Detection Results</ThemedText>
            <Image
              source={{ uri: `data:image/jpeg;base64,${detectionResults.processed_image}` }}
              className="w-80 h-60 rounded-lg"
              resizeMode="contain"
            />
            <ThemedText className="text-sm mt-2">
              {detectionResults.message}
            </ThemedText>

            <ThemedView className="mt-4 w-full max-w-sm">
              {detectionResults.detections.map((detection, index) => (
                <ThemedView key={index} className="p-3 mb-2 rounded-lg border-l-4 border-blue-500" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <ThemedText className="font-bold text-base mb-1">
                    {detection.class}
                  </ThemedText>
                  <ThemedText className="text-sm opacity-70">
                    Confidence: {(detection.confidence * 100).toFixed(1)}%
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            {/* 既存のボタン */}
            <ThemedView className="flex-row gap-4 mt-4">
              <Button className="bg-blue-600 py-4 px-6 rounded-lg" onPress={() => {
                setCapturedImage(null);
                setDetectionResults(null);
                setShowAddClass(false);
                setNewClassName('');
              }}>
                <ThemedText className="text-white text-center font-bold">Take another photo</ThemedText>
              </Button>
              <Button className="bg-blue-600 py-4 px-6 rounded-lg" onPress={() => uploadImageToAPI(capturedImage)}>
                <ThemedText className="text-white text-center font-bold">Detect Again</ThemedText>
              </Button>
            </ThemedView>

            {/* クラス追加セクション */}
            <ThemedView className="w-full max-w-sm mt-6">
              <ThemedText className="text-lg font-bold mb-2 text-center">Add New Class</ThemedText>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colorScheme === 'dark' ? '#555' : '#ccc',
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                  color: colorScheme === 'dark' ? '#fff' : '#000',
                  marginBottom: 12,
                }}
                placeholder="Enter class name"
                placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
                value={newClassName}
                onChangeText={setNewClassName}
              />
              <Button
                className="bg-purple-600 py-3 px-4 rounded-lg"
                onPress={handleAddClass}
                disabled={!newClassName.trim()}
              >
                <ThemedText className="text-white text-center font-bold">Add Class</ThemedText>
              </Button>
            </ThemedView>
          </ScrollView>
        ) : (
          <ThemedView className="items-center">
            <Image source={{ uri: capturedImage }} className="w-80 h-60 rounded-lg" />
            <ThemedView className="flex-row gap-4 mt-4">
              <Button className="bg-blue-600 py-4 px-6 rounded-lg" onPress={() => {
                setCapturedImage(null);
                setDetectionResults(null);
                setShowAddClass(false);
                setNewClassName('');
              }}>
                <ThemedText className="text-white text-center font-bold">Take another photo</ThemedText>
              </Button>
              <Button className="bg-green-600 py-4 px-6 rounded-lg" onPress={() => uploadImageToAPI(capturedImage)}>
                <ThemedText className="text-white text-center font-bold">Detect</ThemedText>
              </Button>
            </ThemedView>

            {/* クラス追加セクション */}
            <ThemedView className="w-full max-w-sm mt-6">
              <ThemedText className="text-lg font-bold mb-2 text-center">Add New Class</ThemedText>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colorScheme === 'dark' ? '#555' : '#ccc',
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                  color: colorScheme === 'dark' ? '#fff' : '#000',
                  marginBottom: 12,
                }}
                placeholder="Enter class name"
                placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
                value={newClassName}
                onChangeText={setNewClassName}
              />
              <Button
                className="bg-purple-600 py-3 px-4 rounded-lg"
                onPress={handleAddClass}
                disabled={!newClassName.trim()}
              >
                <ThemedText className="text-white text-center font-bold">Add Class</ThemedText>
              </Button>
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <CameraView
        className="w-full flex-1"
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
          >
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={selectFromGallery}>
            <Ionicons name="cloud-upload-outline" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>

      {isLoading && (
        <ThemedView style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <ThemedText className="mt-2 text-base text-white">Analyzing image...</ThemedText>
        </ThemedView>
      )}

      {detectionResults && (
        <ThemedView style={styles.resultsOverlay}>
          <ScrollView style={styles.resultsScroll}>
            <ThemedText className="text-xl font-bold mb-2 text-white">検出結果</ThemedText>
            <ThemedText className="text-base mb-4 italic text-white">{detectionResults.message}</ThemedText>

            {detectionResults.detections.map((detection, index) => (
              <ThemedView key={index} style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 12, marginBottom: 8, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#3b82f6' }}>
                <ThemedText className="text-base font-bold mb-1" style={{ color: '#000' }}>
                  クラス: {detection.class}
                </ThemedText>
                <ThemedText className="text-sm mb-1" style={{ color: '#666' }}>
                  信頼度: {(detection.confidence * 100).toFixed(1)}%
                </ThemedText>
                <ThemedText className="text-xs" style={{ color: '#999' }}>
                  位置: [{detection.bbox.map(coord => Math.round(coord)).join(', ')}]
                </ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    width: '100%',
  },
  controls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  flipButton: {
    position: 'absolute',
    left: 30,
    bottom: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
  uploadButton: {
    position: 'absolute',
    right: 30,
    bottom: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 20,
  },
  resultsScroll: {
    flex: 1,
  },
});

export default HomeScreen;