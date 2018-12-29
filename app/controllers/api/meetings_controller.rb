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
      req_meeting_type = params["type"]
      user = load_user(params)
      if req_meeting_type == nil || req_meeting_type == "all"
        meetings = user.meetings
      else
        meetings = user.meetings.select{ |meeting| meeting.is_closed == (req_meeting_type == "closed") }
      end
      self.send_json(self.convert_to_json(meetings: meetings))
    end

    ##
    # Convert a list of meetings to a JSON array
    def convert_to_json(meetings: Meeting[])
      json_meetings = []
      meetings.each do |meeting|
        json_meeting = JSON.parse(meeting.to_json(:include => {
            # :participants => {:only => [:id]},
            # :suggestions => {
            #     :only => [:id], :include => [:votes => {:only => [:id, :decision]}]}
        }))
        json_meeting["numberOfParticipants"] = meeting.participants.count
        json_meeting["numberOfSuggestions"] = meeting.suggestions.count
        json_meeting["progress"] = JSON.parse(meeting.meeting_progress.to_json)
        json_meetings.push(json_meeting)
      end
      json_meetings
    end
    
  end
end