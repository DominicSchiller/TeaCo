//######################################################
// Erstellt das MeetingPanel
// Umfasst neben der Toolbar eine MeetingListe
//######################################################
function createMeetingPanel() {
	
	//######################################################
	// Store mit Meetings, lädt automatisch
	// [
	//		'id','title','state','restricted'
	//		'initiator_id','updated_at'
	//		'updated_at_in_words'
	// ]
	//######################################################
	meetingsStore = new Ext.data.Store({
		model: 'meetings',
		sorters: [
			{
		        property: 'state',
		        direction: 'ASC'
		    },
		    {
		        property: 'updated_at',
		        direction: 'DESC'
		    }
		],
		getGroupString: function(record) {
			return meetingStates[record.get('state')];
		}
	});

	//######################################################
	// Template für MeetingListItems
	// (Restricted?) Titel, Letzte Änderung
	// versteckte Buttons Klonen, Titel ändern, löschen
	// Pfeil nacht rechts (nur Design)
	//######################################################
	var tpl = new Ext.XTemplate(
		'<div class="meetingListItemTop">',
			'<img class="initiator {initiator}" src="/images/mobile/initiator.png">',
			'<img class="restricted {restricted}" src="/images/mobile/restricted.png">',
			'<span>{[cutStr(values.title, this.getLocation())]}</span>',
		'</div><br />',
		'<div class="meetingListItemBottom">',
			'vor {updated_at_in_words}',
		'</div>',
		'<div class="x-button x-button-plain x-button-small t-button-arrow_right"></div>',
		'<div class="x-button x-button-confirm x-button-small t-button-clone"></div>',
		'<tpl if="restricted == &quot;false&quot; || initiator == &quot;true&quot;"><div class="x-button x-button-normal x-button-small t-button-title"></div></tpl>',
		'<tpl if="initiator == &quot;true&quot;"><div class="x-button x-button-decline x-button-small t-button-delete">'+_delete+'</div></tpl>',
		'<tpl if="initiator == &quot;false&quot;"><div class="x-button x-button-decline x-button-small t-button-leave">'+_leave+'</div></tpl>',
		{
			getLocation: function() {
				if (meetingList)
					if (meetingsList.getEl().hasCls('show-edit-buttons'))
						return "meetingListWithButtons";
					else
						return "meetingList";
			}
		}
	);
	
	//######################################################
	// MeetingList mit allen Meetings
	//######################################################
	meetingsList = new Ext.List({
		grouped: true,
		pinHeaders: true,
		disableSelection: true,
		id: 'meetingList',
		scroll: 'vertical',
		itemTpl: tpl,
		store: meetingsStore,
		singleSelect: true,
		monitorOrientation: true,
		loadingText: null,
		plugins: [new Ext.ux.touch.ListPullRefresh({
			listeners: {
		    	'released': function(plugin,list){
		        	// call the plugins processComplete method to hide the 'loading' indicator
		            meetingsStore.on('load',plugin.processComplete,plugin,{single:true});
					// mask auschalten und später einschalten
		            // do whatever needs to happen for reload
		            meetingsStore.load();
		         }
		    }
			})
		]
	});
	
	meetingsList.on('orientationchange',function(){
		meetingsList.refresh();
	},this);

	
	//######################################################
	// MeetingList onItemSwipe Handler
	// Blendet Button zum Meetinglöschen ein/aus
	//######################################################
	meetingsList.on('itemSwipe',function(data,index,item,e){
		var el = Ext.get(item);
		var triggerCls = 'show-delete-button';
		var hasClass = el.hasCls(triggerCls);
		var node = data.getNode(index);
		var record = data.getRecord(node);
		var title = record.get("title");
		
		// Alle Delete Buttons entfernen
		// und den Originaltitel wiederherstellen
		var editButtons = (meetingsList.getEl().hasCls('show-edit-buttons')) ? "meetingListWithButtons" : "meetingList";
		Ext.select('div.show-delete-button').each(function(c){
			c.removeCls('show-delete-button');
			elHTML = c.first().child("div.meetingListItemTop span");
			var oldTitle = elHTML.getAttribute("value");
			elHTML.setHTML(cutStr(oldTitle, editButtons));
		});
		
		if (!hasClass) {
			el.addCls(triggerCls);
			elHTML = el.first().child("div.meetingListItemTop span");
			elHTML.set({value: title});
			elHTML.setHTML(cutStr(title, "meetingListShowDeleteButton"));
		}
	},this);
	
	//######################################################
	// MeetingList onItemTap Handler
	// Verarbeitet Tap auf ein Item je nach Tap-Target
	// Fälle siehe Methode
	//######################################################
	meetingsList.on('itemtap', function(data,index,item,e) {
		var node = data.getNode(index);
		var record = data.getRecord(node);
			
		// falls auf löschen gedrückt
		if (e.getTarget('.show-delete-button div.t-button-delete')) {
			deleteMeeting(record.get('id'));
		// falls auf verlassen gedrückt
		} else if (e.getTarget('.show-delete-button div.t-button-leave')) {
			leaveMeeting(record.get('id'));
		// falls auf Clone gedrückt
		} else if (e.getTarget('.show-edit-buttons div.t-button-clone')) {
			cloneMeeting(record.get('id'), record.get('title'), record.get('restricted'));
		// falls auf Title gedrückt
		} else if (e.getTarget('.show-edit-buttons div.t-button-title')) {
			changeMeetingTitle(record.get('id'), record.get('title'));
		// oder falls Delete sichtbar aber nicht gedrückt oder aber edits aktiv
		} else if (Ext.get(item).hasCls('show-delete-button') || meetingsList.getEl().hasCls('show-edit-buttons')) {
			Ext.get(item).removeCls('show-delete-button');
			hideAllDeleteButtons();
		// oder falls Delete unsichtbar
		} else {
			reloadMeetingInfo(record.get('id'), true);
		}
	}, this);
	
	//######################################################
	// Popup für Neues Meeting - Kopfzeile
	//######################################################
	var popupNewMeetingHead = new Ext.Toolbar({
		dock: 'top',
		title: _new_meeting,
		items: [
				{ xtype: 'spacer' },
				{
					xtype: 'button',
					ui: 'plain',
					iconCls: 'delete',
					iconMask: true,
					handler: function(){
						popupNewMeeting.hide('pop');
					}
				}
			]
	});

	//######################################################
	// Popup für Neues Meeting - FieldSet
	// umfasst Titel und Restricted
	//######################################################
	var newMeetingFieldSet = new Ext.form.FieldSet({
		instructions: _instr_new_meeting,
		items: [
			{
				xtype: 'textfield',
				name: 'meetingTitle',
				id: 'meetingTitle',
				label: _title,
				maxLength: 60
			},
			{
				xtype: 'checkboxfield',
				name: 'isRestricted',
				label: _restricted,
				labelWidth: '100%',
				checked: false,
				value: '1'
			}
		]
	});

	//######################################################
	// Popup für Neues Meeting - Panel
	// umfasst FieldSet und Confirm-Button
	//######################################################
	popupNewMeeting = new Ext.form.FormPanel({
		floating: true,
		centered: true,
		modal: true,
		width: '90%',
		dockedItems: [popupNewMeetingHead],
		items: [
			newMeetingFieldSet,
			{
				xtype: 'button',
				name: 'createMeeting',
				text: _create_meeting,
				handler: meetingsNewMeetingHandler
			}
		]
	});
	
	//Zum entfernen der zuvor eingetragenen Daten
	popupNewMeeting.on('hide',function(){
		this.reset();
	});
	
	//######################################################
	// Button in Toolbar je nach "Bearbeiten-Status",
	// entweder Settings oder Neues Meeting
	//######################################################
	var btnSettingsOrEdit = new Ext.Button({
		ui: 'plain',
		text: '',
		iconCls: 'settings',
		iconMask: true,
		handler: function() {
			if (this.iconCls == 'settings') {
				
				//Userinfos in die Settings laden
				userInfoStore.load();
				
				//Useremails in die Settings laden
				userEmailsStore.load();
				
				basePanel.setActiveItem('settingsPanel', meetingToSettings);
			} else {
				popupNewMeeting.show('pop');
				btnEditMeetings.setText(_edit);
				this.setIconClass('settings');
				meetingsList.removeCls('show-edit-buttons');
				hideAllDeleteButtons();
			}
		}
	});
	
	//######################################################
	// Bearbeiten-Button in Toolbar, toggelt:
	// - btnSettingsOrEdit-Button
	// - Edit-Icons der MeetingList-Items
	// - eigene Beschriftung
	//######################################################
	var btnEditMeetings = new Ext.Button({
		ui: '',
		text: _edit,
		width: 90,
		handler: function(){
			if(this.text == _edit) {
				this.setText(_done);
				btnSettingsOrEdit.setIconClass('add');
				meetingsList.addCls('show-edit-buttons');
				hideAllDeleteButtons();
				meetingsList.refresh();
			} else {
				this.setText(_edit);
				btnSettingsOrEdit.setIconClass('settings');
				meetingsList.removeCls('show-edit-buttons');
				hideAllDeleteButtons();
				meetingsList.refresh();
			}
		}
	});
	
	//######################################################
	// Kopfzeile des MeetingPanels,
	// mit Bearbeiten-Button
	// und Button Settings oder Neues Meeting
	//######################################################
	var meetingHead = new Ext.Toolbar({
		dock: 'top',
		title: 'Meetings',
		items: [
			btnEditMeetings,
			{ xtype: 'spacer' },
			btnSettingsOrEdit
			]
	});
	
	//######################################################
	// MeetingPanel
	//######################################################
	meetingPanel = new Ext.Panel({
		id: 'meetingPanel',
		fullscreen: true,
		dockedItems: [meetingHead],
		items: [meetingsList],
		layout: 'fit'
	});
	
	//######################################################
	// MeetingPanel onHide Handler
	// blendet alle Delete-Buttons aus
	//######################################################
	meetingPanel.on('hide',function(){
		hideAllDeleteButtons();
	},this);
}

