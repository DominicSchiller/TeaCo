//######################################################
// Erstellt das Panel für Einladungen
//######################################################
function createInvitePanel() {
	
	//######################################################
	// Store mit bekannten Adressen
	// ohne bereits eingeladene Teilnehmer
	// ['name','address']
	//######################################################
	knownAddressesStore = new Ext.data.Store ({
		model: 'known_addresses'
	});
	
	//######################################################
	// Neue Adresse hinzufügen, Popup
	//######################################################
	var addKnownAdressPopup = new Ext.form.FormPanel({
		id: 'addKnownAdressPanel',
		floating: true,
		centered: true,
		modal: true,
		width: '90%', height: '90%',
		dockedItems: [{
			xtype: 'toolbar',
			title: _new_address,
			dock: 'top',
			items: [
				{ xtype: 'spacer' },
				{
					xtype: 'button',
					ui: 'plain',
					iconCls: 'delete',
					iconMask: true,
					handler: function(){
						addKnownAdressPopup.hide('pop');
					}
				}
			]
		}],
		items: [
			{
				xtype: 'fieldset',
				instructions: _add_address_instr,
				items: [{
					xtype: 'textfield',
					inputType: 'email',
					name: 'add_known_adress',
					id: 'add_known_adress',
					label: _add_email_address,
					labelAlign: 'top',
					labelWidth: '100%'
				}]
			},{
				xtype: 'button',
				text: 'Hinzufügen',
				iconMask: true,
				handler: function(btn, e){
					var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
					var address = Ext.getCmp('add_known_adress').getValue();
					if(reg.test(address) == false) {
						addKnownAdressPopup.items.get(0).setInstructions('<span style="color: #FF0000">'+_invalid_email+'</span>');
						return false;
					}
					
					var indexesOfChecked = getIndexOfCheckedParticipants();
					var record = Ext.ModelMgr.create({
						name: '',
						address: Ext.getCmp('add_known_adress').getValue()
					}, 'known_addresses');
					knownAddressesStore.insert(0, record);
					inviteList.fireEvent('itemtap', inviteList, 0, inviteList.getNode(0), e);
					for (var i = 0; i < indexesOfChecked.length; i++)
						inviteList.fireEvent('itemtap', inviteList, indexesOfChecked[i]+1, inviteList.getNode(indexesOfChecked[i]+1), e);
						
					addKnownAdressPopup.hide('pop');
				}
			}
		]
	});
	
	//Zum entfernen der zuvor eingetragenen Daten
	addKnownAdressPopup.on('hide',function(){
		this.reset();
	});
	
	//######################################################
	// Teilnehmer einladen Panel - Kopfzeile
	//######################################################
	var inviteHead = new Ext.Toolbar({
		dock: 'top',
		items: [
			{
				ui: 'plain',
				text: '',
				iconCls: 'arrow_left',
				iconMask: true,
				handler: function() {
					basePanel.setActiveItem('participantsPanel', inviteToParticipants);
				}
			},
			{ xtype: 'spacer' },
			{
				text: _new,
				id: 'addKnown',
				handler: function() {
					addKnownAdressPopup.show('pop');
				}
			},{
				text: _invite,
				id: 'inviteParticipants',
				disabled: true,
				handler: inviteParticipants
			}
		]
	});
	
	//######################################################
	// Bekannte Adressen Liste - ItemTemplate
	// Name (Adresse) bzw. nur Adresse
	// Checkbox (un-)check
	//######################################################
	var inviteTpl = new Ext.XTemplate (
		'<tpl if="name"><div class="pListName" rel="{address}">{name} ({address})</div></tpl>',
		'<tpl if="!name"><div class="pListName" rel="{address}">{address}</div></tpl>',
		'<div class="x-button x-button-small pListBtn"></div>'
	);
	
	//######################################################
	// Teilnehmer einladen Panel - Liste
	//######################################################
	inviteList = new Ext.List({
		disableSelection: true,
		height: '100%',
		id: 'inviteList',
		scroll: 'vertical',
		itemTpl: inviteTpl,
		store: knownAddressesStore,
		loadingText: _load_known_addresses
	});
	
	//######################################################
	// Teilnehmer einladen Panel
	//######################################################
	invitePanel = new Ext.Panel({
		id: 'invitePanel',
		fullscreen: true,
		layout: {
			type: 'vbox',
			align: 'stretch',
			pack: 'start'
		},
		dockedItems: [inviteHead],
		items: [inviteList]
	});
	
	//######################################################
	// Popup für Message - Kopfzeile
	//######################################################
	var inviteParticipantsHead = new Ext.Toolbar({
		dock: 'top',
		title: _message,
		items: [
				{ xtype: 'spacer' },
				{
					xtype: 'button',
					ui: 'plain',
					iconCls: 'delete',
					iconMask: true,
					handler: function(){
						popupInviteParticipants.hide('pop');
					}
				}
			]
	});
	
	//######################################################
	// Popup für Message - FieldSet
	// umfasst Nachricht und Checkbox
	//######################################################
	var inviteParticipantsFieldSet = new Ext.form.FieldSet({
		items: [
			{
				xtype: 'textareafield',
				name: 'message'
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
	// Popup für Neues Meeting - Panel
	// umfasst FieldSet und Confirm-Button
	//######################################################
	popupInviteParticipants = new Ext.form.FormPanel({
		floating: true,
		centered: true,
		modal: true,
		width: '90%',
		dockedItems: [inviteParticipantsHead],
		items: [
			inviteParticipantsFieldSet,
			{
				xtype: 'button',
				name: 'createMeeting',
				text: _invite_participant,
				handler: function() {
					inviteParticipantsHandler(meetingInfoStore.getAt(0).get('id'), getCheckedParticipants());
				}
			}
		]
	});
	
	//Zum entfernen der zuvor eingetragenen Daten
	popupInviteParticipants.on('hide',function(){
		this.reset();
	});
	
	//######################################################
	// Bekannte Adressen Liste onItemTap Handler
	// Markiert Item (Teilnehmer),
	//######################################################
	inviteList.on('itemTap',function(data,index,item,e){
		var el = Ext.get(item),
			triggerCls = 'invited',
			hasClass = el.hasCls(triggerCls);
			
		if (hasClass)
			el.removeCls(triggerCls);
		else {
			el.addCls(triggerCls);
		}
		
		inviteListArr = inviteList.getNodes();
		var cnt_checked = 0;
		for (var i = 0; i < inviteListArr.length; i++) {
			var el = Ext.get(inviteListArr[i]);
			if (el.hasCls("invited"))
				cnt_checked++;
		}
		
		var btn = Ext.getCmp("inviteParticipants");
		if (cnt_checked > 0) {
			btn.setDisabled(false);
			btn.setText(_invite+' ('+cnt_checked+')');
		} else {
			btn.setDisabled(true);
			btn.setText(_invite);
		}
		
	},this);
}

//######################################################
// Teilnehmer einladen
// ruft ein ActionSheet zum Bestätigen auf
// aus dem ActionSheet wird der Handler aufgerufen
//######################################################
function inviteParticipants() {
	confirmInviteParticipants = new Ext.ActionSheet({
		items: [
			{
				text: _add_text,
				ui: 'confirm',
				handler: function() {
					confirmInviteParticipants.hide();
					confirmInviteParticipants.on('hide',function(){
						popupInviteParticipants.show();
					});
				}
			},{
				text: _invite_without_text,
				ui: 'confirm',
				handler: function() {
					confirmInviteParticipants.disable();
					inviteParticipantsHandler(meetingInfoStore.getAt(0).get('id'), getCheckedParticipants());
				}
			},{
				text: _cancel,
				handler: function() {
					confirmInviteParticipants.hide();
				}
			}
		]
	});
	confirmInviteParticipants.show();
	confirmInviteParticipants.on('hide',function(){
		this.destroy();
	});	
}

//######################################################
// Gibt die angeklickten Teilnehmer kommagetrennt zurück
//######################################################
function getCheckedParticipants() {
	participantsStr = "";
	//hier alle manageParticipantsList-Elemente durchgehen und eventl ins participantsArr adden
	inviteListArr = inviteList.getNodes();
	for (var i = 0; i < inviteListArr.length; i++) {
		var el = Ext.get(inviteListArr[i]);
		if (el.hasCls("invited")) {
			participantsStr += (participantsStr == "") ? "" : ", ";
			participantsStr += Ext.get(el.id).child('div.x-list-item-body div.pListName').getAttribute('rel');
		}
	}
	return participantsStr;
}

//######################################################
// Gibt die indexe der angeklickten Teilnehmer zurück
//######################################################
function getIndexOfCheckedParticipants() {
	participantsArr = new Array();
	inviteListArr = inviteList.getNodes();
	var cnt = 0;
	for (var i = 0; i < inviteListArr.length; i++) {
		var el = Ext.get(inviteListArr[i]);
		if (el.hasCls("invited"))
			participantsArr[cnt++] = inviteList.indexOf(inviteListArr[i]);
	}
	return participantsArr;
}