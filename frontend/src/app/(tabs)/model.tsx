import { ThemedView } from "@/components/ThemedView";
import { ModelClassManager } from "@/components/model/ModelClassManager";
import { SafeAreaView, StyleSheet } from "react-native";

const ModelScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        <ModelClassManager />
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ModelScreen;