function createLoadingMasks() {
	loadMeetingMask = new Ext.LoadMask(Ext.getBody(), {
		msg: _load_meeting,
	});
	
	loadMeetingsMask = new Ext.LoadMask(meetingsList.el, {
		msg: _load_meetings,
		store: meetingsStore
	});
	
	var loadUserInfosMask = new Ext.LoadMask(Ext.getBody(), {
		msg: _load_userinfos,
		store: userInfoStore
	});
	
	var loadEmailsMask = new Ext.LoadMask(Ext.getBody(), {
		msg: _load_addresses,
		store: userEmailsStore
	});
};