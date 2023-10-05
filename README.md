# Capstone Project 2023 - 4TechTeam



## Getting up and running

1. Create a new Python environment and activate.

**Pyenv**
```bash
virtualenv venv --python=python3.9
source venv/Scripts/activate
```

2. Once you have activated your Python environment, install your repository as a Python package

```bash
pip install -r requirements.txt
```

3. Start the [Dagit process](https://docs.dagster.io/overview/dagit). This will start a Dagit web
server that, by default, is served on http://localhost:3000.

```bash
dagit
```
1