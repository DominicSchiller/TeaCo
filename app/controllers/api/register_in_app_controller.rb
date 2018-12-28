##
# API module  grouping all REST API related classes.
module Api
  ##
  # Concrete API response handler which handles all
  # in-app registration requests.
  class RegisterInAppController < APIResponseHandler
    ##
    # Redirect a user to correct mobile app deep link url.
    def redirect
      user_key = params['key']
      redirect_to('teaco://user/' + user_key)
    end
  end
end
