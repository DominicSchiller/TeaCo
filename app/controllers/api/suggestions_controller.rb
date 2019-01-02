require_relative 'api_response_handler'

##
# API module  grouping all REST API related classes.
module Api
  ##
  # Concrete API response handler which handles all
  # Suggestion related API calls.
  class SuggestionsController < APIResponseHandler
    ##
    # Fetches all meetings associated with a specific user recorded in TeaCo.
    def index
      meeting = load_meeting(params)
      suggestions = meeting.suggestions
      self.send_json(
              suggestions.to_json(:include => [:votes])
      )
    end

    ##
    # Fetches one specific suggestion defined by it's unique ID
    def show
      suggestion = load_suggestion(params)
      self.send_json(
          suggestion.to_json(:include => [:votes])
      )
    end
  end
end