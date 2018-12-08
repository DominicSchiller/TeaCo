require_relative 'api_response_handler'

##
# API module  grouping all REST API related classes.
module Api
  ##
  # Concrete API response handler which handles all
  # Meeting related API calls.
  class MeetingsController < APIResponseHandler

    ##
    # Fetches all meetings associated with a specific user recorded in TeaCo.
    def index
      user = UsersController.get_user(params)
      meetings = user.meetings
      self.send_json_with_includes(meetings, [:participants, :initiator, :suggestions])
    end

  end
end