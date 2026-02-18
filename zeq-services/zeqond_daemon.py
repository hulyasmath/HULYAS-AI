#!/usr/bin/env python3
"""
Zeqond Daemon - ZEQ OS HulyaPulse Synchronization Service
Maintains precise 1.287 Hz HulyaPulse synchronization and serves pulse data to clients.

Note on Multiple Instances: Each daemon instance runs independently. 
Configure one as a master and others as clients for a synchronized network.
"""

import time
import math
import socket
import threading
import signal
import sys
from typing import Optional
import json
from io import BytesIO

# Constants
HULYAPULSE_HZ = 1.287
ZEQOND = 1.0 / HULYAPULSE_HZ  # Period of HulyaPulse (0.777 seconds)
PORT = 2871  # Changed from 2870 to avoid refresh issues
UNIX_EPOCH = 0.0  # January 1, 1970 00:00:00 UTC - true computation second
# Big Bang: ~13.787 billion years ago = ~4.35086 × 10^17 seconds
BIG_BANG_SECONDS = 4.35086e17  # Age of universe in seconds

# Global state
keep_running = True
pulse_count = 0
current_zeqond = 0.0  # Zeqond from Unix epoch (Jan 1, 1970)
current_zeqond_bigbang = 0.0  # Zeqond from Big Bang
pulse_lock = threading.Lock()
start_time = None


def handle_signal(signum, frame):
    """Handle shutdown signals gracefully."""
    global keep_running
    print(f"\n🛑 Received signal {signum}, shutting down...")
    keep_running = False


def pulse_thread():
    """Main pulse generation thread - maintains 1.287 Hz HulyaPulse synchronization."""
    global pulse_count, current_zeqond, current_zeqond_bigbang, start_time
    
    # Start from Unix epoch (January 1, 1970)
    current_unix_time = time.time()
    # Calculate how many 0.777-second units (Zeqond) have elapsed since epoch
    seconds_since_epoch = current_unix_time - UNIX_EPOCH
    # Zeqond from Unix epoch = seconds / 0.777
    current_zeqond = seconds_since_epoch / ZEQOND
    # Zeqond from Big Bang = (Big Bang seconds + seconds since epoch) / 0.777
    current_zeqond_bigbang = (BIG_BANG_SECONDS + seconds_since_epoch) / ZEQOND
    pulse_count = int(current_zeqond)
    start_time = current_unix_time
    next_pulse_time = current_unix_time
    
    print(f"🔄 Pulse thread started - HulyaPulse frequency: {HULYAPULSE_HZ} Hz")
    print(f"⏱️  Zeqond period: {ZEQOND:.6f} seconds")
    print(f"📅 Zeqond from Unix epoch (Jan 1, 1970): {current_zeqond:.2f}")
    print(f"🌌 Zeqond from Big Bang: {current_zeqond_bigbang:.2e}")
    
    while keep_running:
        # Calculate next pulse time
        next_pulse_time += ZEQOND
        
        # Sleep until next pulse
        sleep_time = next_pulse_time - time.time()
        if sleep_time > 0:
            time.sleep(sleep_time)
        else:
            # If we're behind, catch up
            next_pulse_time = time.time() + ZEQOND
        
        # Update pulse count and Zeqond values
        current_unix_time = time.time()
        seconds_since_epoch = current_unix_time - UNIX_EPOCH
        with pulse_lock:
            pulse_count += 1
            # Zeqond from Unix epoch
            current_zeqond = seconds_since_epoch / ZEQOND
            # Zeqond from Big Bang
            current_zeqond_bigbang = (BIG_BANG_SECONDS + seconds_since_epoch) / ZEQOND
        
        # Log pulse (optional, can be disabled for performance)
        if pulse_count % 100 == 0:  # Log every 100 pulses
            print(f"💓 HulyaPulse: {pulse_count}, Zeqond: {current_zeqond:.6f}")
    
    print("🛑 Pulse thread stopped")


class BufferedSocket:
    """Wrapper to allow 'unreading' data for protocol detection."""
    def __init__(self, sock, initial_data):
        self.sock = sock
        self.buffer = BytesIO(initial_data)
        self.buffer.seek(0)
    
    def recv(self, size):
        if self.buffer.tell() < len(self.buffer.getvalue()):
            # Read from buffer first
            remaining = len(self.buffer.getvalue()) - self.buffer.tell()
            if remaining > 0:
                data = self.buffer.read(min(size, remaining))
                if size > remaining:
                    # Need more data from socket
                    data += self.sock.recv(size - remaining)
                return data
        return self.sock.recv(size)
    
    def send(self, data):
        return self.sock.send(data)
    
    def sendall(self, data):
        return self.sock.sendall(data)
    
    def close(self):
        return self.sock.close()
    
    def settimeout(self, timeout):
        return self.sock.settimeout(timeout)


