import os
import sys
import subprocess

# Check if spacy is installed
try:
    import spacy
except ImportError:
    # Install spacy if not installed
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'spacy'])

# Download the model
subprocess.check_call([sys.executable, '-m', 'spacy', 'download', 'en_core_web_lg'])
