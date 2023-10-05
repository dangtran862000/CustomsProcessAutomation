import sys
import os
import shutil

args = sys.argv

path_Source = str(args[1])
path_destination= os.getcwd()+"/backend/function_2/"+"/Checklist template V.1.xlsx"

shutil.copy(path_Source, path_destination)

print("Successfully update the new CDS checklist template")
sys.stdout.flush()