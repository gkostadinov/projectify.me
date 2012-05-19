from django.conf.urls.defaults import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from userprofile.views import *

urlpatterns = patterns('userprofile.views',
	url(r'^login/', LoginView.as_view(), name='login-page'),
	#url(r'^logout/', LogoutView.as_view()),
)

urlpatterns += staticfiles_urlpatterns()