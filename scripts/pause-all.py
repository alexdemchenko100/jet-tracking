import requests
TOKEN = 'pak.7OERYeSdRavJ28dreS94YdRMe~.qKPn5SwDA'
accountId = 'd56da33f-91e8-470c-85ab-cba73c3f9427'
HOST = 'https://stage.proautoma.com'

endpoint = HOST + '/api/monitors'
headers = {'Content-Type': 'application/json',
           'Authorization': 'Bearer {}'.format(TOKEN),
           'x-proautoma-accountid': accountId}

del_headers = {'Authorization': 'Bearer {}'.format(TOKEN),
               'x-proautoma-accountid': accountId}

mons = requests.get(endpoint, headers=headers)
resp = mons.json()['items']

mon = resp[0]

for mon in resp:
    print(mon['id'])
    r = requests.delete(endpoint+"/"+mon['id'], headers=del_headers)


# for mon in resp:
#     print(mon['id'])
#     r = requests.post(endpoint+"/"+mon['id'], headers=headers, json={
#         "id": mon["id"],
#         "name": mon['name'],
#         "url": mon['url'],
#         "status": 'paused',
#         "frequency": mon["frequency"]
#     })
