import tensorflow as tf
from tensorflow import keras
from keras.models import load_model
from keras.saving import register_keras_serializable
import subprocess

@register_keras_serializable()
def subtract_mean(x):
    return x - tf.reduce_mean(x, axis=1, keepdims=True)

# 입력
keras_path = input("Your file name (.keras): ")
saved_model_path = "./converted/saved_model"
tfjs_output_path = "./converted/final_tfjs"

# 1. 모델 로드
model = load_model(keras_path)
print("✅ 모델 로드 완료:", keras_path)

# 2. SavedModel 형식으로 저장 (이제는 export 사용!)
model.export(saved_model_path)
print("✅ SavedModel 저장 완료:", saved_model_path)

# 3. TensorFlow.js 변환
result = subprocess.run([
    "tensorflowjs_converter",
    "--input_format=tf_saved_model",
    "--output_format=tfjs_graph_model",
    saved_model_path,
    tfjs_output_path
], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

if result.returncode == 0:
    print("🎉 TFJS 변환 성공:", tfjs_output_path)
else:
    print("❌ TFJS 변환 실패:")
    print(result.stderr)