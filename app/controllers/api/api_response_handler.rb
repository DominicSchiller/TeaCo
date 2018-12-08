##
# Abstract API response handler which defines methods
# for sending the requested data in various encoding formats.
class APIResponseHandler < ApplicationController
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