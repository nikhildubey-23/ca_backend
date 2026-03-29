import sys
import os

# Add backend directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Change working directory
os.chdir(parent_dir)

from app import app as application

app = application
