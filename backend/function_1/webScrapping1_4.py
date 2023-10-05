# import sys
from selenium import webdriver

from webdriver_manager.microsoft import EdgeChromiumDriverManager 
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.edge import service

from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import json
import time
from pathlib import Path
from datetime import datetime
import shutil
import os
import glob

def start(argv):
    def downloadFile(directory, waybill, mergeFiles, cds, date=None):
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

        # chrome_options = webdriver.ChromeOptions()
        # chrome_options.add_experimental_option('prefs', profile)
        # chrome_options.add_argument('--kiosk-printing')
        # driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

        options = EdgeOptions()
        options.add_experimental_option('prefs', profile)
        options.add_argument('--kiosk-printing')
        s = service.Service(EdgeChromiumDriverManager().install())
        driver = webdriver.Edge(service=s, options=options)
        driver.minimize_window()
        # driver.get('edge://settings/clearBrowserData')
        # driver.find_element("xpath",'//settings-ui').send_keys(Keys.ENTER)

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

        # Convert the downloaded pdf name to correct format
        isDownloaded = False
        count = 0
        while not isDownloaded and count < 3:
            list_of_files = glob.glob(f'{directory}\\*.pdf') # * means all if need specific format then *.csv
            if len(list_of_files) > 0:
                latest_file = max(list_of_files, key=os.path.getctime)
                if latest_file == f'{directory}\\_.pdf':
                    if len(mergeFiles) > 1 and mergeFiles[0] != '':
                        waybill = '-'.join(mergeFiles)
                    # os.rename(latest_file, f'{directory}\\{waybill}_{cds}.pdf')
                    os.rename(latest_file, f'{directory}\\{cds}.pdf')
                    isDownloaded = True
                    break
            else:
                time.sleep(2)
                count += 1

        return [isDownloaded, directory]

    if len(argv) == 0:
        # print("failed")
        # print("python requires arguments - but found nothing")
        return ["failed", "python requires arguments - but found nothing"]
        # sys.exit()


    fixedPath = argv[0]
    zipFolder_path = f'{fixedPath}/zip'

    # print("success")
    result = argv[1:]

    for i in range(2, len(argv[1:]) + 1, 2):
        filePath = argv[i]
        date = argv[i + 1]

        # file_no_ext = Path(filePath).stem
        # [waybill, invoice, cds] = file_no_ext.split('_')
        
        # mergeFiles = waybill.split('-')
        # if len(mergeFiles) > 1:
        #     waybill = mergeFiles[0]
        # directory = f'{fixedPath}\\files\\{waybill}'
        
    #     [isDownloaded, directory] = downloadFile(directory, waybill, mergeFiles, cds + '', date)
    #     # isDownloaded = True
    #     if isDownloaded:
    #         # print(directory)
    #         result.append(directory)
    
    return result
    # sys.stdout.flush()
