#!/usr/bin/env python3
"""Lightweight mock API server without external dependencies.

Run: python3 mock_server_simple.py

Implements minimal endpoints for frontend testing with CORS headers:
- GET  /api/                -> health
- POST /api/auth/register   -> register user
- POST /api/auth/login      -> login user
"""
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import uuid

USERS = {}

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, code=200, content_type='application/json'):
        self.send_response(code)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/api/' or path == '/api':
            self._set_headers(200)
            self.wfile.write(json.dumps({'status':'ok','message':'Mock API'}).encode())
            return
        self._set_headers(404)
        self.wfile.write(json.dumps({'error':'not found'}).encode())

    def do_POST(self):
        path = urlparse(self.path).path
        length = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(length).decode() if length else ''
        try:
            data = json.loads(raw) if raw else {}
        except Exception:
            data = {}

        if path == '/api/auth/register':
            name = data.get('name') or data.get('fullName')
            email = data.get('email')
            password = data.get('password')
            phone = data.get('phone') or ''
            if not name or not email or not password:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error':'Missing fields'}).encode())
                return
            if email in USERS:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error':'User exists'}).encode())
                return
            user = {'id': str(uuid.uuid4()), 'name': name, 'email': email, 'phone': phone, 'role':'customer'}
            USERS[email] = {'user': user, 'password': password}
            token = 'mock-token-' + str(uuid.uuid4())
            self._set_headers(201)
            self.wfile.write(json.dumps({'token': token, 'user': user}).encode())
            return

        if path == '/api/auth/login':
            email = data.get('email')
            password = data.get('password')
            if not email or not password:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error':'Missing fields'}).encode())
                return
            rec = USERS.get(email)
            if not rec or rec.get('password') != password:
                self._set_headers(401)
                self.wfile.write(json.dumps({'error':'Invalid credentials'}).encode())
                return
            token = 'mock-token-' + str(uuid.uuid4())
            self._set_headers(200)
            self.wfile.write(json.dumps({'token': token, 'user': rec['user']}).encode())
            return

        # default
        self._set_headers(404)
        self.wfile.write(json.dumps({'error':'not found'}).encode())

def run(host='0.0.0.0', port=5000):
    server = HTTPServer((host, port), Handler)
    print(f'Mock API running on http://{host}:{port}/api/')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('Shutting down')
        server.server_close()

if __name__ == '__main__':
    import os
    import sys
    port = int(os.environ.get('PORT', sys.argv[1] if len(sys.argv) > 1 else 5001))
    run(port=port)