//######################################################
// Meeting löschen
// ruft ein ActionSheet zum Bestätigen auf
// aus dem ActionSheet wird der Handler aufgerufen
//######################################################
function deleteMeeting(id) {
	confirmDeleteMeeting = new Ext.ActionSheet({
		items: [
			{
				text: _delete_meeting,
				ui: 'decline',
				id: 'deleteMeeting',
				handler: function() {
					this.setDisabled(true);
					meetingDeleteMeetingHandler(id);
				}
			},{
				text: _cancel,
				handler: function() {
					confirmDeleteMeeting.hide();
					hideAllDeleteButtons();
				}
			}
		]
	});
	confirmDeleteMeeting.show();
	
	confirmDeleteMeeting.on('hide',function(){
		this.destroy();
	});
}

//######################################################
// Meeting verlassen
// ruft ein ActionSheet zum Bestätigen auf
// aus dem ActionSheet wird der Handler aufgerufen
//######################################################
function leaveMeeting(id) {
	confirmLeaveMeeting = new Ext.ActionSheet({
		items: [
			{
				text: _leave_meeting,
				ui: 'decline',
				id: 'leaveMeeting',
				handler: function() {
					this.setDisabled(true);
					meetingLeaveMeetingHandler(id);
				}
			},{
				text: _cancel,
				handler: function() {
					confirmLeaveMeeting.hide();
					hideAllDeleteButtons();
				}
			}
		]
	});
	confirmLeaveMeeting.show();
	
	confirmLeaveMeeting.on('hide',function(){
		this.destroy();
	});
}

