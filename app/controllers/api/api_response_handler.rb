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

  def load_suggestion(params)
    id = params["suggestion_id"]
    Suggestion.find_by_id(id)
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