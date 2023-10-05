import sys
import win32com.client
import os
import json
import os
import win32com.client
import csv
#folderPath =  sys.argv[1]

def generate_shipping_docs_dictionary(folder_path):
    shipping_docs_dict = {}
    
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            waybill_no = file.split(" ")[0].split(".")[0].split("_")[0].upper()
            if waybill_no not in shipping_docs_dict:
                shipping_docs_dict[waybill_no] = []
            shipping_docs_dict[waybill_no].append(file_path)

    return shipping_docs_dict

def generate_excel_dict(excel_path):
    excel_dict = {}
    for root, dirs, files in os.walk(excel_path):
        for file in files:
            file_path = os.path.join(root, file)
            waybill_no = file.split("_")[0].upper()
            if waybill_no not in excel_dict:
                excel_dict[waybill_no] = []
            excel_dict[waybill_no].append(file_path)
    return excel_dict



def send_email(subject, body, recipient_email, attachment_paths=None):
    outlook_app = win32com.client.Dispatch("Outlook.Application")
    mail = outlook_app.CreateItem(0)
    mail.Subject = subject
    mail.Body = body
    mail.To = recipient_email
    
    if attachment_paths:
        for attachment_path in attachment_paths:
            mail.Attachments.Add(attachment_path)
    
    mail.Send()

def read_csv(file_path):
    with open(file_path, 'r') as file:
        reader = csv.reader(file)
        rows = list(reader)
    return rows

def send_email(waybill_no, recipient_emails, number_excel_file, attachment_paths=None, ):
    outlook_app = win32com.client.Dispatch("Outlook.Application")
    mail = outlook_app.CreateItem(0)
    mail.Subject  = f"HANDOVER DOCUMENT_WB#{waybill_no} ( {str(number_excel_file)} CDS )"
    mail.Body = "Please find attached The CDS & the shipping documents for the Waybill."
    mail.To = ";".join(recipient_emails)  # Separate multiple recipients with semicolons
    
    if attachment_paths:
        for attachment_path in attachment_paths:
            mail.Attachments.Add(attachment_path)
    
    mail.Send()

def automate_sending_mail(csv_file_path, folderPath, excelPath):
    #recipient emails 
    rows = read_csv(csv_file_path)
    header = rows[0]
    email_index = header.index('Email')
    recipient_emails = [row[email_index] for row in rows[1:]] 

    shipping_docs_dictionary = generate_shipping_docs_dictionary(folderPath)
    excel_dict = generate_excel_dict(excelPath)
    
    invalid_waybillno  = []
    for waybill_no, file_paths in shipping_docs_dictionary.items():
        attachment_paths = []
        excel_paths = excel_dict.get(waybill_no)
        if excel_paths is None or len(file_paths) > len(excel_paths):
            invalid_waybillno.append(waybill_no)
        else:
            attachment_paths = file_paths + excel_paths
            send_email(waybill_no, recipient_emails,len(excel_paths),  attachment_paths=attachment_paths)
    return invalid_waybillno, shipping_docs_dictionary.keys()

def return_message(invalid_waybillno, waybillno):

    if len(invalid_waybillno) == 0:
        return "Success"
    elif (len(invalid_waybillno) != 0) and (len(waybillno) != len(invalid_waybillno)):
        return f"Still have {len(invalid_waybillno)} waybill(s):"+ " ,".join(invalid_waybillno) + " not sending yet! Please recheck!"
    else:
        return "Fail"


def start(folderPath, excelPath):
    csv_file_path = os.getcwd() + '/backend/function_3/data.csv'
    #csv_file_path = r"C:\Users\anh.huynhv\Desktop\Capstone\Capstone_Project\backend\function_3\data.csv"
    
    invalid_waybillno, waybillno = automate_sending_mail(csv_file_path, folderPath, excelPath)

    print(return_message(invalid_waybillno, waybillno))
    sys.stdout.flush()

# folderPath = r"C:\Users\anh.huynhv\Downloads\Shipping docs package-20230601T084404Z-001\Shipping docs package"
# excelPath = r"C:\Users\anh.huynhv\Downloads\hi"
# start(folderPath, excelPath)