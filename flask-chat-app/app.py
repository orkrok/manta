from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI

# 환경변수 로드
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)

# OpenAI 클라이언트 생성
client = OpenAI(api_key=api_key)


@app.route('/sendMessage', methods=['POST'])
def send_message():
    data = request.json  # JSON 데이터 받기
    username = data.get("username")
    message = data.get("message")


    # ✅ OpenAI API 호출
    response = client.chat.completions.create(
        model="gpt-4o-mini",   # 포트폴리오에서는 가벼운 모델 추천
        messages=[
            {"role": "system", "content": "당신은 포트폴리오를 소개하는 친절한 챗봇입니다."},
            {"role": "user", "content": message}
        ]
    )

    bot_reply = response.choices[0].message.content

    # 서버 터미널에 출력
    print(f"{username} says: {message}")

    # JSON 응답 보내기
    # return jsonify({
    #     "response": f"{username} says: {message}"
    # }), 200

    return jsonify({
       "username": username,
       "user_message": message,
       "bot_reply": bot_reply
    }), 200




if __name__ == '__main__':
    app.run(debug=True)
