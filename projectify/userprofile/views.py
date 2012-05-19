# Import Django
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponse, Http404, HttpResponseNotFound
from django.utils.translation import ugettext as _
from django.core.urlresolvers import reverse
from django.utils.decorators import method_decorator
from django.views.generic import View
from django.views.generic.base import TemplateResponseMixin
from django.contrib.auth import *

# Import helpers
from helpers.render_helper import *
render = RenderHelper()

class LoginView(TemplateResponseMixin, View):
	template_name = 'login.html'

	def get(self, request):
		redirect_url = '/'
		if request.GET.get('next'):
			redirect_url = request.GET.get('next')

		# Check if the current user is authenticated
		if not request.user.is_authenticated():
			render.set_data('redirect_url', redirect_url)
			
			return render.do(self.template_name, request, self)
		else:
			return HttpResponseRedirect(redirect_url)

	def post(self, request):
		context = {}
	
		redirect_url = '/'
		if request.GET.get('next'):
			redirect_url = request.GET.get('next')

		if not request.user.is_authenticated():
			user = authenticate(email = request.POST['user_email'], password = request.POST['password'])
			#import pdb; pdb.set_trace()
			if user is not None:
				request.session['user'] = user
				
				if user.is_authenticated():
					login(request, user)
					
					if request.POST.get('redirect_url'):
						redirect_url = request.POST.get('redirect_url')
					
					return HttpResponseRedirect(redirect_url)
				else:
					context = { 'response' : _('User is not authenticated!')}
			else:
				context = { 'response' : _('Invalid username or password.') }

			render.set_data(context)
			render.set_data('redirect_url', redirect_url)
			
			return render.do(self.template_name, request, self)
		else:
			return HttpResponseRedirect(redirect_url)