//######################################################
// Meeting klonen
// ruft ein ActionSheet zum Bestätigen auf
// aus dem ActionSheet wird der Handler aufgerufen
//######################################################
function cloneMeeting(id, title, restricted) {
	var popupCloneMeetingHead = new Ext.Toolbar({
		dock: 'top',
		title: _clone_meeting,
		items: [
				{ xtype: 'spacer' },
				{
					xtype: 'button',
					ui: 'plain',
					iconCls: 'delete',
					iconMask: true,
					handler: function(){
						popupCloneMeeting.hide('pop');
					}
				}
			]
	});
	
	var cloneMeetingFieldSet = new Ext.form.FieldSet({
		instructions: _instr_new_meeting,
		items: [
			{
				xtype: 'textfield',
				name: 'cloneMeetingTitle',
				value: title,
				maxLength: 60
			},
			{
				xtype: 'checkboxfield',
				name: 'isRestricted',
				label: _restricted,
				labelWidth: '100%',
				checked: restricted,
				value: '1'
			}
		]
	});

	popupCloneMeeting = new Ext.form.FormPanel({
		floating: true,
		centered: true,
		modal: true,
		width: '90%',
		dockedItems: [popupCloneMeetingHead],
		items: [
			cloneMeetingFieldSet,
			{
				xtype: 'button',
				id: 'cloneMeetingSubmit',
				text: _clone_meeting,
				handler: function() {
					this.setDisabled(true);
					meetingCloneMeetingHandler(id);
				}
			}
		]
	});
	popupCloneMeeting.show('pop');
	
	popupCloneMeeting.on('hide',function(){
		this.destroy();
	});

}

//######################################################
// Meeting-Titel Bearbeiten
// ruft ein Popup zur Eingabe auf
// aus dem Popup wird der Handler aufgerufen
//######################################################
function changeMeetingTitle(id, title) {
	var popupChangeMeetingTitleHead = new Ext.Toolbar({
		dock: 'top',
		title: _change_title,
		items: [
				{ xtype: 'spacer' },
				{
					xtype: 'button',
					ui: 'plain',
					iconCls: 'delete',
					iconMask: true,
					handler: function(){
						popupChangeMeetingTitle.hide('pop');
					}
				}
			]
	});
	
	popupChangeMeetingTitle = new Ext.form.FormPanel({
		floating: true,
		centered: true,
		modal: true,
		width: '90%',
		dockedItems: [popupChangeMeetingTitleHead],
		items: [
			{
				xtype: 'fieldset',
				items: [{
						xtype: 'textfield',
						name: 'changeMeetingTitle',
						id: 'changeMeetingTitle',
						value: title,
						maxLength: 60
				}]
			},{
				xtype: 'button',
				name: 'changeMeetingTitle',
				text: _change_title,
				handler: function() {
					meetingChangeTitleHandler(id);
				}
			}
		]
	});
	popupChangeMeetingTitle.show('pop');
	
	popupChangeMeetingTitle.on('hide',function(){
		this.destroy();
	});
}

//######################################################
// Blendet alle DeleteButtons auf Items aus
//######################################################
function hideAllDeleteButtons() {
	Ext.select('div.show-delete-button').removeCls('show-delete-button');
}