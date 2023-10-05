import sys
import csv
import shutil
import json
import os 

def start(table_data_url):
    # Receive the folder path and table data from the Electron app
    folder_path = os.getcwd()+'/backend/function_3/'
    table_data = json.loads(table_data_url)

    # Process the folder path and table data as needed
    # ... your code here ...
    # Prepare the header row
    header_row = ['S.no', 'Email']

    # Save the table data to a temporary CSV file
    temp_csv_file = os.getcwd()+'/backend/function_3/data.csv'
    with open(temp_csv_file, 'w', newline='') as file:
        writer = csv.writer(file)
        # Write the header row
        writer.writerow(header_row)
        for row in table_data:
            writer.writerow(row)
    # Read the contents of the temporary CSV file
    with open(temp_csv_file, 'r') as file:
        content = file.read()

    # Remove the trailing newline character
    new_content = content.rstrip('\n')

    # Write the modified content back to the temporary CSV file
    with open(temp_csv_file, 'w') as file:
        file.write(new_content)
        
    # Replace the data.csv file in the specified folder path with the temporary CSV file
    shutil.move(temp_csv_file, folder_path + 'data.csv')

    # Optionally, you can print some output to be captured by the Electron app
    print('Data received and saved successfully')
    sys.stdout.flush()