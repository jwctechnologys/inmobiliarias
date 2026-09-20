from django import forms
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import User

class UserForm(forms.Form):
    password = forms.CharField(widget=forms.PasswordInput)
    username = forms.CharField(max_length=150)
    email = forms.EmailField()
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'groups','user_permissions',
'is_staff',
'is_active',
'is_superuser',
'last_login',
'date_joined']