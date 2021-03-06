#!/usr/bin/env python
'''
ooiui.core.routes.aa

Defines the application routes

Alerts and Alarms

v 0.1
'''
from ooiui.core.app import app
from flask import request, render_template, Response, jsonify
from flask import stream_with_context, make_response
from ooiui.core.routes.common import get_login
import json
import requests
import os


#main aa page
@app.route('/alerts/dashboard')
@app.route('/alerts/dashboard/')
def aa_dashboard():
    return render_template('aa/AlertPage.html', tracking=app.config['GOOGLE_ANALYTICS'])

#main aa page
@app.route('/alerts/dashboard/triggered')
@app.route('/alerts/dashboard/triggered')
def aa_triggered_dashboard():
    return render_template('aa/TriggeredPage.html', tracking=app.config['GOOGLE_ANALYTICS'])

#edit/new page for aa
#this is not being used right now
@app.route('/alerts/createalert')
@app.route('/alerts/createalert/')
def aa_index():
    return render_template('aa/CreateAlert.html', tracking=app.config['GOOGLE_ANALYTICS'])

@app.route('/alerts/get_instrument_metadata/<string:ref_des>/<string:stream_name>', methods=['GET'])
def get_instrument_metadata(ref_des, stream_name):
    '''
    gets the alert alarm metadata for a given ref des
    '''
    token = get_login()
    response = requests.get(app.config['SERVICES_URL'] + '/alert_alarm_get_instrument_metadata/'+ref_des, auth=(token, ''))    
    try:
        text =  response.json()
        tmp = stream_name.split('_')[::-1][0]
        method = stream_name.replace('_'+tmp, '')
        text = text['stream_metadata'][method][stream_name]
        return jsonify(stream_metadata=text)
    except:
        return response.text, response.status_code

#All current alerts that have been triggered
#
# http://localhost:4000/alert_alarm_definition
@app.route('/api/aa/triggered', methods=['GET'])
def get_aa_triggered_all():
    token = get_login()
    response = requests.get(app.config['SERVICES_URL'] + '/alert_alarms', auth=(token, ''))
    return response.text, response.status_code

@app.route('/api/aa/triggered/<string:id>', methods=['GET'])
def get_triggered_specific_id(id):
    token = get_login()
    response = requests.get(app.config['SERVICES_URL'] + '/alert_alarm?%s' % (id), auth=(token, ''), params=request.args)    
    return response.text, response.status_code

@app.route('/api/aa/status', methods=['GET'])
def get_aa_triggered_all_status():
    token = get_login()
    response = requests.get(app.config['SERVICES_URL'] + '/alert_alarm/status', auth=(token, ''))
    return response.text, response.status_code

@app.route('/api/aa/status/<string:id>', methods=['GET'])
def get_triggered_specific_id_status(id):
    token = get_login()    
    data={'status':[id]}
    return jsonify(data)


@app.route('/api/aa/triggered', methods=['POST'])
def post_aa_triggered():
    token = get_login()
    data = json.loads(request.data)
    response = requests.post(app.config['SERVICES_URL'] + '/alert_alarm', auth=(token, ''), data=data)
    return response.text, response.status_code


# Alerts by List
#
# http://localhost:4000/alert_alarm_definition
@app.route('/api/aa/alerts', methods=['GET'])
def get_aa_array_all():
    token = get_login()
    response = requests.get(app.config['SERVICES_URL'] + '/alert_alarm_definition', auth=(token, ''))
    return response.text, response.status_code

@app.route('/api/aa/alerts', methods=['POST'])
def create_aa_array():
    token = get_login()
    data = json.loads(request.data)
    response = requests.post(app.config['SERVICES_URL'] + '/alert_alarm_definition', auth=(token, ''), data=request.data)
    return response.text, response.status_code

@app.route('/api/aa/alerts', methods=['PUT'])
def edit_aa_array():    
    token = get_login()
    data = json.loads(request.data)
    #id needed by the services to get the filter
    def_id = data['id']
    response = requests.put(app.config['SERVICES_URL'] + '/alert_alarm_definition/%s' % def_id, auth=(token, ''), data=request.data)
    return response.text, response.status_code


# currently filter all alert definitions by one id
@app.route('/api/aa/<string:id>', methods=['GET'])
def get_aa_specific_id(id):
    token = get_login()
    response = requests.get(app.config['SERVICES_URL'] + '/alert_alarm_definition?%s' % (id), auth=(token, ''), params=request.args)
    return response.text, response.status_code

# Exposes the REDMINE_URL config.yml parameter
@app.route('/api/aa/redmineurl', methods=['GET'])
def get_aa_redmine_server():
    return app.config['REDMINE_URL']

# http://localhost:4000/user_event_notifications
@app.route('/api/aa/user_event_notifications', methods=['GET'])
def get_user_event_notifications():
    token = get_login()
    response = requests.get(app.config['SERVICES_URL'] + '/user_event_notifications', auth=(token, ''))
    return response.text, response.status_code

@app.route('/api/aa/user_event_notifications', methods=['PUT'])
def update_user_event_notification():
    token = get_login()
    data = json.loads(request.data)
    def_id = data['id']
    response = requests.put(app.config['SERVICES_URL'] + '/user_event_notification/%s' % def_id, auth=(token, ''), data=request.data)
    return response.text, response.status_code

# acknowledge single alert or alarm
@app.route('/api/aa/ack_alert_alarm', methods=['PUT'])
def ack_alert_alarm():
    token = get_login()
    response = requests.post(app.config['SERVICES_URL'] + '/ack_alert_alarm', auth=(token, ''), data=request.data)
    return response.text, response.status_code

# clear (resolve) single alert or alarm
@app.route('/api/aa/resolve_alert_alarm', methods=['PUT'])
def resolve_alert_alarm():
    token = get_login()
    data = json.loads(request.data)
    #id needed by the services to get the filter
    def_id = data['id']
    response = requests.put(app.config['SERVICES_URL'] + '/resolve_alert_alarm/%s' % def_id, auth=(token, ''), data=request.data)
    return response.text, response.status_code

# acknowledge all alerts and alarms
@app.route('/api/aa/ack_alert_alarm_definition', methods=['PUT', 'GET'])
def ack_all_alert_alarm():
    token = get_login()
    data = json.loads(request.data)
    #id needed by the services to get the filter
    def_id = data['id']
    response = requests.get(app.config['SERVICES_URL'] + '/ack_alert_alarm_definition/%s' % def_id, auth=(token, ''), data=request.data)
    return response.text, response.status_code

# clear (resolve) single alert or alarm
@app.route('/api/aa/resolve_alert_alarm_definition', methods=['PUT'])
def resolve_all_alert_alarm():
    token = get_login()
    data = json.loads(request.data)
    #id needed by the services to get the filter
    def_id = data['id']
    response = requests.put(app.config['SERVICES_URL'] + '/resolve_alert_alarm_definition/%s' % def_id, auth=(token, ''), data=request.data)
    return response.text, response.status_code

# clear (resolve) single alert or alarm
@app.route('/api/aa/delete_alert_alarm_definition', methods=['PUT'])
def retire_all_alert_alarm():
    token = get_login()
    data = json.loads(request.data)
    #id needed by the services to get the filter
    def_id = data['id']
    response = requests.delete(app.config['SERVICES_URL'] + '/delete_alert_alarm_definition/%s' % def_id, auth=(token, ''), data=request.data)
    return response.text, response.status_code
