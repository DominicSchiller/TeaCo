require_relative 'api_response_handler'

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
        send_error
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

    def search
      index
    end

  end
end