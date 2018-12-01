module MailerHelper

  # Returns the name of the user, if it is not blank,
  # or otherwise his email.
  def user_name_or_email(user)
    if user.name.blank?
      user.email
    else
      "#{user.name} (#{user.email})"
    end
  end

end