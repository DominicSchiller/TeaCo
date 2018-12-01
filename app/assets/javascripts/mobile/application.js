//######################################################
// Deklaration von Elementen,
// die globalen Zugriff benötigen
//######################################################
var basePanel, meetingPanel, suggestionPanel, settingsPanel, loginPanel, participantsPanel, invitePanel, messagePanel, commentsPanel;
var popupNewMeeting, popupChangeMeetingTitle, popupSendDates, popupEditComment;
var confirmCloneMeeting, confirmDeleteMeeting, confirmLeaveMeeting, confirmPickSuggs, confirmDeleteComment;

var meetingsList, editSuggSheet;

var meetingsStore, userInfoStore, userEmailsStore, meetingInfoStore, participantsStore, knownAddressesStore;

var RED 	= '#900',
	YELLOW	= '#FC0',
	GREEN	= '#0C0';
	
var meetingStates = new Array(
	_not_voted,
	_already_voted
);

var pickerHourData = [
	{ text: '00' , value: '00' },
	{ text: '01' , value: '01' },
	{ text: '02' , value: '02' },
	{ text: '03' , value: '03' },
	{ text: '04' , value: '04' },
	{ text: '05' , value: '05' },
	{ text: '06' , value: '06' },
	{ text: '07' , value: '07' },
	{ text: '08' , value: '08' },
	{ text: '09' , value: '09' },
	{ text: '10' , value: '10' },
	{ text: '11' , value: '11' },
	{ text: '12' , value: '12' },
	{ text: '13' , value: '13' },
	{ text: '14' , value: '14' },
	{ text: '15' , value: '15' },
	{ text: '16' , value: '16' },
	{ text: '17' , value: '17' },
	{ text: '18' , value: '18' },
	{ text: '19' , value: '19' },
	{ text: '20' , value: '20' },
	{ text: '21' , value: '21' },
	{ text: '22' , value: '22' },
	{ text: '23' , value: '23' }
];

var pickerMinutesData = [
	{ text: '00' , value: '00' },
	{ text: '15' , value: '15' },
	{ text: '30' , value: '30' },
	{ text: '45' , value: '45' }
];


//######################################################
// Animationen bei Panel-Wechsel
//######################################################
var meetingToSettings 			= { type: 'slide', direction: 'up', cover: 'true' };
var settingsToMeeting 			= { type: 'slide', direction: 'down', reveal: 'true' };
var meetingToSuggestion			= { type: 'slide', direction: 'left' };
var suggestionToMeeting 		= { type: 'slide', direction: 'right' };
var suggestionToParticipants	= { type: 'slide', direction: 'up', cover: 'true' };
var participantsToSuggestion 	= { type: 'slide', direction: 'down', reveal: 'true' };
var participantsToInvite		= { type: 'slide', direction: 'left' };
var inviteToParticipants		= { type: 'slide', direction: 'right' };
var participantsToMessage		= { type: 'slide', direction: 'up', cover: 'true' };
var messageToParticipants	 	= { type: 'slide', direction: 'down', reveal: 'true' };

//######################################################
// Extrahiert Userkey aus der URL
// benötigt u.A. für Proxy-URLs
//######################################################
function getUserkeyFromURL() {
	var path = window.location.pathname;
	var folders = path.split("/");
	var user;
	if (folders.length > 0)
		user = folders[1];
	return user;
}

function getMeetingIdFromURL() {
	var path = window.location.pathname;
	var folders = path.split("/");
	var user;
	if (folders.length > 1)
		meetingId = folders[2];
	return meetingId;
}

//######################################################
// Applikation starten, onLoad
//######################################################
Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: true,
	onReady: function(){
		
		//######################################################
		// Models registrieren zur Kommunikation mit Rails
		//######################################################
		Ext.regModel('meetings', {
			proxy: {
				type: 'ajax',
				url: '/users/'+getUserkeyFromURL()+'/meetings',
				reader: {
					type: 'json'
				}
			},
			fields: ['id','title','state','restricted','initiator_id','updated_at','updated_at_in_words','initiator']
		});
		
		Ext.regModel('userinfos', {
			proxy: {
				type: 'ajax',
				url: '/'+getUserkeyFromURL()+'/userinfos',
				reader: {
					type: 'json'
				}
			},
			fields: ['name','freebusy_url','language']
		});
		
		Ext.regModel('useremails', {
			proxy: {
				type: 'ajax',
				url: '/users/'+getUserkeyFromURL()+'/alias_addresses',
				reader: {
					type: 'json'
				}
			},
			fields: ['id','email','primary','confirmed']
		});
		
		// In diesen Models ist noch kein Proxy gesetzt,
		// da die URL abhängig von Parametern wie der MeetingID ist
		Ext.regModel('meeting', {
			fields: ['id','title','restricted','initiator_id','initiator_name','participants_cnt']
		});
		
		Ext.regModel('suggestions', {
			fields: ['id','meeting_id','vote_id','date_raw','date','start','end','picked','own_vote','votebar','votes','destroyable','pickable']
		});
		
		Ext.regModel('participants', {
			fields: ['id','user_id','address','display_name','isInitiator']
		});
		
		Ext.regModel('known_addresses', {
			fields: ['user_id','name','address']
		});
		
		Ext.regModel('comments', {
			fields: ['id','author','author_id','text','text_formatted','manipulable']
		});
		
		//######################################################
		// Models Ende
		//######################################################
		
		//######################################################
		// Wenn die URL einen (korrekten) Userkey aufweist,
		// zeige MeetingPanel und erstelle abhängige Panels,
		// sonst zeige LoginPanel
		//######################################################
		if (getUserkeyFromURL() != "") {
			createMeetingPanel();
			createSettingsPanel();
			createParticipantsPanel();
			createInvitePanel();
			createMessagePanel();
			createCommentsPanel();
			createSuggestionPanel();
			createLoadingMasks();
			
			meetingId = getMeetingIdFromURL();
			if (meetingId == "settings") {
				activeItem = 2;
				userInfoStore.load();
				userEmailsStore.load();
			} else if (meetingId) {
				activeItem = 1;
				reloadMeetingInfo(meetingId, false);
			} else {
				activeItem = 0;
				meetingsStore.load();
			}
			//######################################################
			// Panel im Card-Layout, welches alle Panels umfasst
			//######################################################
			basePanel = new Ext.Panel({
				monitorOrientation: false,
				fullscreen: true,
				activeItem: activeItem,
				items: [
					meetingPanel,			// index: 0
					suggestionPanel,		// index: 1
					settingsPanel,			// index: 2
					participantsPanel,		// index: 3
					invitePanel,			// index: 4
					messagePanel			// index: 5
				],
				layout: 'card'
			});
		} else {
			createLoginPanel();
		}
		
	}
});

//######################################################
// Schneidet Strings auf Länge Limit ab.
//######################################################
function cutStr(str, location) {
	if (Ext.getOrientation() == "portrait") {
		if (location == "meetingList")
			var limit = 28;
		else if (location == "meetingListWithButtons")
			var limit = 24;
		else if (location == "meetingListShowDeleteButton")
			var limit = 22;
		else if (location == "suggPanel")
			var limit = 20;
	} else {
		if (location == "meetingList")
			var limit = 50;
		else if (location == "meetingListWithButtons")
			var limit = 45;
		else if (location == "meetingListShowDeleteButton")
			var limit = 42;
		else if (location == "suggPanel")
			var limit = 20;
	}
	return (str.length > limit) ? str.substr(0,limit-3)+'...' : str;
}