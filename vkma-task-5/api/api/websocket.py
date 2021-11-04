# -*- coding: utf-8 -*-

from traceback import format_exc
from utils import BetterDict
from aiohttp import web
import json


class Socket:
    def __init__(self, sock, id):
        self.sock = sock
        self.id = id

    async def send(self, event_type, **kwargs):
        kwargs.update({'type': event_type})
        await self.sock.send_json(kwargs)


class WSHandler(web.View):
    async def get(self):
        sock = web.WebSocketResponse(heartbeat=1.0)
        await sock.prepare(self.request)
        app = self.request.app

        socket = Socket(sock, self.request.data['auth']['subset']['vk_user_id'])

        try:
            if socket.id in app.sockets:
                await app.sockets[socket.id]['socket'].sock.close()
            app.sockets.update({socket.id: {'socket': socket, 'coords': [0, 0]}})
            await socket.send('connected', players={k: v['coords'] for k, v in app.sockets.items() if k != socket.id})
            await self.broadcast('join', socket.id, user=socket.id)

            async for event in sock:
                try:
                    event = BetterDict(json.loads(event.data))
                    if event.type == 'coords':
                        app.sockets[socket.id]['coords'] = event.coords
                        await self.broadcast(event.type, socket.id, user=socket.id, coords=event.coords)
                except:
                    await socket.send('error', code=500)
                    print(format_exc())

        finally:
            if socket.id in app.sockets:
                app.sockets.pop(socket.id)
            await sock.close()

        return sock

    async def broadcast(self, event_type, except_id, **kwargs):
        for id, client in self.request.app.sockets.items():
            if id != except_id:
                await client['socket'].send(event_type, **kwargs)
