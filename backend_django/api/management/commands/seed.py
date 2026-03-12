from django.core.management.base import BaseCommand
from api.mongodb import get_database
from datetime import date, timedelta
import uuid
from datetime import datetime

COLL_EMPLOYEES = 'employees'
COLL_ATTENDANCES = 'attendances'


class Command(BaseCommand):
    help = 'Seed sample employees and attendance (MongoDB)'

    def handle(self, *args, **options):
        db = get_database()
        if db[COLL_EMPLOYEES].count_documents({}) > 0:
            self.stdout.write('Data already exists. Skipping seed.')
            return
        now = datetime.utcnow()
        employees = [
            {'_id': uuid.uuid4(), 'full_name': 'John Doe', 'email': 'john.doe@company.com', 'department': 'Engineering', 'created_at': now, 'updated_at': now},
            {'_id': uuid.uuid4(), 'full_name': 'Jane Smith', 'email': 'jane.smith@company.com', 'department': 'HR', 'created_at': now, 'updated_at': now},
            {'_id': uuid.uuid4(), 'full_name': 'Bob Wilson', 'email': 'bob.wilson@company.com', 'department': 'Sales', 'created_at': now, 'updated_at': now},
        ]
        for e in employees:
            db[COLL_EMPLOYEES].insert_one(e)
        today = date.today()
        yesterday = today - timedelta(days=1)
        for emp in employees:
            eid = emp['_id']
            for d, status in [(today, 'Present'), (yesterday, 'Present')]:
                db[COLL_ATTENDANCES].insert_one({
                    '_id': uuid.uuid4(),
                    'employee_id': eid,
                    'date': d,
                    'status': status,
                    'created_at': now,
                    'updated_at': now,
                })
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(employees)} employees and sample attendance.'))
