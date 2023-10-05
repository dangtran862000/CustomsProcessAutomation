from utils import zip_folder

def start(argv):
    # fixedPath = argv[0]
    folders = argv[1:]
    zipLogs = []

    for folder in folders:
        folderName = folder.split('\\')[-1]
        # try:

        zipFolder = f'{folder}\\..\\..\\zips\\{folderName}'
        zip_folder(folder, zipFolder)
        zipLogs.append(zipFolder)
        # print(zip_folder)

        # except:
        # errorLogs.append(folder)

    # print("success")
    # for zipFolder in zipLogs:
    #     print(zipFolder)
    # sys.stdout.flush()

    zipLogs.insert(0, "success")
    return zipLogs