from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from . import store


def _employee_list(request):
    page = max(1, int(request.GET.get('page', 1)))
    limit = min(100, max(1, int(request.GET.get('limit', 20))))
    data, total = store.employee_list(page=page, limit=limit)
    return Response({'data': data, 'total': total, 'page': page, 'limit': limit})


def _employee_detail(request, pk):
    emp = store.employee_get(pk)
    if not emp:
        return Response({'error': 'Employee not found.', 'code': 'NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
    return Response(emp)


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
    emp, err = store.employee_create(full_name=full_name, email=email, department=department)
    if err == 'EMAIL_EXISTS':
        return Response({'error': 'Email already in use.', 'code': 'EMAIL_EXISTS'}, status=status.HTTP_409_CONFLICT)
    return Response(emp, status=status.HTTP_201_CREATED)


def _employee_update(request, pk):
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
    emp, err = store.employee_update(pk, full_name=full_name, email=email, department=department)
    if err == 'NOT_FOUND':
        return Response({'error': 'Employee not found.', 'code': 'NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
    if err == 'EMAIL_EXISTS':
        return Response({'error': 'Email already in use.', 'code': 'EMAIL_EXISTS'}, status=status.HTTP_409_CONFLICT)
    return Response(emp)


def _employee_delete(request, pk):
    if not store.employee_delete(pk):
        return Response({'error': 'Employee not found.', 'code': 'NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)


def _attendance_mark(request):
    data = request.data
    employee_id = data.get('employee_id')
    date_val = data.get('date')
    status_val = data.get('status')
    errors = []
    if not employee_id:
        errors.append({'field': 'employee_id', 'message': 'Required.'})
    if not date_val:
        errors.append({'field': 'date', 'message': 'Required.'})
    if status_val not in ('Present', 'Absent'):
        errors.append({'field': 'status', 'message': 'Must be Present or Absent.'})
    if errors:
        return Response({'error': 'Validation failed.', 'code': 'VALIDATION_ERROR', 'details': errors}, status=status.HTTP_400_BAD_REQUEST)
    att, err = store.attendance_mark(employee_id=employee_id, date_val=date_val, status=status_val)
    if err == 'NOT_FOUND':
        return Response({'error': 'Employee not found.', 'code': 'NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
    return Response(att, status=status.HTTP_201_CREATED)


def _attendance_by_employee(request, employee_id):
    from_date = request.GET.get('from')
    to_date = request.GET.get('to')
    data, err = store.attendance_by_employee(employee_id, from_date=from_date, to_date=to_date)
    if err == 'NOT_FOUND':
        return Response({'error': 'Employee not found.', 'code': 'NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
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
