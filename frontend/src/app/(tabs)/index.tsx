import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState } from "react";

const HomeScreen = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000")
      .then(res => res.json())
      .then(data => {
        setData(data);
      });
  },[])

  return (
    <ThemedView>
      <ThemedText>{JSON.stringify(data)}</ThemedText>
    </ThemedView>
  );
};

export default HomeScreen;