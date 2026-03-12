from django.core.paginator import Paginator
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer, AttendanceCreateSerializer


def _employee_list(request):
    page = max(1, int(request.GET.get('page', 1)))
    limit = min(100, max(1, int(request.GET.get('limit', 20))))
    qs = Employee.objects.all().order_by('-created_at')
    paginator = Paginator(qs, limit)
    p = paginator.get_page(page)
    data = EmployeeSerializer(p.object_list, many=True).data
    return Response({'data': data, 'total': paginator.count, 'page': page, 'limit': limit})


def _employee_detail(request, pk):
    try:
        emp = Employee.objects.get(pk=pk)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found.', 'code': 'NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
    return Response(EmployeeSerializer(emp).data)


def _employee_create(request):
    data = request.data
    full_name = (data.get('full_name') or '').strip()
    email = (data.get('email') or '').strip()
    department = (data.get('department') or '').strip()
    errors = []
    if not full_name:
        errors.append({'field': 'full_name', 'message': 'Full name is required.'})
    if not email:
        errors.append({'field': 'email', 'message': 'Email is required.'})
    elif '@' not in email or '.' not in email.split('@')[-1]:
        errors.append({'field': 'email', 'message': 'Invalid email format.'})
    if not department:
        errors.append({'field': 'department', 'message': 'Department is required.'})
    if errors:
        return Response({'error': 'Validation failed.', 'code': 'VALIDATION_ERROR', 'details': errors}, status=status.HTTP_400_BAD_REQUEST)
    if Employee.objects.filter(email=email).exists():
        return Response({'error': 'Email already in use.', 'code': 'EMAIL_EXISTS'}, status=status.HTTP_409_CONFLICT)
    emp = Employee.objects.create(full_name=full_name, email=email, department=department)
    return Response(EmployeeSerializer(emp).data, status=status.HTTP_201_CREATED)


def _employee_update(request, pk):
    try:
        emp = Employee.objects.get(pk=pk)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found.', 'code': 'NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
    data = request.data
    full_name = (data.get('full_name') or '').strip()
    email = (data.get('email') or '').strip()
    department = (data.get('department') or '').strip()
    errors = []
    if not full_name:
        errors.append({'field': 'full_name', 'message': 'Full name is required.'})
    if not email:
        errors.append({'field': 'email', 'message': 'Email is required.'})
    elif '@' not in email or '.' not in email.split('@')[-1]:
        errors.append({'field': 'email', 'message': 'Invalid email format.'})
    if not department:
        errors.append({'field': 'department', 'message': 'Department is required.'})
    if errors:
        return Response({'error': 'Validation failed.', 'code': 'VALIDATION_ERROR', 'details': errors}, status=status.HTTP_400_BAD_REQUEST)
    if Employee.objects.filter(email=email).exclude(pk=pk).exists():
        return Response({'error': 'Email already in use.', 'code': 'EMAIL_EXISTS'}, status=status.HTTP_409_CONFLICT)
    emp.full_name = full_name
    emp.email = email
    emp.department = department
    emp.save()
    return Response(EmployeeSerializer(emp).data)


def _employee_delete(request, pk):
    try:
        emp = Employee.objects.get(pk=pk)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found.', 'code': 'NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
    emp.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


def _attendance_mark(request):
    ser = AttendanceCreateSerializer(data=request.data)
    if not ser.is_valid():
        details = [{'field': k, 'message': str(v[0]) if v else 'Invalid'} for k, v in ser.errors.items()]
        return Response({'error': 'Validation failed.', 'code': 'VALIDATION_ERROR', 'details': details}, status=status.HTTP_400_BAD_REQUEST)
    data = ser.validated_data
    try:
        employee = Employee.objects.get(pk=data['employee_id'])
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found.', 'code': 'NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
    att, created = Attendance.objects.update_or_create(
        employee=employee,
        date=data['date'],
        defaults={'status': data['status']},
    )
    return Response(AttendanceSerializer(att).data, status=status.HTTP_201_CREATED)


def _attendance_by_employee(request, employee_id):
    try:
        employee = Employee.objects.get(pk=employee_id)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found.', 'code': 'NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
    qs = Attendance.objects.filter(employee=employee).order_by('-date')
    from_date = request.GET.get('from')
    to_date = request.GET.get('to')
    if from_date and len(from_date) == 10:
        qs = qs.filter(date__gte=from_date)
    if to_date and len(to_date) == 10:
        qs = qs.filter(date__lte=to_date)
    data = AttendanceSerializer(qs, many=True).data
    return Response({'data': data})


@api_view(['GET', 'POST'])
def employee_list_create(request):
    if request.method == 'GET':
        return _employee_list(request)
    return _employee_create(request)


@api_view(['GET', 'PUT', 'DELETE'])
def employee_detail_update_delete(request, pk):
    if request.method == 'GET':
        return _employee_detail(request, pk)
    if request.method == 'PUT':
        return _employee_update(request, pk)
    return _employee_delete(request, pk)


@api_view(['POST'])
def attendance_mark(request):
    return _attendance_mark(request)


@api_view(['GET'])
def attendance_by_employee(request, employee_id):
    return _attendance_by_employee(request, employee_id)
