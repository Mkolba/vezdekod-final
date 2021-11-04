# -*- coding: utf-8 -*-

from api import request_user_middleware, WSHandler
from aiohttp import web, ClientSession
from utils.logger import Logger
import asyncio
import config


logger = Logger("SERVER")


async def create_app(loop):
    app = web.Application(middlewares=[request_user_middleware])
    app.session = ClientSession()
    app.event_loop = loop
    app.sockets = {}

    app.router.add_route(method='GET', path='/ws', handler=WSHandler)

    # Starting server
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, port=config.port, host=config.host)
    return app, site


if __name__ == '__main__':

    loop = asyncio.get_event_loop()
    app, site = loop.run_until_complete(create_app(loop))
    loop.create_task(site.start())

    try:
        logger.ok('Сервер запущен')
        loop.run_forever()
    except KeyboardInterrupt:
        logger.critical('Сервер принудительно остановлен')
