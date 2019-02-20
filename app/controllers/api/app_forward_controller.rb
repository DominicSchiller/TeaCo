require_relative 'api_response_handler'

##
# API module  grouping all REST API related classes.
module Api
  ##
  # Concrete API response handler which handles all
  # in-app registration requests.
  class AppForwardController < APIResponseHandler
    ##
    # Redirect a user to correct mobile app deep link url.
    def redirect_to_app_login
      user_key = params['key']
      redirect_to('teaco://user/' + user_key)
    end

    def redirect_to_app_meeting
      user_key = params['key']
      meeting_id = params['meeting_id']
      redirect_to('teaco://user/' + user_key + '/meetings/' + meeting_id)
    end
  end
end
