"""Simple mock API server for frontend testing.

Run: python3 mock_server.py

Provides minimal endpoints:
- GET /api/                  -> health
- POST /api/auth/register    -> register user (returns token + user)
- POST /api/auth/login       -> login user (returns token + user)

This allows the frontend to test registration/login without the full backend.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

USERS = {}

@app.route('/api/', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Mock API running'})

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name') or data.get('fullName') or data.get('username')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone') or ''
    if not email or not password or not name:
        return jsonify({'error': 'Missing fields'}), 400
    if email in USERS:
        return jsonify({'error': 'User exists'}), 400
    user = {
        'id': str(uuid.uuid4()),
        'name': name,
        'email': email,
        'phone': phone,
        'role': 'customer'
    }
    USERS[email] = {'user': user, 'password': password}
    token = 'mock-token-' + str(uuid.uuid4())
    return jsonify({'token': token, 'user': user}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Missing fields'}), 400
    rec = USERS.get(email)
    if not rec or rec.get('password') != password:
        return jsonify({'error': 'Invalid credentials'}), 401
    token = 'mock-token-' + str(uuid.uuid4())
    return jsonify({'token': token, 'user': rec['user']})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