def handle_client(client_socket, address, initial_data=None):
    """Handle TCP client connection and commands."""
    buffered_sock = None
    try:
        # If we have initial data (from protocol detection), create buffered socket
        if initial_data:
            # initial_data is already bytes from server_thread
            buffered_sock = BufferedSocket(client_socket, initial_data)
            data = buffered_sock.recv(1024).decode('utf-8', errors='ignore')
        else:
            data = client_socket.recv(1024).decode('utf-8', errors='ignore')
        
        data = data.strip()
        
        # Use the appropriate socket for sending
        sock = buffered_sock if buffered_sock else client_socket
        
        # Calculate current Zeqond values
        current_unix_time = time.time()
        seconds_since_epoch = current_unix_time - UNIX_EPOCH
        zeqond = seconds_since_epoch / ZEQOND  # From Unix epoch
        zeqond_bigbang = (BIG_BANG_SECONDS + seconds_since_epoch) / ZEQOND  # From Big Bang
        
        with pulse_lock:
            pulse = pulse_count
        
        if data == "PULSE":
            response = f"PULSE:{pulse}:{zeqond:.6f}:{zeqond_bigbang:.6f}"
            sock.send(response.encode('utf-8'))
        elif data == "STATUS":
            sock.send("STATUS:OK".encode('utf-8'))
        elif data == "SYNC":
            sock.send("SYNC:READY".encode('utf-8'))
        elif data.startswith("GET"):
            # GET command format: GET:PULSE, GET:ZEQOND, or GET:ZEQOND_BIGBANG
            parts = data.split(":")
            if len(parts) > 1:
                if parts[1] == "PULSE":
                    sock.send(f"{pulse}".encode('utf-8'))
                elif parts[1] == "ZEQOND":
                    sock.send(f"{zeqond:.6f}".encode('utf-8'))
                elif parts[1] == "ZEQOND_BIGBANG":
                    sock.send(f"{zeqond_bigbang:.6f}".encode('utf-8'))
                else:
                    sock.send("ERROR:UNKNOWN_PARAM".encode('utf-8'))
            else:
                sock.send("ERROR:INVALID_FORMAT".encode('utf-8'))
        else:
            sock.send("ERROR:UNKNOWN_COMMAND".encode('utf-8'))
    except Exception as e:
        print(f"❌ Error handling client {address}: {e}")
    finally:
        if buffered_sock:
            buffered_sock.close()
        else:
            client_socket.close()




