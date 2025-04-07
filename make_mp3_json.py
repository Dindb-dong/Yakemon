import os
import json

# 기준 경로
BASE_FOLDER = "public/sound"

# 범주별 키워드
CATEGORY_PREFIXES = ["main", "battle", "last_one", "win", "defeat"]

# 결과 구조 초기화
categorized = {prefix: [] for prefix in CATEGORY_PREFIXES}

# 파일 순회
for file in os.listdir(BASE_FOLDER):
    if file.endswith(".mp3"):
        for prefix in CATEGORY_PREFIXES:
            if file.startswith(prefix):
                categorized[prefix].append(f"/sound/{file}")
                break

# 저장
manifest_path = "public/sound-manifest.json"
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(categorized, f, indent=2, ensure_ascii=False)

print(f"✅ Created: {manifest_path}")

# python3 make_mp3_json.py