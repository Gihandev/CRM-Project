# activity/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    """
    Converts ActivityLog objects to JSON.
    Shows username instead of user ID.
    """
    user = serializers.StringRelatedField()

    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'user',
            'action',
            'model_name',
            'object_id',
            'timestamp'
        ]


class ActivityLogListView(APIView):
    """
    GET /api/v1/activity/
    Returns all activity logs for the user's organization.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only get logs from MY organization
        logs = ActivityLog.objects.filter(
            organization=request.user.organization
        ).order_by('-timestamp')  # newest first

        # Filter by action type e.g. ?action=DELETE
        action = request.query_params.get('action')
        if action:
            logs = logs.filter(action=action.upper())

        # Filter by model name e.g. ?model=Company
        model_name = request.query_params.get('model')
        if model_name:
            logs = logs.filter(model_name__icontains=model_name)

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = 20
        start = (page - 1) * page_size
        end = start + page_size

        total = logs.count()
        logs_page = logs[start:end]

        serializer = ActivityLogSerializer(logs_page, many=True)

        return Response({
            'count': total,
            'page': page,
            'page_size': page_size,
            'results': serializer.data
        })
