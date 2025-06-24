import ModelFineTuningManager from "@/components/model/ModelTrainingManager";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView, ScrollView } from "react-native";

const FineTuningScreen = () => {
  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <ModelFineTuningManager />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}

export default FineTuningScreen;