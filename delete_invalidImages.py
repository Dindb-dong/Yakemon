import os
from PIL import Image
import numpy as np

# 검사 대상 폴더 리스트
TARGET_FOLDERS = ['red_hp', 'yellow_hp', 'green_hp', 'red_hp_2', 'yellow_hp_2', 'green_hp_2']
BASE_PATH = 'public/assets'

def is_invalid_image(image_path: str) -> bool:
    try:
        with Image.open(image_path).convert("RGBA") as img:
            arr = np.array(img)
            rgb_part = arr[..., :3]
            alpha_part = arr[..., 3]

            # 완전히 흰색이거나, 완전히 투명한 경우
            return np.all(rgb_part == 255) or np.all(alpha_part == 0)
    except Exception as e:
        print(f"⚠️ 오류 ({image_path}): {e}")
        return False

def delete_invalid_images():
    print("🧹 전부 흰색인 webp 이미지 삭제")
    for folder in TARGET_FOLDERS:
        print(folder, '탐색중...')
        folder_path = os.path.join(BASE_PATH, folder)
        if not os.path.exists(folder_path):
            print(f"❌ 폴더 없음: {folder_path}")
            continue

        for root, _, files in os.walk(folder_path):
            for file in files:
                if file.endswith(".webp"):
                    file_path = os.path.join(root, file)
                    if is_invalid_image(file_path):
                        try:
                            os.remove(file_path)
                            print(f"🗑️ 삭제: {file_path}")
                        except Exception as e:
                            print(f"❌ 삭제 실패 ({file_path}): {e}")
                    else: print('비어있는 이미지가 아님:', file_path)
                else: print('webp 형식이 아님:', file)

if __name__ == "__main__":
    delete_invalid_images()
    
## python3 delete_invalidImages.py