//######################################################
// Erstellt das Panel für Nachrichten
//######################################################
function createMessagePanel() {
	//######################################################
	// Nachricht schreiben Panel - Kopfzeile
	//######################################################
	var messageHead = new Ext.Toolbar({
		dock: 'top',
		title: _message,
		items: [
				{
					xtype: 'button',
					ui: 'plain',
					iconCls: 'arrow_left',
					iconMask: true,
					handler: function(){
						basePanel.setActiveItem('participantsPanel', messageToParticipants);
					}
				}
			]
	});
	
	//######################################################
	// Nachricht schreiben Panel
	//######################################################
	messagePanel = new Ext.form.FormPanel({
		id: 'messagePanel',
		fullscreen: true,
		layout: {
			type: 'vbox',
			align: 'stretch',
			pack: 'justify'
		},
		dockedItems: [messageHead],
		items: [
			{
				xtype: 'fieldset',
				items: [{
					xtype: 'textareafield',
					id: 'writeMessageText',
					label: _message,
					labelAlign: 'top',
					labelWidth: '100%'
				}]
			},{
				xtype: 'button',
				id: 'writeMessageSubmit',
				text: _send_message,
				handler: function() {
					this.setDisabled(true);
					writeMessageFkt();
				}
			}
		]
	});
}

//######################################################
// Schreibt Nachricht an ausgewählte Teilnehmer
//######################################################
function writeMessageFkt() {
	receiversArr = new Array();
	//hier alle manageParticipantsList-Elemente durchgehen und eventl ins receiversArr adden
	manageParticipantsListArr = manageParticipantsList.getNodes();
	var cnt = 0;
	for (var i = 0; i < manageParticipantsListArr.length; i++) {
		var el = Ext.get(manageParticipantsListArr[i]);
		if (el.hasCls("invited")) {
			receiversArr[cnt++] = Ext.get(el.id).child('div.x-list-item-body div.pListName').getAttribute('rel');
		}
	}
	writeMessageHandler(meetingInfoStore.getAt(0).get('id'), receiversArr);
}