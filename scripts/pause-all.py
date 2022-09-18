import requests
TOKEN = 'pak.CVn1IwpFEUyFvF~1lqg7cd86uujKcOrgcj.s'


HOST = 'http://localhost:8080'

# url = HOST + '/api/monitors?offset=0&limit=10'
endpoint = HOST + '/api/monitors'
headers = {'Content-Type': 'application/json',
           'Authorization': 'Bearer {}'.format(TOKEN),
           'x-proautoma-accountid': 'e3eb5f72-f346-48d8-bf6c-7dc47294d096'}


mons = requests.get(endpoint, headers=headers)

resp = mons.json()['items']

mon = resp[0]

for mon in resp:
    print(mon['id'])
    r = requests.post(endpoint+"/"+mon['id'], headers=headers, json={
        "id": mon["id"],
        "name": mon['name'],
        "url": mon['url'],
        "status": 'paused',
        "frequency": mon["frequency"]
    })
