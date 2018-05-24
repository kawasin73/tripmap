from bs4 import BeautifulSoup
import requests
import re
import time
import xmltodict
import json

base_url = 'https://retrip.jp/'
root_url = 'https://retrip.jp/'

r = requests.get(root_url)
soup = BeautifulSoup(r.content, 'html.parser')

urls = [base_url + i.get('href') for i in soup.find_all('a', href=re.compile('^/articles/')) ]



def get_places(url):
    r = requests.get(url)
    soup = BeautifulSoup(r.content, 'html.parser')
    places = decode_places(soup)
    pages = []
    if len(places) == 0:
        pages.append(url + soup.find_all('a', class_='page')[-1].get('href'))
    else:
        pages = [url + a.get('href') for a in soup.find_all('a', class_='page')]

    for page in pages:
        time.sleep(1)
        r = requests.get(page)
        soup = BeautifulSoup(r.content, 'html.parser')
        places += decode_places(soup)
    return places


def decode_places(soup):
    shop_places = []
    for j in soup.article.find_all('div', class_='expSpotContent'):
        address = j.select('li.address')[0].text
        # TODO: filter
#         if '東京' in address:
        shop_places.append({'name': j.a.text, 'address': address})
    return shop_places

places_json = []
for url1 in urls:

    places_list = get_places(url1)
    places_json += json.dumps(places_list, ensure_ascii=False)
    print(places_json)
    f = open('test.json', 'w')
    f.write(places_json)
    f.close()
