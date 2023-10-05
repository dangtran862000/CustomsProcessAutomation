Capstone Project 2023 - 4TechTeam
Getting up and running
Create a new Python environment and activate.
Pyenv

virtualenv venv --python=python3.9
source venv/Scripts/activate
Once you have activated your Python environment, install your repository as a Python package
pip install -r requirements.txt
Start the Dagit process. This will start a Dagit web server that, by default, is served on http://localhost:3000.
dagit
1
