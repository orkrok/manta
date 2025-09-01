from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/sendMessage', methods=['POST'])
def send_message():
    data = request.get_json()
    message = data.get('message')

    if not message:
        return jsonify({'error': 'No message provided'}), 400

    # Here you can add logic to process the message
    response_message = f"Message received: {message}"

    return jsonify({'response': response_message}), 200

if __name__ == '__main__':
    app.run(debug=True)