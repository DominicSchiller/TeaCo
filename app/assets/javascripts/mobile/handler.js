//######################################################
// Handler für das settingsPanel
//######################################################

var settingsGlobalOkHandler = function(){
	var values = settingsPanel.getValues();
	var settingsReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL(),
		type: "POST",
		success: function(response, opts){
			if (_cur_lang != values["language"]) {
				location.href = "/"+getUserkeyFromURL()+"/settings";
			}
			Ext.Msg.alert(_saved,_settings_saved);
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_settings_error);
		},
		params: {
			_method: 'put',
			authenticity_token: AUTH_TOKEN,
			"user[name]": values["username"],
			"user[password]": values["password"],
			"user[freebusy_url]": values["freebusy_url"],
			"user[language]": values["language"]
		},
		disableCaching: false
	});
};

var settingsMainEmailHandler = function() {
	var values = settingsPanel.getValues();
	var settingsReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL(),
		type: "POST",
		success: function(response, opts){
			Ext.Msg.alert(_saved,_main_email_saved);
			userEmailsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_main_email_error);
			userEmailsStore.load();
		},
		params: {
			_method: 'put',
			"user[email]": values["mainEmail"],
			authenticity_token: AUTH_TOKEN
		},
		disableCaching: false
	});
};

var settingsActivateEmailHandler = function(){
	var values = settingsPanel.getValues();
	var emailReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/alias_addresses",
		type: "POST",
		success: function(response, opts){
			Ext.Msg.alert(_inserted,_email_activated);
			userEmailsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_email_activate_error);
			userEmailsStore.load();
			Ext.getCmp('newEmail').setValue('');
		},
		params: {
			_method: 'post',
			authenticity_token: AUTH_TOKEN,
			"alias_address[address]": values["newEmail"],
			"alias_address[owner_id]": USER_ID
		},
		disableCaching: false
	});
};

var settingsDeleteAccountHandler = function() {
	var settingsReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL(),
		type: "POST",
		success: function(response, opts){
			Ext.Msg.alert(_deleted,_account_deleted, function () { location.href = '/'; });
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_delete_account_error);
		},
		params: {
			_method: 'delete',
			authenticity_token: AUTH_TOKEN
		},
		disableCaching: false
	});
};

var settingsDeleteEmailHandler = function() {
	var values = settingsPanel.getValues();
	var settingsReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/alias_addresses/"+values["deleteEmail"],
		type: "POST",
		success: function(response, opts){
			Ext.Msg.alert(_deleted,_email_deleted);
			userEmailsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_email_delete_error);
		},
		params: {
			_method: 'delete',
			authenticity_token: AUTH_TOKEN
		},
		disableCaching: false
	});
}

//######################################################
// Handler für das loginPanel
//######################################################

var loginHandler = function(){
	var values = loginPanel.getValues();
	var loginReq = Ext.Ajax.request({
		url: "/authenticate",
		type: "POST",
		success: function(response, opts){
			location.href = "/"+response.responseText;
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_login_failed);
		},
		params: {
			_method: 'post',
			authenticity_token: AUTH_TOKEN,
			"user[email]": values["login_email"],
			"user[password]": values["login_password"]
		},
		disableCaching: false
	});
};

var registerHandler = function(){
	var values = loginPanel.getValues();
	var registerReq = Ext.Ajax.request({
		url: "/users",
		type: "POST",
		success: function(response, opts){
			Ext.Msg.alert(_successful,_registration_succeded);
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_registration_failed);
		},
		params: {
			_method: 'post',
			authenticity_token: AUTH_TOKEN,
			"user[email]": values["email"],
			"user[name]": values["name"],
			"user[language]": values["language"]
		},
		disableCaching: false
	});
};

//######################################################
// Handler für das meetingPanel
//######################################################