def handle_http_request_with_data(client_socket, address, request_data):
    """Handle HTTP request with pre-read data."""
    try:
        request = request_data.decode('utf-8')
        if not request:
            client_socket.close()
            return
        
        lines = request.split('\n')
        if len(lines) == 0:
            return
        
        request_line = lines[0]
        parts = request_line.split()
        if len(parts) < 2:
            return
        
        method = parts[0]
        path = parts[1]
        
        # Handle CORS preflight OPTIONS request
        if method == 'OPTIONS':
            response = f"HTTP/1.1 204 No Content\r\n"
            response += f"Access-Control-Allow-Origin: *\r\n"
            response += f"Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
            response += f"Access-Control-Allow-Headers: Content-Type\r\n"
            response += f"Access-Control-Max-Age: 86400\r\n"
            response += f"Connection: close\r\n\r\n"
            client_socket.sendall(response.encode('utf-8'))
            return
        
        # Calculate current Zeqond values
        current_unix_time = time.time()
        seconds_since_epoch = current_unix_time - UNIX_EPOCH
        zeqond = seconds_since_epoch / ZEQOND  # From Unix epoch (Jan 1, 1970)
        zeqond_bigbang = (BIG_BANG_SECONDS + seconds_since_epoch) / ZEQOND  # From Big Bang
        
        with pulse_lock:
            pulse = pulse_count
        
        if path == '/api/status' or path == '/api':
            # JSON API response
            status_data = {
                'running': keep_running,
                'pulse_count': pulse,
                'zeqond': zeqond,
                'zeqond_bigbang': zeqond_bigbang,
                'frequency': HULYAPULSE_HZ,
                'period': ZEQOND,
                'port': PORT,
                'timestamp': time.time()
            }
            response = f"HTTP/1.1 200 OK\r\n"
            response += f"Content-Type: application/json\r\n"
            response += f"Access-Control-Allow-Origin: *\r\n"
            response += f"Connection: close\r\n\r\n"
            response += json.dumps(status_data, indent=2)
        elif path == '/api/code':
            # Serve daemon code
            try:
                daemon_file = __file__
                with open(daemon_file, 'r', encoding='utf-8') as f:
                    code_content = f.read()
                code_data = {
                    'code': code_content,
                    'filename': 'zeqond_daemon.py',
                    'description': 'Zeqond Daemon - ZEQ OS HulyaPulse Synchronization Service',
                    'version': '1.0.0',
                    'port': PORT,
                    'frequency': HULYAPULSE_HZ
                }
                response = f"HTTP/1.1 200 OK\r\n"
                response += f"Content-Type: application/json\r\n"
                response += f"Access-Control-Allow-Origin: *\r\n"
                response += f"Connection: close\r\n\r\n"
                response += json.dumps(code_data, indent=2)
            except Exception as e:
                error_data = {'error': str(e)}
                response = f"HTTP/1.1 500 Internal Server Error\r\n"
                response += f"Content-Type: application/json\r\n"
                response += f"Access-Control-Allow-Origin: *\r\n"
                response += f"Connection: close\r\n\r\n"
                response += json.dumps(error_data, indent=2)
        else:
            # HTML status page
            html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Zeqond Daemon - HulyaPulse Status</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%);
            color: #e0e0e0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }}
        .container {{
            background: rgba(20, 20, 40, 0.9);
            border: 1px solid rgba(34, 211, 238, 0.3);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }}
        h1 {{
            color: #22d3ee;
            font-size: 2.5em;
            margin-bottom: 10px;
            text-align: center;
        }}
        .subtitle {{
            text-align: center;
            color: #94a3b8;
            margin-bottom: 30px;
            font-size: 1.1em;
        }}
        .status-box {{
            background: rgba(34, 211, 238, 0.1);
            border: 2px solid rgba(34, 211, 238, 0.3);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
        }}
        .status-item {{
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }}
        .status-item:last-child {{
            border-bottom: none;
        }}
        .label {{
            color: #94a3b8;
            font-weight: 500;
        }}
        .value {{
            color: #22d3ee;
            font-weight: bold;
            font-family: 'Courier New', monospace;
        }}
        .pulse-indicator {{
            display: inline-block;
            width: 12px;
            height: 12px;
            background: #22d3ee;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 1.287s infinite;
        }}
        @keyframes pulse {{
            0%, 100% {{ opacity: 1; transform: scale(1); }}
            50% {{ opacity: 0.5; transform: scale(1.2); }}
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            color: #64748b;
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>
            <span class="pulse-indicator"></span>
            Zeqond Daemon
        </h1>
        <p class="subtitle">HulyaPulse Synchronization Service</p>
        
        <div class="status-box">
            <div class="status-item">
                <span class="label">Status:</span>
                <span class="value">{'🟢 RUNNING' if keep_running else '🔴 STOPPED'}</span>
            </div>
            <div class="status-item">
                <span class="label">Pulse Count:</span>
                <span class="value">{pulse:,}</span>
            </div>
            <div class="status-item">
                <span class="label">Current Zeqond:</span>
                <span class="value">{zeqond:.6f}</span>
            </div>
            <div class="status-item">
                <span class="label">Frequency:</span>
                <span class="value">{HULYAPULSE_HZ} Hz</span>
            </div>
            <div class="status-item">
                <span class="label">Period:</span>
                <span class="value">{ZEQOND:.6f} seconds</span>
            </div>
            <div class="status-item">
                <span class="label">Port:</span>
                <span class="value">{PORT}</span>
            </div>
        </div>
        
        <div class="footer">
            <p>ZEQ OS Mathematical Framework v4.0</p>
            <p>Core Framework Function - Always Running</p>
        </div>
    </div>
    <script>
        // Explicitly prevent any auto-refresh
        // No refresh mechanism - page should remain static
        console.log('Zeqond Daemon Status Page Loaded');
    </script>
</body>
</html>"""
            response = f"HTTP/1.1 200 OK\r\n"
            response += f"Content-Type: text/html; charset=utf-8\r\n"
            response += f"Cache-Control: no-cache, no-store, must-revalidate\r\n"
            response += f"Pragma: no-cache\r\n"
            response += f"Expires: 0\r\n"
            response += f"Connection: keep-alive\r\n"
            response += f"Content-Length: {len(html.encode('utf-8'))}\r\n\r\n"
            response += html
        
        client_socket.sendall(response.encode('utf-8'))
    except Exception as e:
        print(f"❌ Error handling HTTP request from {address}: {e}")
    finally:
        client_socket.close()


def server_thread():
    """Combined TCP/HTTP server thread - handles both protocols on port 2871."""
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        server_socket.bind(('0.0.0.0', PORT))
        server_socket.listen(5)
        server_socket.settimeout(1.0)  # Allow checking keep_running
        
        print(f"🌐 Server thread started - listening on port {PORT}")
        print(f"   HTTP: http://localhost:{PORT}/")
        print(f"   TCP:  Connect via socket for PULSE/STATUS commands")
        
        while keep_running:
            try:
                client_socket, address = server_socket.accept()
                client_socket.settimeout(5.0)  # Set timeout for reading
                
                # Read first few bytes to detect protocol
                try:
                    # Read first 4 bytes (non-blocking peek equivalent)
                    first_bytes = client_socket.recv(4)
                    
                    if not first_bytes:
                        client_socket.close()
                        continue
                    
                    # Check if it's an HTTP request
                    is_http = False
                    try:
                        first_str = first_bytes.decode('utf-8', errors='ignore')
                        if first_str.startswith('GET ') or first_str.startswith('POST') or first_str.startswith('HTTP'):
                            is_http = True
                    except:
                        pass
                    
                    if is_http:
                        # HTTP request - read full request and handle
                        # We already have first 4 bytes, read the rest
                        try:
                            rest = client_socket.recv(4096)
                            full_request = first_bytes + rest
                            # Create a new socket-like object or handle directly
                            # For simplicity, we'll handle HTTP in a thread with the full data
                            http_thread = threading.Thread(
                                target=lambda: handle_http_request_with_data(client_socket, address, full_request),
                                daemon=True
                            )
                            http_thread.start()
                        except:
                            # If reading fails, close connection
                            client_socket.close()
                    else:
                        # TCP request - pass the initial bytes (as bytes) we read
                        tcp_thread = threading.Thread(
                            target=handle_client,
                            args=(client_socket, address, first_bytes),
                            daemon=True
                        )
                        tcp_thread.start()
                except socket.timeout:
                    # Timeout reading - close connection
                    client_socket.close()
                except Exception as e:
                    # Any other error - close connection
                    if keep_running:
                        print(f"⚠️  Error handling connection from {address}: {e}")
                    client_socket.close()
                    
            except socket.timeout:
                # Timeout is expected, continue loop to check keep_running
                continue
            except Exception as e:
                if keep_running:
                    print(f"❌ Server error: {e}")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
    finally:
        server_socket.close()
        print("🛑 Server thread stopped")


def get_status():
    """Get current daemon status."""
    with pulse_lock:
        return {
            'running': keep_running,
            'pulse_count': pulse_count,
            'zeqond': current_zeqond,
            'frequency': HULYAPULSE_HZ,
            'port': PORT
        }


def get_pulse():
    """Get current pulse count and Zeqond value."""
    with pulse_lock:
        return {
            'pulse_count': pulse_count,
            'zeqond': current_zeqond,
            'timestamp': time.time()
        }


def main():
    """Main daemon entry point."""
    global keep_running
    
    # Register signal handlers
    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)
    
    print("=" * 60)
    print("🚀 Zeqond Daemon starting...")
    print(f"   HulyaPulse Frequency: {HULYAPULSE_HZ} Hz")
    print(f"   Zeqond Period: {ZEQOND:.6f} seconds")
    print(f"   Port: {PORT}")
    print(f"   Unix Epoch: {UNIX_EPOCH} (January 1, 1970 00:00:00 UTC)")
    print("=" * 60)
    
    # Check for sync-client mode
    if len(sys.argv) > 1 and sys.argv[1] == "--sync-client":
        print("📡 Running in client synchronization mode")
        if len(sys.argv) > 2:
            master_ip = sys.argv[2]
            print(f"   Master IP: {master_ip}")
            # TODO: Implement client synchronization
    
    # Start pulse thread
    pulse_t = threading.Thread(target=pulse_thread, daemon=False)
    pulse_t.start()
    
    # Start combined TCP/HTTP server thread
    server_t = threading.Thread(target=server_thread, daemon=True)
    server_t.start()
    
    try:
        # Keep main thread alive
        while keep_running:
            time.sleep(1)
    except KeyboardInterrupt:
        keep_running = False
    
    # Wait for pulse thread to finish
    pulse_t.join()
    
    print("=" * 60)
    print("🛑 Zeqond Daemon shutting down...")
    print(f"   Final pulse count: {pulse_count}")
    print("=" * 60)


if __name__ == "__main__":
    main()
