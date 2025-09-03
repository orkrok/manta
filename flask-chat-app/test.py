import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

try:
    response = client.models.list()
    print("✅ 연결 성공, 사용 가능한 모델:", [m.id for m in response.data[:5]])
except Exception as e:
    print("❌ 연결 실패:", e)
