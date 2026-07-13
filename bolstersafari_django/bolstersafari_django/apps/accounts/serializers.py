from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from apps.accounts.models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Used for customer login — no staff check required."""
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        from django.db.models import Q
        user = User.objects.filter(Q(username__iexact=username) | Q(email__iexact=username)).first()

        if user and user.check_password(password):
            if not user.is_active:
                raise AuthenticationFailed("Your account has been suspended or banned.")

        # Pass the real username so SimpleJWT's authenticate() finds the user
        if user:
            attrs['username'] = user.username
        try:
            return super().validate(attrs)
        except AuthenticationFailed:
            raise AuthenticationFailed("Invalid username or password")


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Used for admin panel login — requires is_staff=True."""
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        from django.db.models import Q
        user = User.objects.filter(Q(username__iexact=username) | Q(email__iexact=username)).first()

        if not user:
            raise AuthenticationFailed("Invalid credentials.")

        if not user.check_password(password):
            raise AuthenticationFailed("Invalid credentials.")

        if not user.is_active:
            raise AuthenticationFailed("Your account has been suspended.")

        if not user.is_staff:
            raise AuthenticationFailed("Access denied. Admin privileges required.")

        # Pass the real username so SimpleJWT's authenticate() finds the user
        attrs['username'] = user.username
        try:
            return super().validate(attrs)
        except AuthenticationFailed:
            raise AuthenticationFailed("Invalid credentials.")



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'display_name', 'role', 'is_active', 'date_joined']


class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'phone', 'whatsapp', 'role', 'avatar_url', 'display_name']
        read_only_fields = ['id', 'username', 'email', 'role', 'display_name']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
