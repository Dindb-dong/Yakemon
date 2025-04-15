import os
from PIL import Image

# 변환 대상 폴더 리스트
TARGET_FOLDERS = ['red_hp', 'yellow_hp', 'green_hp', 'red_hp_2', 'yellow_hp_2', 'green_hp_2']
BASE_PATH = 'public/assets'

def convert_png_to_webp_and_remove():
    print("🟡 PNG → WEBP 변환 후 PNG 삭제")
    for folder in TARGET_FOLDERS:
        folder_path = os.path.join(BASE_PATH, folder)
        if not os.path.exists(folder_path):
            print(f"폴더 없음: {folder_path}")
            continue

        for root, dirs, files in os.walk(folder_path):
            for file in files:
                if file.endswith(".png"):
                    png_path = os.path.join(root, file)
                    webp_file = os.path.splitext(file)[0] + ".webp"
                    webp_path = os.path.join(root, webp_file)

                    try:
                        with Image.open(png_path) as img:
                            img.save(webp_path, "WEBP", quality=85)
                            print(f"✅ 변환: {webp_path}")
                        os.remove(png_path)
                        print(f"🗑️ 삭제: {png_path}")
                    except Exception as e:
                        print(f"⚠️ 오류 ({png_path}): {e}")

def convert_webp_to_png():
    print("🟢 WEBP → PNG 복원")
    for folder in TARGET_FOLDERS:
        folder_path = os.path.join(BASE_PATH, folder)
        if not os.path.exists(folder_path):
            print(f"폴더 없음: {folder_path}")
            continue

        for root, dirs, files in os.walk(folder_path):
            for file in files:
                if file.endswith(".webp"):
                    webp_path = os.path.join(root, file)
                    png_file = os.path.splitext(file)[0] + ".png"
                    png_path = os.path.join(root, png_file)

                    try:
                        with Image.open(webp_path) as img:
                            img.save(png_path, "PNG")
                            print(f"✅ 복원: {png_path}")
                    except Exception as e:
                        print(f"⚠️ 오류 ({webp_path}): {e}")

if __name__ == "__main__":
    print("0 → PNG을 WEBP로 변환 + PNG 삭제")
    print("1 → WEBP를 PNG로 복원")
    mode = input("원하는 작업을 선택하세요 (0 또는 1): ")

    if mode == "0":
        convert_png_to_webp_and_remove()
    elif mode == "1":
        convert_webp_to_png()
    else:
        print("❌ 잘못된 입력입니다. 0 또는 1만 입력하세요.")
        
# python3 convert_images.py