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
      return User.find(key)
    else
      return User.find_by_key(key)
    end
  end

  ##
  # Send raw data as HTTP response encoded in JSON
  def send_json(data)
    render :json => data, status: :ok
  end

  ##
  # Send raw data including the data from additional property relations as
  # HTTP response encoded in JSON
  def send_json_with_includes(data, includes)



    render :json => data.to_json(:include => includes)
  end
end