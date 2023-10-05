import sys
from selenium import webdriver

from webdriver_manager.microsoft import EdgeChromiumDriverManager 
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.edge import service

from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import json
import time
from pathlib import Path
import os
import glob
import re
# importing all the required modules
import threading
from pathlib import Path
import shutil
from PyPDF2 import PdfReader
import PyPDF2
from selenium.webdriver.support.ui import WebDriverWait as wait

def start(argv):
    def downloadFile(directory, cds, sample=None):
        date = sample["date"]
        sample["directory"] = directory
        sample["cds"] = cds

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
        driver = webdriver.Edge(service=s, options=options, )
        driver.minimize_window()

        url_1 = "https://pus.customs.gov.vn/faces/ContainerBarcode"
        driver.get(url_1)
        # driver.get("edge://settings/clearBrowserData");
        # driver.findElement(By.id("clear-now")).sendKeys(Keys.ENTER);

        # Ma doanh nghiep
        driver.find_element(By.CSS_SELECTOR, '#pt1\\3A it1\\3A \\3A content').send_keys('0304295429')

        # So to khai - CDS
        driver.find_element(By.CSS_SELECTOR, '#pt1\\3A it2\\3A \\3A content').send_keys(cds)

        # Ma hai quan
        driver.find_element(By.CSS_SELECTOR, '#pt1\\3A it3\\3A \\3A content').send_keys('02F3')

        # Ngay to khai
        driver.find_element(By.CSS_SELECTOR, '#pt1\\3A it4\\3A \\3A content').send_keys(date)

        # try:
        #     element = WebDriverWait(driver, 10).until(
        #         EC.visibility_of_element_located((By.CSS_SELECTOR, "#pt1\\3A btngetdata a"))
        #     )
        # Click "lay thong tin"
        driver.find_element(By.CSS_SELECTOR, '#pt1\\3A btngetdata a').click()
        #     time.sleep(10)
        # except:
        #     driver.quit()
        #     return [False, None]

        time.sleep(2)
        driver.execute_script('window.scrollBy(0, 800)');





        # text = driver.execute_script("""
        # return document.querySelectorAll("#content span[id='pt1:png1'] table:nth-child(1) tr:nth-child(7) td")[0].textContent;
        # """)

        # isDownloaded = False

        # while True:
        #     text = driver.execute_script("""
        #     return document.querySelectorAll("#content span[id='pt1:png1'] table:nth-child(1) tr:nth-child(7) td")[0].textContent;
        #     """)
        #     if text == "DANH SÁCH HÀNG HÓAĐỦ ĐIỀU KIỆN QUA KHU VỰC GIÁM SÁT HẢI QUANTờ khai không phải niêm phong":
        #         isDownloaded = True
        #         sample["triggerDownload"] = True

        #         # Click "lay thong tin"
        #         driver.find_element(By.CSS_SELECTOR, '#lbl_BanIn').click()

        #         driver.quit()
        #         return [isDownloaded, None]
        #     else:
        #         driver.find_element(By.CSS_SELECTOR, '#pt1\\3A btngetdata a').click()
        #     #     driver.execute_script("""
        #     #     document.querySelector('#d1_msgDlg_cancel a').click();
        #     #     document.querySelector('#pt1\\3A btngetdata a').click();
        #     #     """)
        #     # time.sleep(0.5)





        text = driver.execute_script("""
        return document.querySelectorAll("#content span[id='pt1:png1'] table:nth-child(1) tr:nth-child(7) td")[0].textContent;
        """)
        if text == "DANH SÁCH HÀNG HÓAĐỦ ĐIỀU KIỆN QUA KHU VỰC GIÁM SÁT HẢI QUANTờ khai không phải niêm phong":
            isDownloaded = True
            sample["triggerDownload"] = True

            # Click "lay thong tin"
            driver.find_element(By.CSS_SELECTOR, '#lbl_BanIn').click()

            driver.quit()
            return [isDownloaded, None]
        else:
            driver.quit()
            return [False, None]


    fixedPath = argv[0]
    samples = json.loads(argv[1])

    # for sample in samples:
    #     print(sample)

    # fixedPath = 'D:/Test case 4_03072023/fnc1_bugs/bug_1/test export with pre-completed 2/test'
    # samples = [
    #     {"directory": f'{fixedPath}/pdf/122300022756870_4300286701_305679339510', "folder": f"{fixedPath}", "fileName": "122300022756870_4300286701_305679339510", "date": "20/07/2023", "triggerDownload": False, "complete": False},
    #     {"directory": f'{fixedPath}/pdf/122300022756873_4300286702_305679337040', "folder": f"{fixedPath}", "fileName": "122300022756873_4300286702_305679337040", "date": "20/07/2023", "triggerDownload": False, "complete": False},
    #     # {"directory": f'{fixedPath}/pdf/122300022756878_4300286704_305679336120', "folder": f"{fixedPath}", "fileName": "122300022756878_4300286704_305679336120", "date": "20/07/2023", "triggerDownload": False, "complete": False},
    # ]

    # for sample in samples:
    #     sample["triggerDownload"] = True
    #     # sample["complete"] = True

    result = []
    threads = []
    for i in range(len(samples)):
        filePath = f"{samples[i]['folder']}/{samples[i]['fileName']}"

        file_no_ext = Path(filePath).stem
        [waybill, invoice, cds] = file_no_ext.split('_')
        
        directory = f'{fixedPath}\\pdf\\{samples[i]["fileName"]}'
        path = Path(directory)
        path.mkdir(parents=True, exist_ok=True)

        samples[i]["directory"] = directory

        thread = threading.Thread(target=downloadFile, args=(directory, cds + '', samples[i],))
        thread.start()
        threads.append(thread)

    for thread in threads:
        thread.join()



    # Regex for matching a fileName => "_ \([0-9]*\)\.pdf"
    remainFiles = len(samples)
    isComplete = False
    count = 0
    maxCount = 5
    while not isComplete and count < maxCount:
        time.sleep(0.5)
        count += 1

        if remainFiles == 0:
            break

        for sample in samples:
            if sample["complete"] or not sample["triggerDownload"]:
                continue

            directory = sample["directory"]
            list_of_files = glob.glob(f'{directory}\\*.pdf') # * means all if need specific format then *.csv

            if len(list_of_files) > 0:
                for fileName in list_of_files:
                    src = fileName
                    fileName = fileName.split('\\')[-1]
                    pattern = re.compile('_ \([0-9]*\)\.pdf')

                    if pattern.match(fileName) or fileName == '_.pdf':
                        sample["complete"] = True
                        cds = sample["cds"]
                        remainFiles -= 1

                        os.rename(src, f'{directory}\\{cds}.pdf')
                        break
                    else:
                        result.append('NO MATCH' + fileName)
                        # print('NO MATCH', fileName)


    for sample in samples:
        src = f"{sample['directory']}\\{sample['cds']}.pdf"
        # file1 = open(src, 'rb')
        # ReadPDF = PyPDF2.PdfReader(file1)
        # pages = len(ReadPDF.pages)
        # file1.close()

        if not sample["complete"]:
            continue
            
        dst = f"{sample['folder']}\\{sample['cds']}.pdf"
        shutil.move(src, dst)
        os.rmdir(sample['directory'])
        
        # print(sample['folder'])
        result.append(sample["folder"])

    return result