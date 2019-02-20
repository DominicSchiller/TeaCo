##
# Utility class which generates custom mobile app deep links.
class AppLinkGenerator
  ##
  # Generate a deep link to register a user within the TeaCo mobile app.
  def self.generate_registration_link(user_key)
    app_link = "teaco://user/#{user_key}"
    app_link
  end

  ##
  # Generate a deep link to show specific meeting within the TeaCo mobile app.
  def self.generate_meeting_link(user_key, meeting_id)
    app_link = "teaco://user/#{user_key}/meetings/#{meeting_id}"
    app_link
  end
end