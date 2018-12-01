//######################################################
// Erstellt das SuggestionPanel
// mit Kopfzeile, Fusszeile
// und Liste (keine Ext.List) für Suggestions
//######################################################
function createSuggestionPanel() {
	
	//######################################################
	// Suggestion Bearbeiten Sheet - Teilnehmer
	//######################################################
	editSuggParticipants = new Ext.Panel({
		scroll: 'vertical',
		height: 100,
		cls: 'transparentPanel',
		dock: 'bottom',
		layout: {
			type: 'vbox',
			align: 'stretch',
			pack: 'start'
		},
		defaults: {
			xtype: 'panel',
			cls: 'participantSlot'
		}
	});
	
	//######################################################
	// Suggestion Bearbeiten Sheet - Uhrzeit + Datum anz.
	//######################################################
	editSuggTimes = new Ext.Panel({
		height: 20,
		cls: 'transparentPanel',
		dock: 'top',
		style: 'margin-bottom:10px;font-weight:bold;text-align:center;',
	});
	
	//######################################################
	// Suggestion Bearbeiten Sheet
	// mit Uhrzeit + Datum, Teilnehmern
	// sowie Buttons Zeiten ändern, Löschen, schließen
	//######################################################
	editSuggSheet = new Ext.Sheet({
		stretchX: true,
	    layout: {
	        type: 'hbox',
	        align: 'stretch',
			pack: 'start'
	    },
	    dockedItems: [
	       	{
		        dock : 'bottom',
	         	xtype: 'button',
		        text : _close,
				style: 'margin-top:20px;',
				handler: function() {
					editSuggSheet.hide();
				}
	        },{
	            dock : 'bottom',
	            xtype: 'button',
				id: 'deleteSuggestion',
				ui: 'decline',
	            text : _delete,
				style: 'margin-top:10px;'
	        },{
	            dock : 'bottom',
	            xtype: 'button',
	            text : _edit_time,
				style: 'margin-top:20px;',
				id: 'editSuggestion'
	        },
			editSuggParticipants,
			{
				dock: 'top',
				xtype: 'panel',
				cls: 'transparentPanel',
				html: _edit_suggestion,
				style: 'margin-bottom:10px;text-align:center;'
			},
			editSuggTimes
	    ]
	});
	
	//######################################################
	// DatePicker für Neues Meeting oder Zeiten ändern
	//######################################################
	suggDatePicker = new Ext.DatePicker({
		slotOrder: ['day','month','year'],
		yearFrom: 2011,
		yearTo: 2100,
		value: new Date()
	});
	
	//######################################################
	// DatePicker onChangeHandler
	// TimePicker anzeigen
	//######################################################
	suggDatePicker.on('change',function(){
		suggDatePicker.on('hide', function(){
			suggTimePicker.show();
		}, this, {single:true});
	},this);
	
	//######################################################
	// TimePicker für Neues Meeting oder Zeiten ändern
	//######################################################
	suggTimePicker = new Ext.Picker({
		floating: true,
		modal: true,
		useTitles: true,
		slots: [
			{
				name: 'fromHour',
				data: pickerHourData
			},{
				name: 'fromMinutes',
				data: pickerMinutesData
			},{
				name: 'spacer',
				data: [{ text: '-', value: 0 }]
			},{
				name: 'toHour',
				data: pickerHourData
			},{
				name: 'toMinutes',
				data: pickerMinutesData
			}
		]
	});
	
	//######################################################
	// TimePicker onPick Handler
	// passt Endzeit an Startzeit an
	// überprüft Zulässigkeit
	//######################################################
	suggTimePicker.on('pick',function(picker, values, slot){
		//23:45 und 23:30 sind nicht erlaubt, da der Termin dann nicht mehr 30 Minuten lang sein kann.
		if (values["fromHour"] == "23" && (values["fromMinutes"] == "45" || values["fromMinutes"] == "30")) {
			picker.setValue({
				fromMinutes: "15"
			});
			values["fromMinutes"] = "15";
		}
		var time_difference_hour = values["toHour"] - values["fromHour"];
		var time_difference_minutes = values["toMinutes"] - values["fromMinutes"];
		var time_difference = time_difference_hour * 60 + time_difference_minutes;
		
		if (time_difference < 30) {
			if (time_difference_minutes < 30) {
				var minutes_to_add = 30 - time_difference;
				var hours_to_add = Math.floor(minutes_to_add/60);
				minutes_to_add = minutes_to_add % 60;
				
				var to_minutes = parseInt(values["toMinutes"]) + minutes_to_add
				if (to_minutes >= 60) {
					hours_to_add++;
					to_minutes -= 60;
				}
				var to_hour = parseInt(values["toHour"]) + hours_to_add;
				to_hour = (to_hour < 10) ? '0' + to_hour : to_hour;
				
				picker.setValue({
					toHour: to_hour,
					toMinutes: to_minutes
				});
			} else {
				picker.setValue({
					toHour: values["fromHour"],
					toMinutes: parseInt(values["fromMinutes"])+30,
				});
			}
		}
	},this);
	
	//######################################################
	// Button in Kopfzeile - Zur MeetingList
	//######################################################
	var btnMeetingList = new Ext.Button({
		ui: 'plain',
		text: '',
		iconCls: 'arrow_left',
		iconMask: true,
		handler: function(){
			basePanel.setActiveItem('meetingPanel', suggestionToMeeting);
			if (!meetingsStore.first())
				meetingsStore.load();
		}
	});
	
	//######################################################
	// Button in Kopfzeile - Neue Suggestion
	//######################################################
	var btnAddSuggestion = new Ext.Button({
		ui: 'plain',
		iconCls: 'add',
		iconMask: true,
		handler: function(){
			suggDatePicker.setValue(new Date());
			suggTimePicker.setValue({
				fromMinutes: 0,
				fromHour: 0,
				toMinutes: 30,
				toHour: 0
			});
			suggDatePicker.show();
			suggTimePicker.on('change', function(){
				suggTimePicker.hide();
				newSuggestionHandler(suggDatePicker.getValue(), suggTimePicker.getValue(), meetingInfoStore.getAt(0).get('id'));
			}, this, {single:true});
		}
	});
	
	//######################################################
	// Button in Fusszeile - Terminvorschlag senden
	//######################################################
	var btnSendPicked = new Ext.Button({
		ui: 'plain',
		text: '',
		iconCls: 'action',
		iconMask: true,
		handler: function() {
			popupSendDates.show();	
		}
	});
	
	//######################################################
	// Popup für Abschließen der Planung - Kopfzeile
	//######################################################
	var popupSendDatesHead = new Ext.Toolbar({
		dock: 'top',
		title: _complete,
		items: [
				{ xtype: 'spacer' },
				{
					xtype: 'button',
					ui: 'plain',
					iconCls: 'delete',
					iconMask: true,
					handler: function(){
						popupSendDates.hide('pop');
					}
				}
			]
	});
	
	//######################################################
	// Popup für Abschließen der Planung - FieldSet
	// umfasst Titel und Checkbox
	//######################################################
	var popupSendDatesFieldSet = new Ext.form.FieldSet({
		defaults: { labelWidth: '50%' },
		items: [
			{
				xtype: 'textareafield',
				name: 'sendDatesMessage',
				label: _message,
			},
			{
				xtype: 'textfield',
				name: 'sendDatesLocation',
				label: _location_optional
			},
			{
				xtype: 'checkboxfield',
				name: 'alsoComment',
				label: _also_comment,
				labelWidth: '100%',
				value: '1'
			}
		]
	});
	
	//######################################################
	// Popup für Abschließen der Planung - Panel
	// umfasst FieldSet und Confirm-Button
	//######################################################
	popupSendDates = new Ext.form.FormPanel({
		floating: true,
		centered: true,
		modal: true,
		width: '90%',
		dockedItems: [popupSendDatesHead],
		items: [
			popupSendDatesFieldSet,
			{
				xtype: 'button',
				text: _send_meetingdata,
				id: 'sendMeetingDates',
				handler: function() {
					this.setDisabled(true);
					pickSuggsHandler(meetingInfoStore.getAt(0).get('id'));
				}
			}
		]
	});
	
	popupSendDates.on('hide',function(){
		this.reset();
	});
	
	//######################################################
	// Button in Fusszeile - ActionPopup zeigen
	//######################################################
	var btnParticipants = new Ext.Button({
		text: _participants,
		id: 'btnParticipants',
		handler: function(){
			basePanel.setActiveItem('participantsPanel', suggestionToParticipants);
		}
	});
	
	//######################################################
	// Button in Fusszeile -  Kommentar verfassen
	//######################################################
	var btnAddComment = new Ext.Button({
		ui: 'plain',
		text: '',
		iconCls: 'compose',
		iconMask: true,
		handler: writeComment
	});
	
	//######################################################
	// Kopfzeile SuggestionPanel
	//######################################################
	var suggestionHead = new Ext.Toolbar({
		dock: 'top',
		title: '',
		items: [
			btnMeetingList,
			{ xtype: 'spacer' },
			btnAddSuggestion
			]
	});
	
	//######################################################
	// Fusszeile SuggestionPanel
	//######################################################
	var suggestionFoot = new Ext.Toolbar({
		dock: 'bottom',
		title: '',
		items: [
			btnSendPicked,
			{ xtype: 'spacer' },
			btnParticipants,
			{ xtype: 'spacer' },
			btnAddComment
			]
	});
	
	//######################################################
	// Panel Liste der Suggestions
	//######################################################
	suggestionList = new Ext.Panel({
		id: 'suggestionList',
		autoHeight: true,
		layout: {
			type: 'vbox',
			pack: 'start',
			align: 'stretch'
		}
	});
	
	//######################################################
	// SuggestionPanel
	//######################################################
	suggestionPanel = new Ext.Panel({
		id: 'suggestionPanel',
		fullscreen: true,
		scroll: 'vertical',
		dockedItems: [suggestionHead,suggestionFoot],
		items: [suggestionList,commentsPanel],
		layout: {
			type: 'vbox',
			pack: 'start',
			align: 'stretch'
		},
		restricted: false
	});
	
	suggestionPanel.on('orientationchange', function(){
		if (meetingInfoStore.getCount()) {
			var title = meetingInfoStore.getAt(0).get('title');
			suggestionHead.setTitle(cutStr(title, "suggPanel"));
		}
	});
	
	//######################################################
	// Store für Infos zu einem Meeting
	// [
	//		'id','title','restricted','initiator_id',
	//		'initiator_name', 'participants_cnt'
	// ]
	//######################################################
	meetingInfoStore = new Ext.data.JsonStore({
		model: 'meeting'
	});
	
	meetingInfoStore.on('beforeload',function() {
		suggestionHead.setTitle(_loading);
		btnParticipants.setText(_participants);
		loadMeetingMask.show();
	});
	
	meetingInfoStore.on('datachanged',function() {
		//Restricted?
		suggestionPanel.restricted = meetingInfoStore.getAt(0).get('restricted')
									&& meetingInfoStore.getAt(0).get('initiator_id') != USER_ID;
		
		var title = meetingInfoStore.getAt(0).get('title');
		suggestionHead.setTitle(cutStr(title, "suggPanel"));
		
		//Anzahl Teilnehmer anzeigen
		btnParticipants.setText(_participants+" ("+meetingInfoStore.getAt(0).get('participants_cnt')+")");
	});
	
	meetingInfoStore.on('load',function(){
		if (!suggestionsStore.isLoading() && !commentsStore.isLoading())
			loadMeetingMask.hide();
	});
	
	//######################################################
	// Store für alle Suggestions eines Meetings
	// [
	//		'id','meeting_id','vote_id','date_raw','date'
	//		'start','end','picked','own_vote','votebar',
	//		'votes','destroyable','pickable'
	// ]
	//######################################################
	suggestionsStore = new Ext.data.JsonStore({
		model: 'suggestions',
	});
	
	//######################################################
	// SuggestionStore onLoad Handler
	// Fügt Suggestions hinzu
	//######################################################
	suggestionsStore.on('beforeload',function() {
		suggestionList.removeAll();
		suggestionList.setHeight(0);
		suggestionList.doComponentLayout();
		suggestionPanel.doComponentLayout();
		loadMeetingMask.show();
	});
	
	suggestionsStore.on('datachanged',function() {
		this.each(function(suggData) {
			var sugg = createSuggestionElement(suggData);
			suggestionList.add(sugg);
		});
		suggestionList.setHeight('auto');
		suggestionList.doComponentLayout();
		suggestionPanel.doComponentLayout();
	});
	
	suggestionsStore.on('load',function(){
		if (!meetingInfoStore.isLoading() && !commentsStore.isLoading())
			loadMeetingMask.hide();
	});
}

