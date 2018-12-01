//######################################################
// Erstellt das Panel für Teilnehmer
//######################################################
function createParticipantsPanel() {
	
	//######################################################
	// Store mit Teilnehmern
	// ['id','user_id','address','display_name','isInitiator']
	//######################################################
	participantsStore = new Ext.data.JsonStore ({
		model: 'participants'
	});
	
	//######################################################
	// TeilnehmerListe - Kopfzeile
	//######################################################
	var participantsHead = new Ext.Toolbar({
		dock: 'top',
		items: [
			{
				text: _new_participants,
				handler: function() {
					basePanel.setActiveItem('invitePanel', participantsToInvite);
					
					var old_proxy = knownAddressesStore.getProxy();
					proxy_known_addresses = new Ext.data.AjaxProxy({
						url: '/users/'+getUserkeyFromURL()+'/known_addresses?meeting_id='+meetingInfoStore.getAt(0).get('id'),
						reader: {
							type: 'json'
						}
					});
					knownAddressesStore.setProxy(proxy_known_addresses);
					knownAddressesStore.load();
				}
			},{
				xtype: 'spacer'
			},{
				ui: 'plain',
				text: '',
				iconCls: 'delete',
				iconMask: true,
				handler: function() {
					basePanel.setActiveItem('suggestionPanel', participantsToSuggestion);
				}
			}
		]
	});
	
	//######################################################
	// TeilnehmerListe - Fusszeile
	//######################################################
	var participantsFoot = new Ext.Toolbar({
		dock: 'bottom',
		items: [
			{
				text: _send_message,
				id: 'sendMessages',
				disabled: true,
				handler: function() {
					basePanel.setActiveItem('messagePanel', participantsToMessage);
				}
			},
			{ xtype: 'spacer' },
			{
				text: _uninvite,
				id: 'uninviteParticipants',
				disabled: true,
				handler: function() {
					this.setDisabled(true);
					uninviteParticipants();
				}
			}
		]
	});
	
	//######################################################
	// TeilnehmerListe - ItemTemplate
	// DisplayName (Name, falls vorhanden, sonst Email)
	// Checkbox (un-)check, initiator?, me?
	//######################################################
	var participantsTpl = new Ext.XTemplate (
		'<div class="pListName" rel="{id}">{display_name}</div>',
		'<tpl if="id != user_id && isInitiator"><div class="x-button x-button-small pListBtn initiator"></div></tpl>',
		'<tpl if="id != user_id && !isInitiator"><div class="x-button x-button-small pListBtn"></div></tpl>',
		'<tpl if="id == user_id && isInitiator"><div class="x-button x-button-small pListBtn me initiator"></div></tpl>',
		'<tpl if="id == user_id && !isInitiator"><div class="x-button x-button-small pListBtn me"></div></tpl>'
	);
	
	//######################################################
	// TeilnehmerListe
	//######################################################
	participantsList = new Ext.List({
		disableSelection: true,
		height: '100%',
		id: 'participantsList',
		scroll: 'vertical',
		itemTpl: participantsTpl,
		store: participantsStore,
		loadingText: _load_participants
	});
	
	//######################################################
	// TeilnehmerListe onItemTap Handler
	// Makiert Item (Teilnehmer),
	// (De-)Aktiviert Buttons Nachricht senden und ausladen
	//######################################################
	participantsList.on('itemTap',function(data,index,item,e){
		var el = Ext.get(item),
			triggerCls = 'invited',
			hasClass = el.hasCls(triggerCls);
			
		if (hasClass)
			el.removeCls(triggerCls);
		else {
			el.addCls(triggerCls);
		}
		
		participantsListArr = participantsList.getNodes();
		var cnt_checked = 0;
		var cnt_notInitiatorNotMe = 0;
		for (var i = 0; i < participantsListArr.length; i++) {
			var el = Ext.get(participantsListArr[i]);
			if (el.hasCls("invited")) {
				if (!Ext.get(el.id).child('div.x-list-item-body div.me')) {
					cnt_checked++;
					if (!Ext.get(el.id).child('div.x-list-item-body div.initiator'))
						cnt_notInitiatorNotMe++;
				}
			}
		}
		
		if (cnt_checked > 0) 
			Ext.getCmp("sendMessages").setDisabled(false);
		else
			Ext.getCmp("sendMessages").setDisabled(true);
		
		if (cnt_notInitiatorNotMe > 0)
			Ext.getCmp("uninviteParticipants").setDisabled(false);
		else
			Ext.getCmp("uninviteParticipants").setDisabled(true);
	},this);
	
	//######################################################
	// Teilnehmer verwalten Panel
	//######################################################
	participantsPanel = new Ext.Panel({
		id: 'participantsPanel',
		fullscreen: true,
		layout: {
			type: 'vbox',
			align: 'stretch',
			pack: 'justify'
		},
		dockedItems: [participantsHead,participantsFoot],
		items: [participantsList]
	});
};

//######################################################
// Läd Teilnehmer aus
//######################################################
function uninviteParticipants() {
	participantsArr = new Array();
	//hier alle manageParticipantsList-Elemente durchgehen und eventl ins participantsArr adden
	participantsListArr = participantsList.getNodes();
	var cnt = 0;
	for (var i = 0; i < participantsListArr.length; i++) {
		var el = Ext.get(participantsListArr[i]);
		if (el.hasCls("invited")) {
			participantsArr[cnt++] = Ext.get(el.id).child('div.x-list-item-body div.pListName').getAttribute('rel');
		}
	}
	uninviteParticipantsHandler(meetingInfoStore.getAt(0).get('id'), participantsArr);
}