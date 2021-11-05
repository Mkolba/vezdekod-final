from flask import Flask, g, request
import sqlite3
import random
import string
import json


app = Flask(__name__)


def setupDatabase():
    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        sql = 'CREATE TABLE grids (uid STRING NOT NULL, grid TEXT NOT NULL)'
        cursor.execute(sql)
        conn.commit()
    except sqlite3.OperationalError:
        pass


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('database.db')
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route('/grids/<uid>', methods=["GET"])
def getGrid(uid):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT grid FROM grids WHERE uid=?', [uid])
    data = cursor.fetchone()
    return data[0] if data else '{}'


@app.route('/grids', methods=["PUT"])
def putGrid():
    conn = get_db()
    cursor = conn.cursor()
    grid = request.get_json()
    uid = ''.join(random.sample(string.ascii_letters + string.digits, 10))
    cursor.execute('INSERT INTO grids VALUES (?,?)', [uid, json.dumps(grid, ensure_ascii=False)])
    conn.commit()
    return json.dumps({'success': True, 'uid': uid})


@app.route('/grids/<uid>', methods=["PATCH"])
def updateGrid(uid):
    conn = get_db()
    cursor = conn.cursor()
    grid = request.get_json()
    cursor.execute('UPDATE grids SET grid=? WHERE uid=?', [json.dumps(grid, ensure_ascii=False), uid])
    conn.commit()
    return json.dumps({'success': True})


if __name__ == '__main__':
    setupDatabase()
    app.run(debug=True, host='127.0.0.1', port=8085)
