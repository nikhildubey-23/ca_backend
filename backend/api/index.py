import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app import app as application

def handler(environ, start_response):
    return application(environ, start_response)
