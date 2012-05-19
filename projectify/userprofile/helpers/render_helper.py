from django.shortcuts import render_to_response
from django.template.loader import get_template
from django.template import RequestContext, Context
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.utils import simplejson
from django.core.serializers import json, serialize

# Main application helper class
class RenderHelper(object):
	def __init__(self):
		self.render_data = {}
	
	# Preparing data for rendering
	def set_data(self, element, value = None):
		if value == None:
			self.render_data = element
		else:
			self.render_data[element] = value
		
	# Rendering template
	def do(self, template, request, class_based=False):
		page_name = 'page_' + template.replace('-', '_').replace('.html', '')
		self.set_data(page_name, True)
		
		data = self.render_data
		self.render_data = {}
		
		if not class_based:
			return render_to_response(template, data, context_instance=RequestContext(request))
		else:
			return class_based.render_to_response(data)
	
	def template(self, template, request):
		template = get_template(template)
		
		data = self.render_data
		self.render_data = {}
		
		return template.render(RequestContext(request, data))
	
	def json(self, render_object):
		if isinstance(render_object, HttpResponse):
			content = serialize('json', render_object)
		else:
			content = simplejson.dumps(
					render_object, indent=2, cls=json.DjangoJSONEncoder,
	             	ensure_ascii=False
             	)
        
		return HttpResponse(content, content_type='application/json')
	
	def form_errors(self, form):
		output_dict = {'error_status' : 'true'}
		
		dictionary = {}
		for element in form.errors.iteritems():
			dictionary.update(
			    {
			        element[0] : unicode(element[1])
			    }
			)
			
		output_dict.update({'errors': dictionary  })
		
		return self.json(output_dict)