var meetingsNewMeetingHandler = function(){
	var values = popupNewMeeting.getValues();
	
	if (!values["isRestricted"]) restricted = '0';
	else restricted = values["isRestricted"];
	
	var newMeetingReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings",
		type: "POST",
		success: function(response, opts){
			popupNewMeeting.hide('pop');
			meetingsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_new_meeting_failed);
			popupNewMeeting.hide('pop');
		},
		params: {
			_method: 'post',
			authenticity_token: AUTH_TOKEN,
			"meeting[initiator_id]": USER_ID,
			"meeting[title]": values["meetingTitle"],
			"meeting[restricted]": restricted
		},
		disableCaching: false
	});
};

var meetingDeleteMeetingHandler = function(id) {
	var meetingDeleteReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+id,
		type: "POST",
		success: function(response, opts){
			confirmDeleteMeeting.hide();
			hideAllDeleteButtons();
			Ext.getCmp('deleteMeeting').setDisabled(false);
			meetingsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_delete_meeting_failed);
		},
		params: {
			_method: 'delete',
			authenticity_token: AUTH_TOKEN
		},
		disableCaching: false
	});
};

var meetingLeaveMeetingHandler = function(id) {
	var meetingLeaveReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+id+"/leave",
		type: "POST",
		success: function(response, opts){
			confirmLeaveMeeting.hide();
			hideAllDeleteButtons();
			Ext.getCmp('leaveMeeting').setDisabled(false);
			meetingsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_leave_meeting_failed);
		},
		params: {
			_method: 'delete',
			authenticity_token: AUTH_TOKEN
		},
		disableCaching: false
	});
};

var meetingCloneMeetingHandler = function(id) {
	var values = popupCloneMeeting.getValues();
	
	if (!values["isRestricted"]) restricted = '0';
	else restricted = values["isRestricted"];
	
	var meetingCloneReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings",
		type: "POST",
		success: function(response, opts){
			popupCloneMeeting.hide();
			Ext.getCmp('cloneMeetingSubmit').setDisabled(false);
			meetingsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_clone_meeting_failed);
			Ext.getCmp('cloneMeetingSubmit').setDisabled(false);
			popupChangeMeetingTitle.hide('pop');
		},
		params: {
			_method: 'post',
			authenticity_token: AUTH_TOKEN,
			"meeting[initiator_id]": USER_ID,
			"meeting[title]": values["cloneMeetingTitle"],
			"meeting[restricted]": restricted,
			clone: id
		},
		disableCaching: false
	});
};

var meetingChangeTitleHandler = function(id) {
	var values = popupChangeMeetingTitle.getValues();
	var meetingChangeReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+id,
		type: "POST",
		success: function(response, opts){
			popupChangeMeetingTitle.hide('pop');
			meetingsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_change_title_failed);
			popupChangeMeetingTitle.hide('pop');
		},
		params: {
			_method: 'put',
			authenticity_token: AUTH_TOKEN,
			"meeting[initiator_id]": USER_ID,
			"meeting[title]": values["changeMeetingTitle"]
		},
		disableCaching: false
	});
};

//######################################################
// Handler für das suggestionsPanel
//######################################################

var pickSuggestionHandler = function(meetingid, suggestionid, picked) {
	var pickSuggestionReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+meetingid+"/suggestions/"+suggestionid,
		type: "POST",
		success: function(response, opts){
			//suggestionsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_pick_suggestion_failed);
			suggestionsStore.load();
		},
		params: {
			_method: 'put',
			authenticity_token: AUTH_TOKEN,
			"suggestion[picked]": picked
		},
		disableCaching: false
	});
};

var voteSuggestionHandler = function(meetingid, suggestionid, voteid, vote_decision) {
	var voteSuggestionReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+meetingid+"/suggestions/"+suggestionid+"/votes/"+voteid,
		type: "POST",
		success: function(response, opts){
			var votebar_panel = Ext.get('votebar_'+meetingid+'_'+suggestionid);
			votebar_panel.update('<div class="votebar">'+response.responseText+'</div>');
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_vote_suggestion_failed);
			suggestionsStore.load();
		},
		params: {
			_method: 'put',
			authenticity_token: AUTH_TOKEN,
			"vote[decision]": vote_decision,
		},
		disableCaching: false
	});
};

