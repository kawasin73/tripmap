from bs4 import BeautifulSoup
import requests
import re
import time
import xmltodict
#urlを指定
url = 'https://retrip.jp/'

r = requests.get('https://retrip.jp/')
soup = BeautifulSoup(r.content, 'html.parser')

#1面から記事のurlをまとめる

urls = [url + i.get('href') for i in soup.find_all('a', href=re.compile('^/articles/')) ]

shop_place_dic = {}

for url1 in urls:
   #入ったurlの中にさらにページ分けされているので何ページあるか調べる
    r1 = requests.get(url1)
    soup1 = BeautifulSoup(r1.content, 'html.parser')

    add_urls = []
    for i in soup1.find_all('a', class_='page'):
        add_urls.append(i.get('href'))

    urls2 = [url1]


    for i in add_urls:
        urls2.append(url1 + i)

    for url2 in urls2:

        #攻撃にならないようにsleepしつつ取得

        time.sleep(1)
        r2 = requests.get(url2)
        soup2 = BeautifulSoup(r2.content, 'html.parser')

        for j in soup2.article.find_all('div', class_='expSpotContent'):
            shop_place_dic[j.a.text] = j.li.text

lat_list=[]
lon_list=[]
geocode_api =  'http://www.geocoding.jp/api/'

for i,j in enumerate(shop_place_dic):
    full_address = j
    payload = {'q': full_adress}
    result = requests.get(geocode_api, params=payload)
    resultdict = xmltodict.parse(result.text)
    lat_list.append(resultdict["result"]["coordinate"]["lat"])
    lon_list.append(resultdict["result"]["coordinate"]["lng"])

print(lat_list)
