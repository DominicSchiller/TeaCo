##
# Utility class which generates custom mobile app deep links.
class AppLinkGenerator
  ##
  # Generate a deep link to register a user within the TeaCo mobile app.
  def self.generate_registration_link(user_key)
    app_schema_prefix = "teaco://user/"
    app_link = ""
    app_link << app_schema_prefix
    app_link << user_key
    app_link
  end
end