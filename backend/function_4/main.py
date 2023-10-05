import function_4.webScraping as webScraping
import function_4.checkBrowser as checkBrowser
import sys
import ast

step = sys.argv[3]


if (step == 'checkStatus'):
    checkBrowser.start()
elif (step == 'webScraping'):
    args = sys.argv[4:]
    webScraping.start(args)