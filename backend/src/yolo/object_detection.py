from ultralytics import YOLOWorld
import json
from pathlib import Path

class YoloDetector:
    def __init__(self, model_path="./yolov8s-world.pt", vocab_file="custom_vocab.json"):
        self.model = YOLOWorld(model_path)
        self.model_path = model_path
        self.vocab_file = Path(vocab_file)
        self.current_classes = set()
        self._load_custom_vocab()

    def _load_custom_vocab(self):
        if self.vocab_file.exists():
            try:
                with open(self.vocab_file, 'r', encoding='utf-8') as f:
                    loaded_vocab = json.load(f)
                    if isinstance(loaded_vocab, list):
                        self.current_classes.update(loaded_vocab)
                        print(f"Loaded custom vocabulary: {self.current_classes}")
                    else:
                        print(f"Warning: Invalid format in {self.vocab_file}.")
            except json.JSONDecodeError:
                print(f"Warning: JSON decoding error in {self.vocab_file}. File might be corrupted.")
        self._update_model_classes()

    def _save_custom_vocab(self):
        with open(self.vocab_file, 'w', encoding='utf-8') as f:
            json.dump(list(self.current_classes), f, ensure_ascii=False, indent=4)
        print(f"Custom vocabulary saved to {self.vocab_file}.")

    def _update_model_classes(self):
        if self.current_classes:
            self.model.set_classes(list(self.current_classes))
            print(f"Model detection classes updated: {list(self.current_classes)}")
        else:
            print("No detection classes set.")

    def add_classes(self, new_classes: list[str]):
        for cls in new_classes:
            self.current_classes.add(cls)
        self._update_model_classes()
        self._save_custom_vocab()

    def get_current_classes(self) -> list[str]:
        return list(self.current_classes)

    def predict_image(self, image_path: str, conf_threshold: float = 0.25):
        if not self.current_classes:
            print("Warning: No detection classes set. Please add classes using add_classes() first.")
            return None

        print(f"Executing detection on {image_path} (Classes: {list(self.current_classes)})...")
        results = self.model.predict(image_path, conf=conf_threshold, verbose=False)
        return results[0]


if __name__ == "__main__":
    detector = YoloDetector()

    print("\n--- Scenario 1: Initial detection (no default classes) ---")
    image_to_predict_1 = "assets/apple.jpg"

    results_1 = detector.predict_image(image_to_predict_1)
    if results_1:
        results_1.show()

    print("\n--- Scenario 2: Add new classes and re-detect ---")
    new_class_1 = "cup"
    new_class_2 = "laptop"
    detector.add_classes([new_class_1, new_class_2])

    results_2 = detector.predict_image(image_to_predict_1)
    if results_2:
        results_2.show()

    print("\n--- Scenario 3: Reload model and check if custom vocabulary is retained ---")
    new_detector = YoloDetector()
    print(f"Custom vocabulary after reload: {new_detector.get_current_classes()}")

    image_to_predict_2 = "assets/apple.jpg"

    results_3 = new_detector.predict_image(image_to_predict_2)
    if results_3:
        results_3.show()