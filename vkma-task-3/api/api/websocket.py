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
        sock = web.WebSocketResponse(heartbeat=2.0)
        await sock.prepare(self.request)
        app = self.request.app

        socket = Socket(sock, self.request.data['auth']['subset']['vk_user_id'])
        app.sockets.update({socket.id: {'socket': socket, 'friend': self.request.data['friend'], 'shaking': False}})

        friend = self.request.data['friend']

        try:
            is_friend_connected = friend in app.sockets
            await socket.send('connected', isFriendConnected=is_friend_connected)

            if is_friend_connected:
                await app.sockets[friend]['socket'].send('friend_connected')

            async for event in sock:
                try:
                    event = BetterDict(json.loads(event.data))
                    if event.type == 'start_shaking':
                        if app.sockets[friend]['shaking']:
                            await app.sockets[friend]['socket'].send('handshake')
                            await socket.send('handshake')
                        else:
                            app.sockets[socket.id]['shaking'] = True
                    elif event.type == 'stop_shaking':
                        app.sockets[socket.id]['shaking'] = False
                except:
                    await socket.send('error', code=500)
                    print(format_exc())

        finally:
            if socket.id in app.sockets:
                app.sockets.pop(socket.id)
                if friend in app.sockets:
                    await app.sockets[friend]['socket'].send('friend_disconnected')
                await sock.close()

        return sock

    async def broadcast(self, event_type, except_ids=None, **kwargs):
        for id, socket in self.request.app.sockets.items():
            if not except_ids or id not in except_ids:
                await socket.send(event_type, **kwargs)
