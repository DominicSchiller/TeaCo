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
      self.send_json(self.convert_to_custom_json(meetings: meetings))
    end

    ##
    # Fetches one specific meeting defined by it's unique ID
    def show
      meeting = load_meeting(params)
      self.send_json(
        meeting.to_json(:include => {
            :participants => {:only => [:id, :name, :email]},
            :suggestions => {:include => [:votes]}
        })
      )
    end

    ##
    # Create a new meeting.
    # Note: Requires at least a title property as parameter and
    # optionally a pre-defined list of participant objects.
    def create
      creator = self.load_user(params)
      participants_list = params["participants"]

      if creator != nil
        new_meeting = Meeting.create
        new_meeting.initiator_id = creator.id
        new_meeting.title = params["meeting"]["title"]
        new_meeting.participants << creator
        new_meeting.save!

        if participants_list != nil
          participants_list.each do |participant_params|
            user = User.find(participant_params["id"])
            if participant_params != nil
              new_meeting.participants << user
            end
          end
          new_meeting.save!
        end

        self.send_json(new_meeting)
      else
        self.send_error
      end
    end
    ##
    # Convert a list of meetings to a JSON array with customized properties
    def convert_to_custom_json(meetings: Meeting[])
      json_meetings = []
      meetings.each do |meeting|
        json_meeting = JSON.parse(meeting.to_json(:include => {
            # :participants => {:only => [:id]},
            # :suggestions => {
            #     :only => [:id], :include => [:votes => {:only => [:id, :decision]}]}
        }))

        if meeting.is_closed && !meeting.is_cancelled
          picked_suggestions = meeting.suggestions.select { |suggestion| suggestion.picked }
          json_meeting["suggestions"] = JSON.parse(picked_suggestions.to_json)
        end

        json_meeting["numberOfParticipants"] = meeting.participants.count
        json_meeting["numberOfSuggestions"] = meeting.suggestions.count
        json_meeting["progress"] = JSON.parse(meeting.meeting_progress.to_json)
        json_meetings.push(json_meeting)
      end
      json_meetings
    end
    
  end
end