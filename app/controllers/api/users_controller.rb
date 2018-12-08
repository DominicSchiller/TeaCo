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
      users = User.order('created_at DESC')
      send_json(users)
    end

    ##
    # Fetches one specific user defined by it's unique
    # (1) ID or
    # (2) hash key
    def show
      user = load_user(params)
      send_json(user)
    end

  end
end