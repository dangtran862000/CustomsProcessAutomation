import requests
import sys

link = 'https://pus.customs.gov.vn/faces/Login'

def start():
    try:
        result = requests.head(link)
        status_code = result.status_code
        if(status_code == 200):
            print("success")
        else:
            print("error")
    except:
        print("error")

    sys.stdout.flush()