require 'fcm'

##
# Notification Service which will notify
# users via E-Mail as well as via Push if registered for either or both
# of these.
class NotificationService
  # local fcm instance for sending push notifications
  @@fcm = FCM.new(Rails.application.config.fcm_server_key, timeout: 30)

  def self.send_account_confirmation(user)
    TeacoMailer.account_confirmation(user).deliver
  end

  ##
  # Send a meeting invitation.
  def self.send_meeting_invitation(organizer, participant, meeting, comment)
    # Send an invitation mail to the user:
    I18n.locale = participant.language
    TeacoMailer.invitation(participant, meeting, organizer, comment).deliver

    to_tokens = []
    participant.push_tokens.each do |push_token|
      to_tokens.push(push_token.token)
    end
    unless to_tokens.empty?
      notification = {
        "notification": {
          "title": "Einladung zur Terminabstimmung",
          "body": "Du wurdest soeben von #{organizer.name} zur Terminabstimmung von »#{meeting.title}« eingeladen",
          "data": {
              "messageCode": 1,
              "meetingId": meeting.id
          }
        }
      }
      @@fcm.send_notification(to_tokens, notification)
    end
  end

  ##
  # Send finished meeting details to each participant.
  def self.send_finished_meeting_details(current_user, meeting, message, location)
    push_tokens = []

    meeting.participants.each do |participant|
      I18n.locale = participant.language
      TeacoMailer.dates_confirmation(participant, message, meeting, current_user, location).deliver

      # don't send a push notification to the user which triggered the finish process
      if participant.id != current_user.id
        participant.push_tokens.each do |push_token|
          push_tokens.push(push_token.token)
        end
      end

      unless push_tokens.empty?
        notification = {
            "notification": {
                "title": "Termine finalisiert",
                "body": "Die Abstimmung von »#{meeting.title}« wurde erfolgreich beendet.",
                "data": {
                    "messageCode": 2,
                    "meetingId": meeting.id
                }
            }
        }
        @@fcm.send_notification(push_tokens, notification)
      end
    end
  end
end
