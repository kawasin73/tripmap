import sys
import json
import os
import requests
from selenium import webdriver
from bs4 import BeautifulSoup
import codecs
from urllib.parse import urlopen
from urllib.request as req

def scraping(url, output_name):
    driver = webdriver.PhantomJS(service_log_path=os.path.devnull)
    driver.get(url)
    html = driver.page_source.encode('utf-8')
    #url = "https://www.google.co.jp/maps/search/%E8%A6%B3%E5%85%89%E5%9C%B0/@35.7122185,139.7626531,15z/data=!3m1!4b1?hl=ja"
    soup = BeautifulSoup(html, "lxml")

    name = soup.find_all(jstache="632")
    address = soup.find_all("#section-result-location")

    outputs = []
    for i in range(len(name)):
        outputs[i] = {"name": name[i], "address": address[i]}

    return outputs

url = "https://www.google.co.jp/maps/search/%E8%A6%B3%E5%85%89%E5%9C%B0/@35.7122185,139.7626531,15z/data=!3m1!4b1?hl=ja"
print(scraping(url, "aaa"))
    # output = {"title": title, "description": description_content}
    # outputをjsonで出力
    # with codecs.open(output_name, 'w', 'utf-8') as fout:
    #     json.dump(output, fout, indent=4, sort_keys=True, ensure_ascii=False)

# if __name__ == '__main__':
#     argvs = sys.argv
#     # チェック
#     if len(argvs) != 2:
#         print "Usage: python scraping.py [url] [output]"
#         exit()
#     url = argvs[1]
#     output_name = argvs[2]
#
#     scraping(url, output_name)
