"""
MongoDB connection for backend_django.
Uses DATABASE_URL (MongoDB URI). Falls back to local mongodb if not set.
"""
import os
from pymongo import MongoClient
from pymongo.database import Database

_client = None
_db: Database = None


def get_database():
    global _db
    if _db is not None:
        return _db
    url = os.environ.get('DATABASE_URL', 'mongodb://localhost:27017/')
    if not url.startswith('mongodb'):
        url = 'mongodb://localhost:27017/'
    # Strip angle brackets from URL (e.g. <password>); they break auth
    if '<' in url or '>' in url:
        url = url.replace('<', '').replace('>', '')
    client = MongoClient(url, serverSelectionTimeoutMS=5000)
    db_name = url.split('/')[-1].split('?')[0] if '/' in url.rstrip('/') else 'hrms_lite'
    if not db_name or db_name == url:
        db_name = 'hrms_lite'
    _db = client[db_name]
    return _db
