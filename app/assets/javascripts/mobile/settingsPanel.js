//######################################################
// Erstellt das SettingsPanel
// mit generellen Einstellungen
// und Einstellungen zu den E-Mail-Adressen
// und Account löschen
//######################################################
function createSettingsPanel() {
	
	//######################################################
	// Store mit UserInfos
	// ['name','freebusy_url','language']
	//######################################################
	userInfoStore = new Ext.data.Store({
		model: 'userinfos'
	});
	
	//######################################################
	// Store mit E-Mails
	// ['id','email','primary','confirmed']
	//######################################################
	userEmailsStore = new Ext.data.Store({
		model: 'useremails'
	});
	
	//######################################################
	// ActionSheet zum Bestätigen von Account Löschen
	//######################################################
	var settingsConfirmDeleteAccount = new Ext.ActionSheet({
		items: [
			{
				text: _delete_account,
				ui: 'decline',
				handler: settingsDeleteAccountHandler
			},{
				text: _cancel,
				handler: function() {
					settingsConfirmDeleteAccount.hide();
				}
			}
		]
	});
	
	//######################################################
	// ActionSheet zum Bestätigen von E-Mail löschen
	//######################################################
	var settingsConfirmDeleteEmail = new Ext.ActionSheet({
		items: [
			{
				text: _delete_email_address,
				ui: 'decline',
				handler: function() {
					settingsDeleteEmailHandler();
					settingsConfirmDeleteEmail.hide();
				}
			},{
				text: _cancel,
				handler: function() {
					settingsConfirmDeleteEmail.hide();
					Ext.getCmp('deleteEmail').setValue('choose');
				}
			}
		]
	});
	
	//######################################################
	// Button Einstellungen abbrechen
	// Liegt auf ToolBar des SettingsPanel
	//######################################################
	var btnCancelSettings = new Ext.Button({
		ui: 'plain',
		text: '',
		iconCls: 'delete',
		iconMask: true,
		handler: function(){
			basePanel.setActiveItem('meetingPanel', settingsToMeeting);
			if (!meetingsStore.first())
				meetingsStore.load();
		}
	});
	
	//######################################################
	// Button Einstellungen bestätigen
	// Liegt auf ToolBar des SettingsPanel
	//######################################################
	var btnConfirmSettings = new Ext.Button({
		ui: '',
		text: _ok,
		iconCls: '',
		iconMask: true,
		handler: settingsGlobalOkHandler
	});
	
	//######################################################
	// Toolbar für das SettingsPanel
	//######################################################
	var settingsHead = new Ext.Toolbar({
		dock: 'top',
		title: _settings,
		items: [
			btnConfirmSettings,
			{ xtype: 'spacer' },
			btnCancelSettings
			]
	});
	
	//######################################################
	// FieldSet Username
	//######################################################
	var settingsUserName = new Ext.form.FieldSet({
		title: _name_optional,
		instructions: _instr_username,
		items: [{
			xtype: 'textfield',
			name: 'username'
		}]
	});
	
	//######################################################
	// FieldSet Passwort
	//######################################################
	var settingsPassword = new Ext.form.FieldSet({
		title: _password_optional,
		instructions: _instr_password,
		items: [{
			xtype: 'textfield',
			inputType: 'password',
			name: 'password'
		}]
	});
	
	//######################################################
	// FieldSet Free-Busy-URL
	//######################################################
	var settingsFBURL = new Ext.form.FieldSet({
		title: _fb_url,
		instructions: _instr_fb_url,
		items: [{
			xtype: 'textfield',
			inputType: 'url',
			name: 'freebusy_url'
		}]
	});
	
	//######################################################
	// FieldSet Sprache
	//######################################################
	var settingsLanguage = new Ext.form.FieldSet({
		title: _language,
		items: [{
			xtype: 'selectfield',
			name: 'language',
			options: [
				{ text: 'deutsch', value: 'de' },
				{ text: 'english', value: 'en' },
				{ text: 'français', value: 'fr' }
			]
		}]
	});
	
	//######################################################
	// FieldSet Account löschen
	//######################################################
	var settingsDeleteAccount = new Ext.form.FieldSet({
		title: _delete_account,
		instructions: _instr_del_acc,
		items: [
			{
				xtype: 'button',
				ui: 'decline',
				text: _delete_account,
				handler: function() {
					settingsConfirmDeleteAccount.show();
				}
			}
		]
	});
	
	//######################################################
	// FieldSet E-Mail-Adressen
	// mit Hauptadresse wählen
	// und E-Mail-Adresse löschen
	// und E-Mail-Adresse hinzufügen
	//######################################################
	var settingsEmails = new Ext.form.FieldSet({
		title: _manage_email_addresses,
		instructions: _instr_manage_email,
		defaults: {
			labelAlign: 'top',
			labelWidth: '100%'
		},
		items: [
			{
				xtype: 'selectfield',
				name: 'primaryEmail', id: 'primaryEmail',
				label: _select_main_email,
				handler: settingsMainEmailHandler
			},{
				xtype: 'selectfield',
				name: 'deleteEmail', id: 'deleteEmail',
				label: _delete_email_address
			},{
				xtype: 'textfield',
				inputType: 'email',
				name: 'newEmail', id: 'newEmail',
				label: _activate_new_email,
				placeHolder: _new_email
			},{
				xtype: 'button',
				ui: 'confirm',
				text: _activate,
				handler: settingsActivateEmailHandler
			}
		]
	});
	
	//######################################################
	// SettingsPanel
	// umfasst alle obigen FieldSets
	//######################################################
	settingsPanel = new Ext.form.FormPanel({
		id: 'settingsPanel',
		fullscreen: true,
		scroll: 'vertical',
		layout: { type: 'vbox', align: 'stretch' },
		dockedItems: [settingsHead],
		items: [
			settingsUserName,
			settingsPassword,
			settingsFBURL,
			settingsLanguage,
			settingsEmails,
			settingsDeleteAccount
		]
	});
	
	//######################################################
	// UserInfoStore onLoad Handler
	// füllt die Input-Felder:
	// username, freebusyURL, language
	//######################################################
	userInfoStore.on('load',function(){
		var values = userInfoStore.getAt(0);
		settingsPanel.setValues({
			username: values.get('name'),
			freebusy_url: values.get('freebusy_url'),
			language: values.get('language')
		});
	},this);
	
	//######################################################
	// UserEmailsStore onLoad Handler
	// füllt die Selects für Hauptadresse und Löschen
	//######################################################
	userEmailsStore.on('load',function() {
		var primarySelect = Ext.getCmp('primaryEmail');
		var deleteSelect = Ext.getCmp('deleteEmail');
		
		// Beim ersten Schleifendurchlauf die Selects leeren
		primarySelect.setOptions(false,false);
		deleteSelect.setOptions([{ text: _choose, value: 'choose' }],false);
		deleteSelect.setValue('choose');
		
		userEmailsStore.each(function(values){
			// E-Mail anhängen, falls bestätigt
			if (values.get('confirmed'))
				primarySelect.setOptions([{
					text: values.get('email'),
					value: values.get('email')
				}],true);
				
			// Wählen falls Primary - falls nicht Primary, ist die Adresse löschbar
			if(values.get('primary'))
				primarySelect.setValue(values.get('email'));
			else
				deleteSelect.setOptions([{
					text: values.get('email')+((values.get('confirmed')) ? "" : "*"),
					value: values.get('id')
				}],true);
		});
	},this);
	
	//######################################################
	// DeleteEmail onChange Handler
	// zeigt das ActionSheet zum Bestätigen
	//######################################################
	Ext.getCmp('deleteEmail').on('change',function(){
		if (Ext.getCmp('deleteEmail').getValue() != 'choose')
			settingsConfirmDeleteEmail.show();
	},this);
}