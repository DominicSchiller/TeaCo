require_relative 'api_response_handler'

##
# API module  grouping all REST API related classes.
module Api
  ##
  # Concrete API response handler which handles all
  # Push-Token related API calls.
  class PushTokensController < APIResponseHandler
    ##
    # Fetch all push tokens from a specific user
    def show
      user = load_user(params)
      if !user.nil?
        send_json(user.push_tokens)
      else
        send_error
      end
    end

    ##
    # Update a user's push reference.
    # Note: If there's no push reference, a new PushToken instance will
    # be created and assigned to the given user.
    def update
      user = load_user(params)
      if !user.nil?
        push_token = PushToken.new(
            :operating_system => params["os"],
            :device_class => params["device_class"],
            :token => params["token"])
        push_token.save!
        user.push_tokens << push_token
        send_ok
      else
        send_error
      end
    end
  end
end