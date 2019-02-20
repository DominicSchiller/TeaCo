require_relative '../helpers/app-link-generator'

class TeacoMailer < ActionMailer::Base
  #default :from => "'TeaCo <teaco@teaco.imis.uni-luebeck.de>"
  default :from => "TeaCo <teacorwd@gmail.com>"
  layout 'mailer'

  helper :mailer
  helper :application

  def account_confirmation(user)
    @user = user

    mail  :to      => user.email,
          :subject => I18n.t('layouts.users.welcome'),
          :date    => Time.now
  end

  def alias_confirmation(email, confirmation_hash)
    @email             = email
    @confirmation_hash = confirmation_hash

    mail :to      => @email,
         :subject => I18n.t('teaco_mailer.alias_confirmation.subject'),
         :date    => Time.now
  end

  def comment_notification(comment, recipient)
    @comment = comment
    @message = comment.text
    @author  = User.find_by_id(comment.author_id)
    @meeting = Meeting.find_by_id(comment.meeting_id)
    @user    = recipient

    mail :to      => email_name(@user),
         :from    => email_name(@author),
         :subject => I18n.t('teaco_mailer.comment_notification.subject', :meeting => comment.meeting.title),
         :date    => Time.now
  end

  def invitation(recipient, meeting, inviting_user, invitation_text)
    @inviting_user   = inviting_user
    @meeting         = meeting
    @user            = recipient
    @invitation_text = invitation_text

    mail :to      => email_name(recipient),
         :from    => email_name(inviting_user),
         :subject => I18n.t('teaco_mailer.invitation.subject', :meeting => meeting.title),
         :date    => Time.now
  end

  def user_message(recipient, message, meeting, author)
    @message   = message
    @meeting   = meeting
    @author    = author
    @user      = recipient

    mail :to      => email_name(recipient),
         :from    => email_name(author),
         :subject => I18n.t('teaco_mailer.user_message.subject', :meeting => meeting.title),
         :date    => Time.now
  end

  def dates_confirmation(recipient, message, meeting, sending_user, location)
    @meeting      = meeting
    @sending_user = sending_user
    @location     = location
    @message      = message
    @user         = recipient

    attachment_count = meeting.picked_suggestions.length
    meeting.picked_suggestions.each_with_index do |sugg, index|
      filename = "#{meeting.title.gsub(" ","_")}.ics"
      filename = "#{meeting.title.gsub(" ","_")}_#{index+1}.ics" if attachment_count > 1
      attachments[filename] = {
          :content_type => 'text/calendar',
          :content      => sugg.to_ical(location).export
      }
    end

    mail :to      => email_name(recipient),
         :from    => email_name(sending_user),
         :subject => I18n.t('teaco_mailer.dates_confirmation_html.subject', :meeting => meeting.title),
         :date    => Time.now
  end

  def email_name(user)
    if user.name.blank?
      user.email
    else
      "#{user.name} <#{user.email}>"
    end
  end

end
