##
# Notification Service which will notify
# users via E-Mail as well as via Push if registered for either or both
# of these.
class NotificationService

  def self.send_account_confirmation(user)
    TeacoMailer.account_confirmation(user).deliver
  end

  ##
  # Send a meeting invitation.
  def self.send_meeting_invitation(organizer, participant, meeting, comment)
    # Send an invitation mail to the user:
    I18n.locale = participant.language
    TeacoMailer.invitation(participant, meeting, organizer, comment).deliver

    # Add message to push service
    #PushService.add_invitation(participant, meeting, organizer)
    # PushService.send_notifications()
  end

end