import xlrd

def checkFile(fixedPath: str, fileName: str, extractFromFileName, ext="xls"):
    data = xlrd.open_workbook(f"{fixedPath}/{fileName}.{ext}")

    sh = data.sheet_by_index(0)

    [waybill, invoice, cds] = extractFromFileName

    # Detect whether it is Import or Export type 
    # by the location of the date in excel. 
    # If it change in the future, change this algorithm
    date = str(sh.cell_value(rowx=7, colx=6))
    importWayBill = sh.cell_value(rowx=30, colx=3)
    exportWayBill = sh.cell_value(rowx=38, colx=7)
    
    if date == '':
        date = str(sh.cell_value(rowx=7, colx=5)).split(" ")[0]
    else:
        date = date.split(" ")[0]
        
    if cds != str(int(sh.cell_value(rowx=3, colx=4))):
        return [False, cds]

    if waybill != importWayBill and waybill != exportWayBill:
        return [False, f"{waybill}-{exportWayBill}-{type(waybill)}-{type(exportWayBill)}-{waybill == exportWayBill}"]

    # inside_file_invoice = str(sh.cell_value(rowx=40, colx=9)).split(" ")
    # if invoice != inside_file_invoice[-1]:
    #     first_invoice_inside_file = inside_file_invoice[-3]
    #     last_invoice_inside_file = inside_file_invoice[-1]
    #     print(invoice.split(" "))
        # [first_invoice_file_name, _, last_invoice_file_name] = invoice.split(" ")

        # if first_invoice_file_name != first_invoice_inside_file or last_invoice_file_name != last_invoice_inside_file:
        #     return [False, invoice]

    return [True, date]

