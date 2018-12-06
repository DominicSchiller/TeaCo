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
      self.send_json(users)
    end

    ##
    # Fetches one specific user defined by it's unique
    # (1) ID or
    # (2) hash key
    def show
      key = params[:user_key]
      if key.match(/^(\d)+$/)
        # the key is an ID number, so fetch by ID
        self.send_json(User.find(key))
      else
        # the key is the actual user hash key, so fetch by this property
        self.send_json(User.find_by_key(key))
      end
    end

  end
end