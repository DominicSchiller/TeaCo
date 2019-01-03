require_relative 'api_response_handler'

##
# API module  grouping all REST API related classes.
module Api
  ##
  # Concrete API response handler which handles all
  # Votes related API calls.
  class VotesController < APIResponseHandler
    ##
    # Fetches all votes associated with a specific suggestion recorded in TeaCo.
    def index
     suggestion = load_suggestion(params)
     send_json(suggestion.votes)
    end

    ##
    # Fetches one specific vote defined by it's unique ID
    def show
      vote = Vote.find_by_id(params['vote_id'])
      send_json(vote)
    end

  end
end