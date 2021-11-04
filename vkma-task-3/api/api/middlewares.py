# -*- coding: utf-8 -*-


from urllib.parse import urlparse, parse_qsl, urlencode
from utils import BetterDict, Logger
from collections import OrderedDict
from traceback import format_exc
from base64 import b64encode
from hashlib import sha256
from hmac import HMAC

from aiohttp import web
import config
import json


logger = Logger("API")


async def request_user_middleware(app, handler):
    def get_url_query(url):
        query = dict(parse_qsl(urlparse(url).query, keep_blank_values=True))
        for k, v in query.items():
            if k == '?vk_access_token_settings':
                query.update({'vk_access_token_settings': v})
                break
        auth = OrderedDict(sorted(x for x in query.items() if x[0][:3] == "vk_"))
        for key in query.copy().keys():
            if key[:3] == "vk_":
                query.pop(key)
        data = {'auth': {'subset': auth, 'sign': query.get('sign', None)}}
        query.pop('sign', None)
        data.update(query)
        return data

    def is_valid(auth):
        hash_code = b64encode(HMAC(config.app_secret.encode(), urlencode(auth['subset'], doseq=True).encode(), sha256).digest())
        decoded_hash_code = hash_code.decode('utf-8')[:-1].replace('+', '-').replace('/', '_')
        if auth["sign"] == decoded_hash_code:
            return True
        else:
            return False

    def reject(message=None):
        resp = web.Response(body=json.dumps({'success': False, 'message': message or 'authorization failed'}))
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Content-Type'] = 'application/json'
        return resp

    async def middleware(request):
        try:
            if request.method == 'POST':
                request.data = BetterDict(await request.json())
            else:
                request.data = BetterDict(get_url_query(str(request.url)))
        except json.decoder.JSONDecodeError:
            return reject('invalid params')
        try:
            if is_valid(request.data['auth']):
                request.user = int(request.data.auth['subset']['vk_user_id'])
                return await handler(request)
            else:
                return reject()
        except Exception as err:
            if 'Not Found' not in str(err):
                logger.critical(format_exc(), request.url)
            return reject()

    return middleware
