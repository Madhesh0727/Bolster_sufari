"""Reviews API Views — BolsterSafari"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.reviews.models import Review
from apps.reviews.serializers import ReviewSerializer, ReviewCreateSerializer


class ReviewListAPIView(generics.ListAPIView):
    """Public endpoint — list published reviews for a trip by slug."""
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        from apps.trips.models import Trip
        slug = self.kwargs.get('slug')
        try:
            trip = Trip.objects.get(slug=slug)
            return Review.objects.filter(trip=trip, is_published=True)
        except Trip.DoesNotExist:
            return Review.objects.none()


class ReviewCreateAPIView(APIView):
    """Authenticated endpoint — submit a review for a trip."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReviewCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            review = serializer.save()
            return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
