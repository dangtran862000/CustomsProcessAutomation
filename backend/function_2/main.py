import sys
import export_process
import import_process

step = sys.argv [3]

if (step == 'export'):
    to = sys.argv[4]
    filePath =  sys.argv[5]
    shippingdocsPath = sys.argv[6]
    BillPath = sys.argv[7]
    export_process.start( to, filePath, shippingdocsPath, BillPath)
elif (step == 'import'):
    to = sys.argv[4]
    filePath =  sys.argv[5]
    shippingdocsPath = sys.argv[6]
    import_process.start(to, filePath, shippingdocsPath)
