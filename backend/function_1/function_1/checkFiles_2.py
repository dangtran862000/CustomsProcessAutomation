from pathlib import Path
import sys
from checkFolder import checkFile

def start(argv):
    if len(argv) == 1:
        # print("failed")
        # print("does not have any arguments")
        return ["failed", "does not have any arguments"]
        sys.exit()
    

    CDS_Folder = argv[0]
    fixedPath = f"{CDS_Folder}"
    result = []

    # onlyfiles = [f for f in listdir(fixedPath) if isfile(join(fixedPath, f))]
    onlyfiles = argv[1:]

    for fileName in onlyfiles:
        file_no_ext = Path(fileName).stem

        names = file_no_ext.split('_')
        if len(names) != 3:
            date = 'null'
            correct = False
        else:
            [waybill, invoice, cds] = names

            # Check if the fileName match with the data inside that file
            [correct, date] = checkFile(fixedPath, file_no_ext, [waybill, invoice, cds], ext="xls")

        # # Send result back to Electron
        # print(fileName)
        # print(date)
        # print(correct)
        result.append(fileName)
        result.append(date)
        result.append(correct)
        
    return result





# from pathlib import Path
# import sys
# from checkFolder import checkFile
# import json

# if len(sys.argv) == 1:
#     print("failed")
#     print("does not have any arguments")
#     sys.exit()
    
# CDS_Folder = sys.argv[1]
# fixedPath = f"{CDS_Folder}"

# fileName = sys.argv[2]

# file_no_ext = Path(fileName).stem

# names = file_no_ext.split('_')
# if len(names) != 3:
#     date = 'null'
#     correct = False
# else:
#     [waybill, invoice, cds] = names
    
#     # Check if the fileName match with the data inside that file
#     [correct, date] = checkFile(fixedPath, file_no_ext, [waybill, invoice, cds], ext="xls")

# # Send result back to Electron
# result = {
#     "date": date,
#     "correct": correct
# }
# print(json.dumps(result))

# sys.stdout.flush()

