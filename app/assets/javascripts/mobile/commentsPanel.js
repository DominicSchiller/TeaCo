//######################################################
// Erstellt das Kommentare-Feld, welches in das
// suggestionPanel eingetragen wird 
//######################################################
function createCommentsPanel(){
	
	//######################################################
	// Kommentare - Kopfzeile
	//######################################################
	var commentsHead = new Ext.Toolbar({
		style: 'font-size:11px;',
		title: _head_title
	});
	
	//######################################################
	// Kommentare-Feld
	//######################################################
	commentsPanel = new Ext.Panel({
		id: 'commentsPanel',
		autoHeight: true,
		dockedItems: [commentsHead]
	});
	
	//######################################################
	// Store für alle Kommentare eines Meetings
	// [
	//		'id','meeting_id','vote_id','date_raw','date'
	//		'start','end','picked','own_vote','votebar',
	//		'votes','destroyable','pickable'
	// ]
	//######################################################
	commentsStore = new Ext.data.JsonStore({
		model: 'comments'
	});
	
	//######################################################
	// commentsStore onLoad Handler
	// Fügt Kommentare hinzu
	//######################################################
	commentsStore.on('beforeload',function() {
		commentsPanel.removeAll();
		commentsPanel.setHeight(0);
		commentsPanel.doComponentLayout();
		suggestionPanel.doComponentLayout();
		commentsPanel.update('');
		loadMeetingMask.show();
	});
	
	commentsStore.on('datachanged',function() {
		if (this.getCount() == 0)
			commentsPanel.update(_no_comments);
		else
			this.each(function(commentData) {
				var comment = createComment(commentData);
				commentsPanel.add(comment);
			});

		//Höhe anpassen, damit genau alle Kommentare sichtbar sind
		commentsPanel.setHeight('auto');
		commentsPanel.doComponentLayout();
		suggestionPanel.doComponentLayout();
	});
	
	commentsStore.on('load',function(){
		if (!meetingInfoStore.isLoading() && !suggestionsStore.isLoading())
			loadMeetingMask.hide();
	});
}

//######################################################
// Erstellt einen Kommentar-Eintrag
//######################################################
function createComment(commentData){
	
	//######################################################
	// Headline, mit Autor (ggf. Buttons)
	//######################################################
	var headline = new Ext.Panel({
		layout: {
			type: 'hbox',
			align: 'stretch',
			pack: 'justify'
		},
		items: [
			{ xtype: 'panel', html:'<div class="autor">'+cutStr(commentData.get('author'),25)+'</div>' },
			{ xtype: 'spacer' }
		]
	});
	
	//######################################################
	// Falls editable, Buttons adden
	//######################################################
	if (commentData.get('manipulable')) {
		headline.add(new Ext.Button({
			cls: 'editComment',
			ui: 'plain',
			handler: function() {
				editComment(commentData.get('id'), commentData.get('text'));
			}
		}));
		headline.add(new Ext.Button({
			cls: 'deleteComment',
			ui: 'plain',
			handler: function() {
				deleteComment(commentData.get('id'));
			}
		}));
	}
	
	//######################################################
	// Panel mit Kommentart-Text
	//######################################################
	var body = new Ext.Panel({
		html:'<div class="body">'+commentData.get('text_formatted')+'</div>'
	});
	
	//######################################################
	// Panel mit Headline (Autor, Buttons)
	// und Body (Text)
	//######################################################
	var comment = new Ext.Panel({
		layout: {
			type: 'vbox',
			pack: 'start',
			align: 'stretch'
		},
		items: [
			headline,
			body
		],
		style: 'padding:5px;border-bottom:1px solid #999;'
	});
	
	return comment;
}

//######################################################
// Kommentar löschen
// ruft ein ActionSheet zum Bestätigen auf
// aus dem ActionSheet wird der Handler aufgerufen
//######################################################
function deleteComment(commentid) {
	confirmDeleteComment = new Ext.ActionSheet({
		items: [
			{
				text: _delete_comment,
				ui: 'decline',
				id: 'deleteComment',
				handler: function() {
					this.setDisabled(true);
					deleteCommentHandler(meetingInfoStore.getAt(0).get('id'), commentid);
				}
			},{
				text: _cancel,
				handler: function() {
					confirmDeleteComment.hide();
				}
			}
		]
	});
	confirmDeleteComment.show();
	
	confirmDeleteComment.on('hide',function(){
		this.destroy();
	});
}

//######################################################
// Kommentar bearbeiten
// ruft ein Popup zur Eingabe auf
// aus dem Popup wird der Handler aufgerufen
//######################################################
function editComment(commentid, text) {
	var popupEditCommentHead = new Ext.Toolbar({
		dock: 'top',
		title: _edit,
		items: [
				{ xtype: 'spacer' },
				{
					xtype: 'button',
					ui: 'plain',
					iconCls: 'delete',
					iconMask: true,
					handler: function(){
						popupEditComment.hide('pop');
					}
				}
			]
	});
	
	var editCommentFieldSet = new Ext.form.FieldSet({
		instructions: _comment_instruction,
		items: [
			{
				xtype: 'textareafield',
				name: 'editComment',
				value: text
			},
			{
				xtype: 'checkboxfield',
				name: 'alsoMail',
				label: _also_mail,
				labelWidth: '100%',
				checked: false,
				value: '1'
			}
		]
	});
	
	popupEditComment = new Ext.form.FormPanel({
		floating: true,
		centered: true,
		modal: true,
		width: '90%',
		dockedItems: [popupEditCommentHead],
		items: [
			editCommentFieldSet,
			{
				xtype: 'button',
				id: 'editCommentSubmit',
				text: _edit_comment,
				handler: function() {
					this.setDisabled(true);
					editCommentHandler(meetingInfoStore.getAt(0).get('id'), commentid);
				}
			}
		]
	});
	popupEditComment.show('pop');
	
	popupEditComment.on('hide',function(){
		this.destroy();
	});
}

//######################################################
// Kommentar bearbeiten
// ruft ein Popup zur Eingabe auf
// aus dem Popup wird der Handler aufgerufen
//######################################################
function writeComment() {
	var popupWriteCommentHead = new Ext.Toolbar({
		dock: 'top',
		title: _comment,
		items: [
				{ xtype: 'spacer' },
				{
					xtype: 'button',
					ui: 'plain',
					iconCls: 'delete',
					iconMask: true,
					handler: function(){
						popupWriteComment.hide('pop');
					}
				}
			]
	});
	
	var writeCommentFieldSet = new Ext.form.FieldSet({
		instructions: _comment_instruction,
		items: [
			{
				xtype: 'textareafield',
				name: 'writeComment'
			},
			{
				xtype: 'checkboxfield',
				name: 'alsoMail',
				label: _also_mail,
				labelWidth: '100%',
				checked: false,
				value: '1'
			}
		]
	});
	
	popupWriteComment = new Ext.form.FormPanel({
		floating: true,
		centered: true,
		modal: true,
		width: '90%',
		dockedItems: [popupWriteCommentHead],
		items: [
			writeCommentFieldSet,
			{
				xtype: 'button',
				id: 'writeCommentSubmit',
				text: _send_comment,
				handler: function() {
					this.setDisabled(true);
					writeCommentHandler(meetingInfoStore.getAt(0).get('id'));
				}
			}
		]
	});
	popupWriteComment.show('pop');
	
	popupWriteComment.on('hide',function(){
		this.destroy();
	});
}