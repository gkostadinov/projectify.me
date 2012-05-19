from django.conf.urls.defaults import patterns, include, url
from django.views.generic import TemplateView
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = patterns('',
	url(r'^chat/', TemplateView.as_view(template_name="chat.html")),
	url(r'^accounts/', include('userprofile.urls')),
)

urlpatterns += staticfiles_urlpatterns()