# Flask Chat Application

This is a simple Flask chat application that provides an API endpoint for sending messages.

## Project Structure

```
flask-chat-app
├── app.py
├── requirements.txt
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd flask-chat-app
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Run the Flask application:
   ```
   python app.py
   ```

2. The application will be running on `http://127.0.0.1:5000`.

3. To send a message, make a POST request to the `/sendMessage` endpoint with the message data. Example using `curl`:
   ```
   curl -X POST http://127.0.0.1:5000/sendMessage -H "Content-Type: application/json" -d '{"message": "Hello, World!"}'
   ```

## API Endpoint

### POST /sendMessage

- **Request Body**: 
  - `message`: The message to be sent (string).
  
- **Response**: 
  - Returns a JSON object with a confirmation message.

## License

This project is licensed under the MIT License.