var newSuggestionHandler = function(date, time, meetingid) {
	var newSuggestionReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+meetingid+"/suggestions",
		type: "POST",
		success: function(response, opts){
			suggestionsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_new_suggestion_failed);
		},
		params: {
			_method: 'post',
			authenticity_token: AUTH_TOKEN,
			"suggestion[creator_id]": USER_ID,
			"suggestion[meeting_id]": meetingid,
			"suggestion[date]": date.format("Y-m-d"),
			"suggestion[start]": time["fromHour"]+":"+time["fromMinutes"],
			"suggestion[end]": time["toHour"]+":"+time["toMinutes"]
		},
		disableCaching: false
	});
}

var updateSuggestionHandler = function(date, time, meetingid, suggid) {
	var updateSuggestionReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+meetingid+"/suggestions/"+suggid,
		type: "POST",
		success: function(response, opts){
			suggestionsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_update_sugg_failed);
		},
		params: {
			_method: 'put',
			authenticity_token: AUTH_TOKEN,
			"suggestion[creator_id]": USER_ID,
			"suggestion[meeting_id]": meetingid,
			"suggestion[date]": date.format("Y-m-d"),
			"suggestion[start]": time["fromHour"]+":"+time["fromMinutes"],
			"suggestion[end]": time["toHour"]+":"+time["toMinutes"]
		},
		disableCaching: false
	});
}

var deleteSuggestionHandler = function(meetingid, suggestionid) {
	var deleteSuggestionReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+meetingid+"/suggestions/"+suggestionid,
		type: "POST",
		success: function(response, opts){
			editSuggSheet.hide();
			Ext.getCmp('deleteSuggestion').setDisabled(false);
			suggestionsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_delete_sugg_failed);
			Ext.getCmp('deleteSuggestion').setDisabled(false);
		},
		params: {
			_method: 'delete',
			authenticity_token: AUTH_TOKEN
		},
		disableCaching: false
	});
}

var pickSuggsHandler = function(meetingid) {
	var values = popupSendDates.getValues();
	
	if (!values["alsoComment"]) alsoComment = '0';
	else alsoComment = values["alsoComment"];
	
	var pickSuggsReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+meetingid+"/send_dates",
		type: "POST",
		success: function(response, opts){
			Ext.Msg.alert(_successful,_send_dates_succeded);
			popupSendDates.hide('pop');
			Ext.getCmp('sendMeetingDates').setDisabled(false);
			if (alsoComment)
				commentsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_send_dates_failed);
			popupSendDates.hide('pop');
			Ext.getCmp('sendMeetingDates').setDisabled(false);
		},
		params: {
			_method: 'post',
			authenticity_token: AUTH_TOKEN,
			"message": values["sendDatesMessage"],
			"location": values["sendDatesLocation"],
			"also_comment": alsoComment
		},
		disableCaching: false
	});
};

//######################################################
// Handler für das participantsPanel
//######################################################

var uninviteParticipantsHandler = function(meetingid, participantsArr) {
	var paramsArr = new Array();
	paramsArr = { 
      _method: 'delete',
      authenticity_token: AUTH_TOKEN
    }
	
	for (var i = 0; i<participantsArr.length; i++) {
      var val = participantsArr[i].toString();
      paramsArr['participant_ids['+ i +']'] = val;
    }
	
	var uninviteParticipantsReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+meetingid+"/uninvite_participants",
		type: "POST",
		success: function(response, opts){
			meetingInfoStore.load();
			suggestionsStore.load();
			participantsStore.load();
		},
		failure: function(response, opts){
			Ext.getCmp('uninviteParticipants').setDisabled(false);
			Ext.Msg.alert(_error,_uninvite_failed);
		},
		params: paramsArr,
		disableCaching: false
	});
}

