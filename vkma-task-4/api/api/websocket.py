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

        try:
            if self.request.data.role == 'manager':
                if not app.manager:
                    app.manager = socket
                    await socket.send('connected', slaves=len(app.sockets))
                    await self.broadcast('manager_connected')
                else:
                    await sock.close(message=b'taken')
            else:
                app.sockets.update({socket.id: socket})
                is_manager_connected = True if app.manager else False
                await socket.send('connected', hasManager=is_manager_connected, playing=app.playing)

                if app.manager:
                    await app.manager.send('update_slaves', slaves=len(app.sockets))

            async for event in sock:
                try:
                    event = BetterDict(json.loads(event.data))
                    if self.request.data.role == 'manager':
                        if event.type == 'play':
                            app.playing = True
                        elif event.type == 'stop':
                            app.playing = False
                        await self.broadcast(event.type)
                except:
                    await socket.send('error', code=500)
                    print(format_exc())

        finally:
            if socket.id in app.sockets:
                app.sockets.pop(socket.id)
            if self.request.data.role == 'manager':
                await self.broadcast('manager_disconnected')
                app.manager = None
            else:
                if app.manager:
                    await app.manager.send('update_slaves', slaves=len(app.sockets))
            await sock.close()

        return sock

    async def broadcast(self, event_type, **kwargs):
        for id, socket in self.request.app.sockets.items():
            await socket.send(event_type, **kwargs)
