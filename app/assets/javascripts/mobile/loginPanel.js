//######################################################
// Erstellt das LoginPanel,
// mit LoginFieldSet
// und ResgisterFieldSet
// und Über TeaCo
//######################################################
function createLoginPanel() {
	
	//######################################################
	// FieldSet zum Einloggen
	//######################################################
	var loginFieldSet = new Ext.form.FieldSet({
		title: _login,
		instructions: _instr_login,
		defaults: {
			labelWidth: '40%'
		},
		items: [
			{
				xtype: 'textfield',
				inputType: 'email',
				name: 'login_email',
				label: _email
			},{
				xtype: 'textfield',
				inputType: 'password',
				name: 'login_password',
				label: _password
			},{
				xtype: 'button',
				handler: loginHandler,
				text: _login
			}
		]
	});
	
	//######################################################
	// FieldSet zum Registrieren
	//######################################################
	var registerFieldSet = new Ext.form.FieldSet({
		title: _register,
		instructions: _instr_register,
		defaults: {
			labelWidth: '40%'
		},
		items: [
			{
				xtype: 'textfield',
				inputType: 'email',
				name: 'email',
				label: _email
			},{
				xtype: 'textfield',
				name: 'name',
				label: 'Name',
				placeHolder: _optional
			},{
				xtype: 'selectfield',
				name: 'language',
				label: _language,
				options: [
					{ text: 'deutsch', value: 'de' },
					{ text: 'english', value: 'en' },
					{ text: 'français', value: 'fr' }
				]
			},{
				xtype: 'button',
				handler: registerHandler,
				text: _create_account
			}
		]
	});
	
	//######################################################
	// SlidePanel (orange)
	//######################################################
	var slidePanel = new Ext.Panel({
		cls : 'slide-panel',
		html: '<h1>'+_eyecatcher_line_1+'</h1><h2>'+_eyecatcher_line_2+'</h2><p>'+_eyecatcher_line_3+'</p>',
		hidden: true
	});
	
	//######################################################
	// LoginPanel + Kopfzeile
	//######################################################
	var loginHead = new Ext.Toolbar({
		dock: 'top',
		title: '<img src="/images/mobile/teaco.png" style="height:40px;margin-top:5px;" />',
		items: [
			{
				xtype: 'spacer'
			},{
				xtype: 'button',
				ui: 'plain',
				text: '',
				iconCls: 'Info',
				iconMask: true,
				handler: function(){
					if (slidePanel.isHidden())
						slidePanel.show({ type: 'slide', direction: 'down' })
					else
						slidePanel.hide({ type: 'slide', direction: 'down' })
				}
			}
		]
	});
	
	loginPanel = new Ext.form.FormPanel({
		fullscreen: true,
		scroll: 'vertical',
		layout: { type: 'vbox', align: 'stretch', pack: 'top' },
		dockedItems: [loginHead],
		items: [
			slidePanel,
			loginFieldSet,
			registerFieldSet
		]
	});
}