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
        operating_system = params["os"]
        device_class = params["device_class"]
        token = params["token"]

        is_token_updated = false
        user.push_tokens.each do |push_token|
          if push_token.operating_system.to_s == operating_system.to_s and
              push_token.device_class.to_s == device_class.to_s
            push_token.token = token
            push_token.save!
            is_token_updated = true
            break
          end
        end
        # only create new push token instance if user doesn't have any for
        # the given combination of operating system and device class
        unless is_token_updated
          push_token = PushToken.new(
              :operating_system => params["os"],
              :device_class => params["device_class"],
              :token => params["token"])
          push_token.save!
          user.push_tokens << push_token
        end
        send_ok
      else
        send_error
      end
    end
  end
end