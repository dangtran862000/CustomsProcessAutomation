import sys
import send_email
import save_email

step = sys.argv [3]

if (step == 'send_email'):
    folderPath = sys.argv[4]
    excelPath = sys.argv[5]
    send_email.start(folderPath, excelPath)
elif (step == 'save_email'):
    table_data_url = sys.argv[4]
    save_email.start(table_data_url)
