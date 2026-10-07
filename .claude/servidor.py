"""Servidor local sem cache, só para testar os slides durante o desenvolvimento."""
import http.server
import sys


class SemCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


porta = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
http.server.ThreadingHTTPServer(("127.0.0.1", porta), SemCache).serve_forever()
