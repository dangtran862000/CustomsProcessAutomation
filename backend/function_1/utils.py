from os import listdir
from os.path import isfile, join
import os
from pathlib import Path
import shutil
import glob
from pathlib import Path
from checkFolder import checkFile


def preprocess(fixedPath, folder):
    # fixedPath = './general'
    # tmpFolder = f'{fixedPath}/tmp'
    folder = f'{fixedPath}/{folder}'
    onlyfiles = [f for f in listdir(folder) if isfile(join(folder, f))]
    files = []

    for fileName in onlyfiles:
        file_no_ext = Path(fileName).stem
        [waybill, invoice, cds] = file_no_ext.split('_')

        # Check if the fileName match with the data inside that file
        [correct, date] = checkFile(folder, file_no_ext, [waybill, invoice, cds], ext="xls")
        if not correct:
            print(f"Not correct - {fileName}")
            return []

        files.append([waybill, invoice, cds])

        current = f'{fixedPath}/tmp/{fileName}'
        destination = f'{fixedPath}/files/{waybill}'

        Path(destination).mkdir(parents=True, exist_ok=True)
        # Move file 
        # shutil.move(current, destination)
        # OR just copy
        shutil.copy2(current, f'{destination}')

        break
        
    
    return files

def getLastest(folder):
    list_of_files = glob.glob(f'{folder}/*') # * means all if need specific format then *.csv
    latest_file = max(list_of_files, key=os.path.getctime)
    return Path(latest_file).stem

def rename(src, dest):
    os.rename(src, dest)

def zip_folder(source, dest):
    return shutil.make_archive(dest, 'zip', source)
