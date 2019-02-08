##
# Abstract API response handler which defines methods
# for sending the requested data in various encoding formats.
class APIResponseHandler < ApplicationController

  ##
  # Load one specific user defined by it's unique
  # (1) ID or
  # (2) hash key
  def load_user(params)
    key = params[:user_key]
    if key.nil?
      key = params[:key]
    end
    if key =~ /^(\d)+$/
      User.find(key)
    else
      User.find_by_key(key)
    end
  end

  ##
  # Load one specific meeting defined by it's unique ID
  def load_meeting(params)
    id = params["meeting_id"]
    Meeting.find_by_id(id)
  end

  ##
  # Load one specific suggestion defined by it's unique ID
  def load_suggestion(params)
    id = params["suggestion_id"]
    Suggestion.find_by_id(id)
  end

  ##
  # Create a brand new suggestion instance defined by
  # @param creator The suggestion's creator
  # @param meeting The suggestion's associated meeting
  # @param params Array of params to assign the suggestion with
  # @return The created and saved suggestion instance
  def create_suggestion(creator, meeting, params)
    new_suggestion = Suggestion.create
    new_suggestion.meeting_id = meeting.id
    new_suggestion.start = params["startTime"]
    new_suggestion.end = params["endTime"]
    new_suggestion.date = params["date"]
    new_suggestion.creator_id = creator.id
    new_suggestion.save!
    # create empty votes
    meeting.participants.each do |participant|
      new_vote = Vote.create
      new_vote.suggestion_id = new_suggestion.id
      new_vote.voter_id = participant.id
      new_vote.decision = participant.id == new_suggestion.creator_id ? "yes": "?"
      new_vote.save!
      new_suggestion.votes << new_vote
    end
    new_suggestion
  end

  ##
  # Send raw data as HTTP response encoded in JSON
  def send_json(data)
    render :json => data, status: :ok
  end

  def send_ok
    render :json => {  }, status: :ok
  end

  def send_error
    render :json => {}, :status => 422
  end

  ##
  # Send raw data including the data from additional property relations as
  # HTTP response encoded in JSON
  def send_json_with_includes(data, includes)
    render :json => data.to_json(:include => includes)
  end
end