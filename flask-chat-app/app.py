from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
from openai import OpenAI
from pymongo import MongoClient
import json

# === 기본 설정 ===
app = Flask(__name__)
CORS(app)

client_ai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client.get_database()
messages_collection = db["messages"]

RESUME_TEXT = """
이름: 우주혁
직무: 클라우드 보안 엔지니어
현 직장: Cinamon
기술: AWS, Linux, Palo Alto-XDR, Python, Docker, K8S
자격증: 리눅스마스터 2급, 네트워크관리사 2급, Azure-900, 정보처리기사 필기 합격
교육 이수 : KT클라우드와 NHN클라우드로 완성하는 클라우드 엔지니어 과정
인턴 : 가상화 기술지원 - 소만사
외국어 : TOEIC 940 (24.10)
경험: SK Innovation XDR 기술지원 / 무신사 프로젝트
"""

# === POST: 메시지 전송 ===
@app.route("/sendMessage", methods=["POST"])
def send_message():
    data = request.get_json()
    username = data.get("username", "anonymous")
    message = data.get("message", "")

    prompt = f"""
아래는 사용자의 이력서입니다:
{RESUME_TEXT}

위 이력서를 기반으로 다음 질문에 답변하고, 관련된 추천 질문 3개도 제안해주세요.

1. 질문에 대한 대답을 자연스럽게 한국어로 작성
2. 추천 질문 3개를 JSON 배열로 작성
3. 반드시 아래 JSON 형태로 응답:

{{
    "message": "AI의 대답",
    "recommend_questions": ["질문1", "질문2", "질문3"]
}}

사용자 질문: "{message}"
"""

    try:
        response = client_ai.responses.create(
            model="gpt-4.1-mini",
            input=[
                {"role": "system", "content": "너는 이력서 기반으로 나를 설명해주는 비서야."},
                {"role": "user", "content": prompt}
            ]
        )

        raw_output = response.output[0].content[0].text
        try:
            parsed = json.loads(raw_output)
        except json.JSONDecodeError:
            parsed = {"message": raw_output, "recommend_questions": []}

        # MongoDB 저장
        messages_collection.insert_one({
            "username": username,
            "user_message": message,
            "bot_reply": parsed.get("message", ""),
            "recommend_questions": parsed.get("recommend_questions", []),
            "timestamp": time.time()
        })

        # 프론트 응답 (bot_reply 키 사용)
        return jsonify({
            "bot_reply": parsed.get("message", ""),
            "recommend_questions": parsed.get("recommend_questions", [])
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === GET: 메시지 조회 ===
@app.route("/getMessages", methods=["GET"])
def get_messages():
    try:
        messages = list(messages_collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(50))
        return jsonify(messages)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)