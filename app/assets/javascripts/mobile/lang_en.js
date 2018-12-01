var _cur_lang				= 'en';
//######################################################
// Startseite
//######################################################
var _login 					= 'Login',
 	_email 					= 'E-mail',
	_password				= 'Password',
	_instr_login			= 'Login with your E-mail and password, to get forwarded to your own profile.',
	_register				= 'Create new account',
	_name					= 'Name',
	_optional				= 'optional',
	_language				= 'Language',
	_create_account			= 'Create account',
	_instr_register			= 'If you already have a TeaCo account you can retrieve your personal TeaCo-link again by entering your e-mail address.',
	_eyecatcher_line_1		= 'Time scheduling.',
	_eyecatcher_line_2		= 'Fast and easy.'
	_eyecatcher_line_3		= 'Scheduling a meeting - with TeaCo it\'s a piece of cake. Make suggestions, invite participants, let them vote. Done!';
	
//######################################################
// Meetingübersicht
//######################################################
var _meetings				= 'Meetings',
	_own_meetings			= 'Own meetings',
	_not_voted				= 'Not voted',
	_already_voted			= 'Already voted'
	_edit					= 'Edit',
	_done					= 'Done',
	_delete					= 'delete',
	_leave					= 'leave',
	_new_meeting			= 'New meeting',
	_instr_new_meeting		= 'In a restricted Meeting each participant may only manipulate or delete his own suggestions.',
	_restricted				= 'restricted',
	_create_meeting			= 'Create meeting',
	_title					= 'Title',
	_clone_meeting			= 'Clone meeting',
	_delete_meeting			= 'Delete meeting',
	_leave_meeting			= 'Leave meeting',
	_change_title			= 'Change title',
	_pull_to_reload			= 'Pull down to reload',
	_release_to_reload		= 'Release to reload',
	_cancel					= 'cancel';
	
//######################################################
// Kommentare
//######################################################
var _head_title				= 'Comments',
	_no_comments			= 'No comments written.',
	_delete_comment			= 'Delete comment',
	_comment_instruction	= 'If the checkbox is checked, every participant gets informed of this comment via e-mail',
	_also_mail				= 'Send as mail',
	_edit_comment			= 'Change comment',
	_comment				= 'Comment',
	_send_comment			= 'Send comment';

//######################################################
// neue Teilnehmer
//######################################################
var _new_address			= 'New address',
	_add_address_instr		= 'Add an e-mail-address to the list.',
	_add_email_address		= 'Add e-mail-adress',
	_invalid_email			= 'Irregular e-mail-address.',
	_invite					= 'Invite',
	_new					= 'New',
	_load_known_addresses	= 'Load known addresses',
	_message				= 'Message',
	_also_comment			= 'Message as comment',
	_invite_participant		= 'Invite participants',
	_add_text				= 'Add text',
	_invite_without_text	= 'Invite without text';

//######################################################
// Teilnehmer
//######################################################
var _new_participants		= 'New participants',
	_send_message			= 'Send message',
	_uninvite				= 'Uninvite';

//######################################################
// Einstellungen
//######################################################
var _delete_account			= 'Delete Account',
	_delete_email_address	= 'Delete e-mail-address',
	_ok						= 'OK',
	_settings				= 'Settings',
	_name_optional			= 'Name (optional)',
	_instr_username			= 'You can provide your name, so it will be displayed instead of your e-mail-address to other TeaCo users.',
	_password_optional		= 'Password (optional)',
	_instr_password			= 'If you specify a password, you can log in with your e-mail-address and password.',
	_fb_url					= 'Free/Busy-URL',
	_instr_fb_url			= 'Provide your online published Free/Busy file in iCalendar format here and TeaCo will show other participants when you are not available at certain days or time spans.',
	_language				= 'Language',
	_instr_del_acc			= 'Click on the link below to delete your TeaCo account. Please notice: Deleting your account will also delete any data that you created, this includes: your e-mail address, your name, all suggestions you created, all information on how you voted in your meetings, all comments you wrote, all meetings you initiated.',
	_manage_email_addresses = 'Manage e-mail-addresses',
	_instr_manage_email		= 'E-mail-adresses marked with * are not activated yet.',
	_select_main_email		= 'Select main-adress',
	_activate_new_email		= 'Activate new e-mail-address',
	_new_email				= 'New e-mail-adress',
	_activate				= 'activate',
	_choose					= 'select';

//######################################################
// Lademasken
//######################################################
var _load_meeting			= 'Loading meeting...',
	_load_meetings			= 'Loading meetings...',
	_load_userinfos			= 'Loading user information...',
	_load_addresses			= 'Loading e-mail-adresses...',
	_load_participants		= 'Loading participants';
	
//######################################################
// Terminvorschlag
//######################################################
var _yes					= 'Yes',
	_maybe					= 'Maybe',
	_no						= 'No',
	_edit_time				= 'Edit time',
	_close					= 'Close',
	_complete				= 'Complete',
	_location_optional		= 'Location (optional)',
	_send_meetingdata		= 'Send meeting data',
	_participants			= 'Participants',
	_loading				= 'Loading...',
	_edit_suggestion		= 'Edit suggestion';

//######################################################
// Handler
//######################################################
var _saved					= 'Saved!',
	_error					= 'Error!',
	_deleted				= 'Deleted!',
	_inserted				= 'Inserted!',
	_successful				= 'Success!',
	_settings_saved			= 'Settings saved.',
	_settings_error			= 'Error: Settings not saved.',
	_main_email_saved		= 'Main-adress saved.',
	_main_email_error		= 'Error: E-mail not saved.',
	_email_activated		= 'A mail with an activation-link was sent to the given e-mail address. Please follow the instructions in the message to activate your new address.',
	_email_activate_error	= 'Error: E-mail not saved.',
	_account_deleted		= 'Your TeaCo-account was deleted.',
	_delete_account_error	= 'Error: Account not deleted.',
	_email_deleted			= 'The selected e-mail-address was deleted.',
	_email_delete_error		= 'Error: E-mail-address not deleted',
	_login_failed			= 'The address or the password you entered are invalid.',
	_registration_succeded	= 'Your login data was sent to your e-mail-address',
	_registration_failed	= 'Registration failed. The data you entered are invalid',
	_new_meeting_failed		= 'Error: Meeting not created.',
	_delete_meeting_failed	= 'Error: Meeting not deleted.',
	_leave_meeting_failed	= 'Error: Meeting not left.',
	_clone_meeting_failed	= 'Error: Meeting not cloned.',
	_change_title_failed	= 'Error: Title not changed.',
	_pick_suggestion_failed = 'Error: Suggestion not picked.',
	_vote_suggestion_failed	= 'Error: Not voted.',
	_new_suggestion_failed	= 'Error: Suggestions not created.',
	_update_sugg_failed		= 'Error: Suggestions not updated.',
	_delete_sugg_failed		= 'Error: Suggestions not deleted.',
	_send_dates_succeded	= 'Meeting data was sent.',
	_send_dates_failed		= 'Error: Meeting data not sent.',
	_uninvite_failed		= 'Error: Participants not uninvited.',
	_write_msg_succeded		= 'The message was sent.',
	_write_msg_failed		= 'Error: Message not sent.',
	_invite_failed			= 'Error: Participants not invited.',
	_delete_comment_failed	= 'Error: Comment not deleted.',
	_edit_comment_failed	= 'Error: Comment not edited.',
	_write_comment_failed	= 'Error: Comment not posted.';