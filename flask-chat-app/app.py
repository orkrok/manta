from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
from dotenv import load_dotenv
from openai import OpenAI

print("KEY from env:", os.getenv("OPENAI_API_KEY"))
# 1. 환경 변수 로드
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OpenAI API 키가 설정되지 않았습니다. .env 확인하세요.")

# 2. Flask 앱과 CORS 설정
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# 3. OpenAI 클라이언트 생성
client = OpenAI(api_key=api_key)

assistant_id_from_env = os.getenv("OPENAI_ASSISTANT_ID")

# 4. Assistants API 기반 채팅 엔드포인트
@app.route('/sendMessage', methods=['POST'])
def send_message():
    data = request.json
    username = data.get("username", "anonymous")
    message = data.get("message", "")
    provided_assistant_id = data.get("assistant_id")
    thread_id = data.get("thread_id")

    assistant_id = provided_assistant_id or assistant_id_from_env
    if not assistant_id:
        return jsonify({
            "error": "assistant_id가 없습니다. 요청 바디에 assistant_id를 포함하거나 환경 변수 OPENAI_ASSISTANT_ID를 설정하세요."
        }), 400

    try:
        # 스레드가 없으면 생성
        if not thread_id:
            thread = client.beta.threads.create()
            thread_id = thread.id

        # 사용자 메시지를 스레드에 추가
        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=message
        )

        # Run 생성 및 완료까지 폴링
        run = client.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=assistant_id
        )

        max_wait_seconds = 60
        start_time = time.time()
        while True:
            run = client.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run.id
            )
            if run.status in ["completed", "failed", "cancelled", "expired"]:
                break
            if time.time() - start_time > max_wait_seconds:
                break
            time.sleep(0.7)

        bot_reply = ""
        run_status = getattr(run, "status", "unknown")

        if run_status == "completed":
            messages = client.beta.threads.messages.list(
                thread_id=thread_id,
                order="desc",
                limit=5
            )
            # 가장 최근 assistant 메시지 추출
            assistant_message = next(
                (m for m in messages.data if m.role == "assistant"),
                None
            )
            if assistant_message and assistant_message.content:
                # text 파트 추출
                text_parts = [
                    part.text.value for part in assistant_message.content
                    if getattr(part, "type", "") == "text" and getattr(part, "text", None)
                ]
                bot_reply = "\n".join(text_parts) if text_parts else ""
        else:
            bot_reply = f"Run 상태: {run_status}"

    except Exception as e:
        return jsonify({
            "error": f"Assistants API 호출 실패: {e}",
        }), 500

    print(f"[{username}] {message} -> {bot_reply}")

    return jsonify({
        "username": username,
        "user_message": message,
        "bot_reply": bot_reply,
        "thread_id": thread_id,
        "run_status": run_status
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
