from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.core.validators import email_re

class EmailAuthBackend(ModelBackend):
	supports_object_permissions = False
	supports_anonymous_user = False
	supports_inactive_user = False

	def authenticate(self, email=None, password=None):
		if email_re.search(email):
			try:
				user = User.objects.get(email=email)

				if user.check_password(password):
					return user
			except User.DoesNotExist:
				return None
		return None