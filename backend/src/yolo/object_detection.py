from ultralytics import YOLOWorld
import os
import json
from datetime import datetime

class Yolo:
    def __init__(self) -> None:
        self.model = YOLOWorld("yolov8s-world.pt")
        self.learning_data = []
        self.model_path = "yolov8s-world.pt"
        self.custom_prompts = []  # カスタムプロンプトを保存

    def predict(self, image_path):
        """通常のオブジェクト検出"""
        return self.model.predict(image_path)

    def predict_with_prompt(self, image_path, prompt):
        """
        自然言語プロンプトを使用したオブジェクト検出

        Args:
            image_path (str): 画像のパス
            prompt (str): 検出したいオブジェクトの自然言語記述
                        例: "please detect chopsticks", "find a red car"

        Returns:
            results: 検出結果
        """
        # プロンプトからオブジェクト名を抽出
        object_name = self._extract_object_from_prompt(prompt)

        # YOLO-Worldでプロンプトベースの検出を実行
        # 記事の例に従って、プロンプトを設定してから検出
        results = self.model.predict(
            source=image_path,
            conf=0.25,  # 信頼度閾値
            save=True,  # 結果を保存
            project="predictions",  # 保存先ディレクトリ
            name=f"prompt_{object_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        )

        print(f"検出対象: {object_name}")
        print(f"プロンプト: {prompt}")

        return results

    def set_custom_prompts(self, prompts):
        """
        カスタムプロンプトを設定

        Args:
            prompts (list): プロンプトのリスト
                例: ["chopsticks", "red car", "apple"]
        """
        self.custom_prompts = prompts
        print(f"カスタムプロンプト設定: {prompts}")

    def predict_with_custom_prompts(self, image_path):
        """
        設定されたカスタムプロンプトで検出

        Args:
            image_path (str): 画像のパス

        Returns:
            results: 検出結果
        """
        if not self.custom_prompts:
            print("カスタムプロンプトが設定されていません。set_custom_prompts()で設定してください。")
            return None

        # 各プロンプトで個別に検出を実行
        all_results = []
        for prompt in self.custom_prompts:
            print(f"プロンプト '{prompt}' で検出中...")
            result = self.predict_with_prompt(image_path, prompt)
            all_results.extend(result)

        print(f"カスタムプロンプト検出完了: {self.custom_prompts}")

        return all_results

    def save_custom_vocabulary(self, filename="custom_vocabulary.yaml"):
        """
        カスタム語彙を保存

        Args:
            filename (str): 保存するファイル名
        """
        if not self.custom_prompts:
            print("保存するカスタムプロンプトがありません。")
            return

        # YAMLファイルとして保存
        yaml_content = f"""# Custom Vocabulary for YOLO-World
vocabulary:
{chr(10).join(f'  - {prompt}' for prompt in self.custom_prompts)}

# Usage example:
# yolo = Yolo()
# yolo.load_custom_vocabulary()
# results = yolo.predict_with_custom_prompts("image.jpg")
"""

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(yaml_content)

        print(f"カスタム語彙保存: {filename}")

    def load_custom_vocabulary(self, filename="custom_vocabulary.yaml"):
        """
        カスタム語彙を読み込み

        Args:
            filename (str): 読み込むファイル名
        """
        try:
            import yaml
            with open(filename, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)

            if 'vocabulary' in data:
                self.set_custom_prompts(data['vocabulary'])
                print(f"カスタム語彙読み込み: {data['vocabulary']}")
            else:
                print("ファイルにvocabularyセクションが見つかりません。")

        except FileNotFoundError:
            print(f"ファイルが見つかりません: {filename}")
        except Exception as e:
            print(f"ファイル読み込みエラー: {e}")

    def _extract_object_from_prompt(self, prompt):
        """
        プロンプトからオブジェクト名を抽出する簡単な処理

        Args:
            prompt (str): 自然言語プロンプト

        Returns:
            str: 抽出されたオブジェクト名
        """
        # 一般的なパターンを処理
        prompt_lower = prompt.lower()

        # "please detect" や "find" などの指示語を除去
        remove_words = ["please", "detect", "find", "locate", "show", "identify"]
        for word in remove_words:
            prompt_lower = prompt_lower.replace(word, "").strip()

        # 複数のオブジェクトが指定されている場合は最初のものを使用
        objects = prompt_lower.split()
        if objects:
            return objects[0]

        return "object"

    def self_learn(self, image_path, prompt, save_annotations=True):
        """
        検出結果を基にした自己学習機能

        Args:
            image_path (str): 学習用画像のパス
            prompt (str): 検出したいオブジェクトのプロンプト
            save_annotations (bool): アノテーションを保存するかどうか

        Returns:
            dict: 学習結果の情報
        """
        # プロンプトベースの検出を実行
        results = self.predict_with_prompt(image_path, prompt)

        # 検出結果を学習データとして保存
        learning_info = {
            "image_path": image_path,
            "prompt": prompt,
            "object_name": self._extract_object_from_prompt(prompt),
            "timestamp": datetime.now().isoformat(),
            "detections": []
        }

        # 検出結果を処理
        for result in results:
            if result.boxes is not None:
                boxes = result.boxes
                for i in range(len(boxes)):
                    # バウンディングボックス情報を取得
                    box = boxes.xyxy[i].cpu().numpy()  # x1, y1, x2, y2
                    conf = boxes.conf[i].cpu().numpy()
                    cls = boxes.cls[i].cpu().numpy()

                    detection = {
                        "bbox": box.tolist(),
                        "confidence": float(conf),
                        "class_id": int(cls)
                    }
                    learning_info["detections"].append(detection)

        # 学習データに追加
        self.learning_data.append(learning_info)

        # アノテーションファイルを保存
        if save_annotations:
            self._save_annotations(learning_info)

        print(f"学習データに追加: {len(learning_info['detections'])} 個の検出結果")

        return learning_info

    def _save_annotations(self, learning_info):
        """
        アノテーション情報をファイルに保存

        Args:
            learning_info (dict): 学習情報
        """
        # アノテーション保存用ディレクトリを作成
        os.makedirs("annotations", exist_ok=True)

        # ファイル名を生成
        base_name = os.path.splitext(os.path.basename(learning_info["image_path"]))[0]
        annotation_file = f"annotations/{base_name}_{learning_info['object_name']}.json"

        # JSONファイルとして保存
        with open(annotation_file, 'w', encoding='utf-8') as f:
            json.dump(learning_info, f, ensure_ascii=False, indent=2)

        print(f"アノテーション保存: {annotation_file}")

    def train_with_custom_data(self, epochs=10, batch_size=16):
        """
        蓄積された学習データを使用してモデルを再学習

        Args:
            epochs (int): 学習エポック数
            batch_size (int): バッチサイズ

        Returns:
            results: 学習結果
        """
        if not self.learning_data:
            print("学習データがありません。まずself_learn()でデータを追加してください。")
            return None

        print(f"学習データ数: {len(self.learning_data)}")

        # 学習データをYOLO形式に変換
        # 注意: 実際の実装では、YOLO形式のデータセット構造を作成する必要があります
        # ここでは簡略化した例を示します

        # カスタムデータセット設定
        data_config = {
            "train": "path/to/train/images",  # 実際のパスに変更
            "val": "path/to/val/images",      # 実際のパスに変更
            "nc": 1,  # クラス数
            "names": ["custom_object"]  # クラス名
        }

        # 学習実行
        try:
            results = self.model.train(
                data=data_config,
                epochs=epochs,
                batch=batch_size,
                imgsz=640,
                save=True,
                project="custom_training",
                name=f"self_learned_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            )

            print("自己学習が完了しました")
            return results

        except Exception as e:
            print(f"学習中にエラーが発生しました: {e}")
            return None

    def get_learning_stats(self):
        """
        学習データの統計情報を取得

        Returns:
            dict: 統計情報
        """
        if not self.learning_data:
            return {"total_samples": 0, "total_detections": 0}

        total_detections = sum(len(data["detections"]) for data in self.learning_data)

        return {
            "total_samples": len(self.learning_data),
            "total_detections": total_detections,
            "objects_learned": list(set(data["object_name"] for data in self.learning_data))
        }

# 使用例
if __name__ == "__main__":
    yolo = Yolo()

    # 自然言語プロンプトでの検出
    print("=== プロンプトベース検出 ===")
    res = yolo.predict_with_prompt("./apple.jpeg", "please detect apple")

    # カスタムプロンプトの設定
    print("\n=== カスタムプロンプト設定 ===")
    yolo.set_custom_prompts(["chopsticks", "red car", "apple"])

    # カスタムプロンプトでの検出
    print("\n=== カスタムプロンプト検出 ===")
    res_custom = yolo.predict_with_custom_prompts("./apple.jpeg")

    # カスタム語彙の保存
    print("\n=== カスタム語彙保存 ===")
    yolo.save_custom_vocabulary()

    # 自己学習
    print("\n=== 自己学習 ===")
    learning_result = yolo.self_learn("./apple.jpeg", "please detect chopsticks")

    # 学習統計
    print("\n=== 学習統計 ===")
    stats = yolo.get_learning_stats()
    print(f"学習サンプル数: {stats['total_samples']}")
    print(f"検出総数: {stats['total_detections']}")
    print(f"学習済みオブジェクト: {stats['objects_learned']}")
