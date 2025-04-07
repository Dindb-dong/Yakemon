import os

BASE_PATH = 'assets'
TARGET_FOLDERS = ['red_hp', 'yellow_hp', 'green_hp', 'red_hp_2', 'yellow_hp_2', 'green_hp_2']
TARGET_KEYWORD = '0000-'

deleted_files = []

for folder in TARGET_FOLDERS:
    folder_path = os.path.join(BASE_PATH, folder)
    if not os.path.exists(folder_path):
        continue

    # 각 도감번호 폴더 순회
    for dex_folder in os.listdir(folder_path):
        dex_path = os.path.join(folder_path, dex_folder)
        if not os.path.isdir(dex_path):
            continue

        for filename in os.listdir(dex_path):
            if TARGET_KEYWORD in filename:
                file_path = os.path.join(dex_path, filename)
                os.remove(file_path)
                deleted_files.append(file_path)

print(f"✅ 삭제 완료: {len(deleted_files)}개 파일")
for f in deleted_files:
    print(f"🗑️  {f}")
    
# python3 delete_invalid_files.py