var writeMessageHandler = function(meetingid, receiversArr) {
	var paramsArr = new Array();
	paramsArr = { 
      _method: 'post',
      authenticity_token: AUTH_TOKEN,
	  message: Ext.getCmp("writeMessageText").getValue()
    }
	
	for (var i = 0; i<receiversArr.length; i++) {
      var val = receiversArr[i].toString();
      paramsArr['participant_ids['+ i +']'] = val;
    }
	
	var writeMessageReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+meetingid+"/send_message",
		type: "POST",
		success: function(response, opts){
			Ext.getCmp('writeMessageSubmit').setDisabled(false);
			participantsStore.load();
			Ext.getCmp("wrapParticipants").hide();
			Ext.Msg.alert(_successful,_write_msg_succeded);
		},
		failure: function(response, opts){
			Ext.getCmp('writeMessageSubmit').setDisabled(false);
			Ext.getCmp("wrapParticipants").hide();
			Ext.Msg.alert(_error,_write_msg_failed);
		},
		params: paramsArr,
		disableCaching: false
	});
}

var inviteParticipantsHandler = function(meetingid, participants) {
	var values = popupInviteParticipants.getValues();
	
	if (!values["alsoComment"]) alsoComment = '0';
	else alsoComment = values["alsoComment"];
	
	var inviteParticipantsReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+meetingid+"/invite_participants",
		type: "POST",
		success: function(response, opts){
			var btn = Ext.getCmp("inviteParticipants");
			btn.setDisabled(true);
			btn.setText(_invite);
			
			confirmInviteParticipants.hide();
			popupInviteParticipants.hide('pop');
			meetingInfoStore.load();
			participantsStore.load();
			basePanel.setActiveItem('participantsPanel', inviteToParticipants);
			knownAddressesStore.load();
			if (alsoComment)
				commentsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_invite_failed);
			confirmInviteParticipants.hide();
		},
		params: {
			_method: 'post',
			authenticity_token: AUTH_TOKEN,
			"participants": participants,
			"also_comment": alsoComment,
			"message": values["message"]
		},
		disableCaching: false
	});
};

//######################################################
// Handler für das commentsPanel
//######################################################

var deleteCommentHandler = function(meetingid, commentid) {
	var deleteCommentReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+meetingid+"/comments/"+commentid,
		type: "POST",
		success: function(response, opts){
			confirmDeleteComment.hide();
			Ext.getCmp('deleteComment').setDisabled(false);
			commentsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_delete_comment_failed);
			Ext.getCmp('deleteComment').setDisabled(false);
		},
		params: {
			_method: 'delete',
			authenticity_token: AUTH_TOKEN
		},
		disableCaching: false
	});
}

var editCommentHandler = function(meetingid, commentid) {
	var values = popupEditComment.getValues();
	
	if (!values["alsoMail"]) alsoMail = '0';
	else alsoMail = values["alsoMail"];
	
	var editCommentReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+meetingid+"/comments/"+commentid,
		type: "POST",
		success: function(response, opts){
			popupEditComment.hide('pop');
			Ext.getCmp('editCommentSubmit').setDisabled(false);
			commentsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_edit_comment_failed);
			Ext.getCmp('editCommentSubmit').setDisabled(false);
			popupEditComment.hide('pop');
		},
		params: {
			_method: 'put',
			authenticity_token: AUTH_TOKEN,
			"comment[author_id]": USER_ID,
			"comment[text]": values["editComment"],
			"also_mail": alsoMail
		},
		disableCaching: false
	});
};

var writeCommentHandler = function(meetingid) {
	var values = popupWriteComment.getValues();
	
	if (!values["alsoMail"]) alsoMail = '0';
	else alsoMail = values["alsoMail"];
	
	var writeCommentReq = Ext.Ajax.request({
		url: "/users/"+getUserkeyFromURL()+"/meetings/"+meetingid+"/comments/",
		type: "POST",
		success: function(response, opts){
			popupWriteComment.hide('pop');
			Ext.getCmp('writeCommentSubmit').setDisabled(false);
			commentsStore.load();
		},
		failure: function(response, opts){
			Ext.Msg.alert(_error,_write_comment_failed);
			Ext.getCmp('writeCommentSubmit').setDisabled(false);
			popupWriteComment.hide('pop');
		},
		params: {
			_method: 'post',
			authenticity_token: AUTH_TOKEN,
			"comment[author_id]": USER_ID,
			"comment[meeting_id]": meetingid,
			"comment[text]": values["writeComment"],
			"also_mail": alsoMail
		},
		disableCaching: false
	});
};