from django.core.management.base import BaseCommand
from api.models import Employee, Attendance
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Seed sample employees and attendance'

    def handle(self, *args, **options):
        if Employee.objects.exists():
            self.stdout.write('Data already exists. Skipping seed.')
            return
        employees = [
            Employee(full_name='John Doe', email='john.doe@company.com', department='Engineering'),
            Employee(full_name='Jane Smith', email='jane.smith@company.com', department='HR'),
            Employee(full_name='Bob Wilson', email='bob.wilson@company.com', department='Sales'),
        ]
        for e in employees:
            e.save()
        today = date.today()
        yesterday = today - timedelta(days=1)
        for emp in employees:
            Attendance.objects.create(employee=emp, date=today, status='Present')
            Attendance.objects.create(employee=emp, date=yesterday, status='Present')
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(employees)} employees and sample attendance.'))
