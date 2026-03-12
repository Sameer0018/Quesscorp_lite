"""
MongoDB document store for Employee and Attendance.
Returns dicts in API shape: id (str UUID), dates as ISO strings.
"""
import uuid
from datetime import datetime, date
from .mongodb import get_database

COLL_EMPLOYEES = 'employees'
COLL_ATTENDANCES = 'attendances'


def _serialize_employee(doc):
    if not doc:
        return None
    return {
        'id': str(doc['_id']),
        'full_name': doc['full_name'],
        'email': doc['email'],
        'department': doc['department'],
        'created_at': doc['created_at'].isoformat() + 'Z' if isinstance(doc.get('created_at'), datetime) else doc.get('created_at'),
        'updated_at': doc['updated_at'].isoformat() + 'Z' if isinstance(doc.get('updated_at'), datetime) else doc.get('updated_at'),
    }


def _serialize_attendance(doc, employee_id=None):
    if not doc:
        return None
    eid = employee_id or doc.get('employee_id')
    if isinstance(eid, uuid.UUID):
        eid = str(eid)
    d = doc.get('date')
    if hasattr(d, 'isoformat'):
        d = d.date().isoformat() if isinstance(d, datetime) else d.isoformat()
    return {
        'id': str(doc['_id']),
        'employee_id': eid,
        'date': d,
        'status': doc['status'],
        'created_at': doc['created_at'].isoformat() + 'Z' if isinstance(doc.get('created_at'), datetime) else doc.get('created_at'),
        'updated_at': doc['updated_at'].isoformat() + 'Z' if isinstance(doc.get('updated_at'), datetime) else doc.get('updated_at'),
    }


def employee_list(page=1, limit=20):
    db = get_database()
    col = db[COLL_EMPLOYEES]
    total = col.count_documents({})
    skip = (page - 1) * limit
    cursor = col.find({}).sort('created_at', -1).skip(skip).limit(limit)
    data = [_serialize_employee(d) for d in cursor]
    return data, total


def employee_get(pk):
    db = get_database()
    col = db[COLL_EMPLOYEES]
    try:
        uid = uuid.UUID(str(pk))
    except (ValueError, TypeError):
        return None
    doc = col.find_one({'_id': uid})
    return _serialize_employee(doc)


def employee_create(full_name, email, department):
    db = get_database()
    col = db[COLL_EMPLOYEES]
    if col.find_one({'email': email}):
        return None, 'EMAIL_EXISTS'
    now = datetime.utcnow()
    uid = uuid.uuid4()
    doc = {
        '_id': uid,
        'full_name': full_name,
        'email': email,
        'department': department,
        'created_at': now,
        'updated_at': now,
    }
    col.insert_one(doc)
    return _serialize_employee(doc), None


def employee_update(pk, full_name, email, department):
    db = get_database()
    col = db[COLL_EMPLOYEES]
    try:
        uid = uuid.UUID(str(pk))
    except (ValueError, TypeError):
        return None, 'NOT_FOUND'
    existing = col.find_one({'_id': uid})
    if not existing:
        return None, 'NOT_FOUND'
    if col.find_one({'email': email, '_id': {'$ne': uid}}):
        return None, 'EMAIL_EXISTS'
    now = datetime.utcnow()
    col.update_one(
        {'_id': uid},
        {'$set': {'full_name': full_name, 'email': email, 'department': department, 'updated_at': now}}
    )
    doc = col.find_one({'_id': uid})
    return _serialize_employee(doc), None


def employee_delete(pk):
    db = get_database()
    col = db[COLL_EMPLOYEES]
    try:
        uid = uuid.UUID(str(pk))
    except (ValueError, TypeError):
        return False
    result = col.delete_one({'_id': uid})
    if result.deleted_count:
        db[COLL_ATTENDANCES].delete_many({'employee_id': uid})
    return result.deleted_count > 0


def attendance_mark(employee_id, date_val, status):
    db = get_database()
    emp_col = db[COLL_EMPLOYEES]
    att_col = db[COLL_ATTENDANCES]
    try:
        eid = uuid.UUID(str(employee_id))
    except (ValueError, TypeError):
        return None, 'NOT_FOUND'
    if not emp_col.find_one({'_id': eid}):
        return None, 'NOT_FOUND'
    if isinstance(date_val, str) and len(date_val) == 10:
        date_val = date.fromisoformat(date_val)
    now = datetime.utcnow()
    existing = att_col.find_one({'employee_id': eid, 'date': date_val})
    if existing:
        att_col.update_one(
            {'_id': existing['_id']},
            {'$set': {'status': status, 'updated_at': now}}
        )
        doc = att_col.find_one({'_id': existing['_id']})
    else:
        uid = uuid.uuid4()
        doc = {
            '_id': uid,
            'employee_id': eid,
            'date': date_val,
            'status': status,
            'created_at': now,
            'updated_at': now,
        }
        att_col.insert_one(doc)
    return _serialize_attendance(doc, str(eid)), None


def attendance_by_employee(employee_id, from_date=None, to_date=None):
    db = get_database()
    try:
        eid = uuid.UUID(str(employee_id))
    except (ValueError, TypeError):
        return None, 'NOT_FOUND'
    if not db[COLL_EMPLOYEES].find_one({'_id': eid}):
        return None, 'NOT_FOUND'
    col = db[COLL_ATTENDANCES]
    q = {'employee_id': eid}
    date_filters = {}
    if from_date and len(str(from_date)) == 10:
        date_filters['$gte'] = date.fromisoformat(str(from_date))
    if to_date and len(str(to_date)) == 10:
        date_filters['$lte'] = date.fromisoformat(str(to_date))
    if date_filters:
        q['date'] = date_filters
    cursor = col.find(q).sort('date', -1)
    data = [_serialize_attendance(d, str(eid)) for d in cursor]
    return data, None
