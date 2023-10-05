import sys
import checkFiles_2
import webScrapping2_4
import webScrapping1_4
import compressToZip_5
import zipFolder

step = sys.argv[3]
argv = sys.argv[4:]
result = []

if step == 'checkFiles_2':
    result = checkFiles_2.start(argv)
elif step == 'compressToZip_5':
    result = compressToZip_5.start(argv)
elif step == 'webScrapping1_4':
    result = webScrapping1_4.start(argv)
elif step == 'webScrapping2_4':
    result = webScrapping2_4.start(argv)
elif step == 'zipFolder':
    result = zipFolder.start(argv)

for i in result:
    print(i)

sys.stdout.flush()