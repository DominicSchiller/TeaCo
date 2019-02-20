require_relative 'api_response_handler'
require_relative '../../services/notification_service'

##
# API module  grouping all REST API related classes.
module Api
  ##
  # Concrete API response handler which handles all
  # User related API calls.
  class UsersController < APIResponseHandler

    ##
    # Fetches all users recorded in TeaCo.
    def index
        registered_user = load_user(params)
      if registered_user != nil
        email = params["email"]
        users = []
        if email != nil
          users = User.where("email like ?","%#{email}%")
        else
          users = User.order('created_at DESC')
        end
        send_json(users)
      else
        send_error 401
      end

    end

    ##
    # Fetches one specific user defined by it's unique
    # (1) ID or
    # (2) hash key
    def show
      user = load_user(params)
      send_json(user)
    end

    ##
    # Create a new user and send invitation mail in case the
    # given email address does not already exists.
    def create
      user_params = params["user"]
      user = nil
      if not user_params.nil?
        existing_user = User.where("email like ?","%#{user_params["email"]}%")
        if existing_user.length == 0
          user = User.create( {email: user_params["email"], name: user_params["name"], language: user_params["language"]})
          if user.valid?
            NotificationService.send_account_confirmation(user)
            send_json(user)
          else
            send_error 422
          end
        else
          send_error 409
        end
      else
        send_error 400
      end
    end

    def search
      index
    end

  end
end