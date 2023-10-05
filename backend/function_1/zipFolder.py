# import sys
from utils import zip_folder

def start(argv):
    fromPath = argv[0]
    destPath = argv[1]

    path = zip_folder(fromPath, destPath)

    # print("success")
    # print(path)

    return ["success", path]
    # sys.stdout.flush()