//######################################################
// Läd die MeetingInfos und Suggestions neu
//######################################################
function reloadMeetingInfo(meetingid, slide){
	proxy_meeting = new Ext.data.AjaxProxy({
		url: '/' + getUserkeyFromURL() + '/meetinginfos/' + meetingid,
		reader: {
			type: 'json'
		}
	});
	meetingInfoStore.setProxy(proxy_meeting);
	meetingInfoStore.load();
	
	proxy_suggs = new Ext.data.AjaxProxy({
		url: '/users/' + getUserkeyFromURL() + '/meetings/' + meetingid + '/suggestions',
		reader: {
			type: 'json'
		}
	});
	suggestionsStore.setProxy(proxy_suggs);
	suggestionsStore.load();
	
	proxy_participants = new Ext.data.AjaxProxy({
		url: '/users/' + getUserkeyFromURL() + '/meeting/' + meetingid + '/participants',
		reader: {
			type: 'json'
		}
	});
	participantsStore.setProxy(proxy_participants);
	participantsStore.load();
	
	proxy_comments = new Ext.data.AjaxProxy({
		url: '/users/' + getUserkeyFromURL() + '/meetings/' + meetingid + '/comments',
		reader: {
			type: 'json'
		}
	});
	commentsStore.setProxy(proxy_comments);
	commentsStore.load();
	
	if (slide) 
		basePanel.setActiveItem('suggestionPanel', meetingToSuggestion);
}