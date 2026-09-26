"""Servidor estático de desenvolvimento sem cache (evita JS antigo no navegador).
Uso: python tools/serve.py [porta]
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class NoCacheHandler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".webmanifest": "application/manifest+json"}

    def send_head(self):
        # Nunca responde 304: sempre entrega o arquivo atual.
        if "If-Modified-Since" in self.headers:
            del self.headers["If-Modified-Since"]
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    root = Path(__file__).resolve().parent.parent
    print(f"Acai Map Belem -> http://localhost:{port}", flush=True)
    ThreadingHTTPServer(("", port), partial(NoCacheHandler, directory=str(root))).serve_forever()
