##
# Abstract API response handler which defines methods
# for sending the requested data in various encoding formats.
class APIResponseHandler < ApplicationController
  ##
  # Send HTTP response encoded in JSON
  def send_json(data)
    render :json => data, status: :ok
  end

end