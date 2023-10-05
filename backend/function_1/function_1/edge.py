import sys
from selenium import webdriver

from webdriver_manager.microsoft import EdgeChromiumDriverManager 
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.edge import service

from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

from selenium.webdriver.common.by import By
import json
import time
from pathlib import Path
from datetime import datetime
import shutil
import os
import glob

directory = 'D:\Project\Capstone Project (with UI)\Cap git\CDS package\\test'

def downloadFile(directory, cds, date=None):
    appState = {
        "recentDestinations": [
            {
                "id": "Save as PDF",
                "origin": "local",
                "account": ""
            }
        ],
        "selectedDestinationId": "Save as PDF",
        "version": 2
    }

    profile = {"plugins.plugins_list": [{"enabled": False, "name": "Chrome PDF Viewer"}],
                'printing.print_preview_sticky_settings.appState': json.dumps(appState),
            'savefile.default_directory': directory}

    options = EdgeOptions()
    options.add_experimental_option('prefs', profile)
    options.add_argument('--kiosk-printing')
    s = service.Service(EdgeChromiumDriverManager().install())
    driver = webdriver.Edge(service=s, options=options)
    
    url_1 = "https://pus.customs.gov.vn/faces/ContainerBarcode"
    driver.get(url_1)

    # Ma doanh nghiep
    driver.find_element(By.CSS_SELECTOR, '#pt1\\3A it1\\3A \\3A content').send_keys('0304295429')

    # So to khai - CDS
    driver.find_element(By.CSS_SELECTOR, '#pt1\\3A it2\\3A \\3A content').send_keys(cds)

    # Ma hai quan
    driver.find_element(By.CSS_SELECTOR, '#pt1\\3A it3\\3A \\3A content').send_keys('02F3')

    # Ngay to khai
    driver.find_element(By.CSS_SELECTOR, '#pt1\\3A it4\\3A \\3A content').send_keys(date)

    # Click "lay thong tin"
    driver.find_element(By.CSS_SELECTOR, '#pt1\\3A btngetdata a').click()

    time.sleep(2)
    driver.execute_script('window.scrollBy(0, 800)')

    # Click "lay thong tin"
    driver.find_element(By.CSS_SELECTOR, '#lbl_BanIn').click()

    driver.quit()

    # # Convert the downloaded pdf name to correct format
    # isDownloaded = False
    # count = 0
    # while not isDownloaded and count < 2:
    #     list_of_files = glob.glob(f'{directory}\\*.pdf') # * means all if need specific format then *.csv
    #     latest_file = max(list_of_files, key=os.path.getctime)
    #     if latest_file == f'{directory}\\_.pdf':
    #         os.rename(latest_file, f'{directory}\\{waybill}_{cds}.pdf')
    #         isDownloaded = True
    #         break
    #     else:
    #         time.sleep(2)
    #         count += 1

    # return isDownloaded


downloadFile(directory, cds='105430739300', date='04/05/2023')