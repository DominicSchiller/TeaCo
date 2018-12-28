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
      user = load_user(params)
      meetings = user.meetings

      req_meeting_type = params["type"]

      json = JSON.parse(meetings.to_json(:include => {
          :participants => {:only => [:id]},
          :suggestions => {
              :only => [:id, :picked], :include => [:votes => {:only => [:id, :decision]}]}}))

      filtered_meetings = []

      json.each do |meeting|
        meeting["isClosed"] = false
        meeting["numberOfParticipants"] = meeting["participants"].count
        meeting["numberOfSuggestions"] = meeting["suggestions"].count

        pending_count = 0
        started_count = 0
        completed_count = 0
        # meeting["participants"] = Array.new(meeting["participants"].count) { Hash.new }
        meeting["suggestions"].each do |suggestion|
          meeting["isClosed"] = suggestion["picked"]
          voted_counter = 0
          suggestion["votes"].each do |vote|
            voted_counter += vote["decision"] != "?" ? 1: 0
          end
          case voted_counter
          when 0
            pending_count += 1
          when meeting["numberOfParticipants"]
            completed_count += 1
          else
            started_count += 1
          end
        end

        if (req_meeting_type == nil || req_meeting_type == "all") ||
            (req_meeting_type == "closed" &&  meeting["isClosed"] == true) ||
            (req_meeting_type == "open" &&  meeting["isClosed"] == false)
          meeting.delete("participants")
          meeting.delete("suggestions")
          meeting["progress"] = {}
          meeting["progress"]["pending"] = pending_count / meeting["numberOfSuggestions"]
          meeting["progress"]["started"] = started_count / meeting["numberOfSuggestions"]
          meeting["progress"]["completed"] = completed_count / meeting["numberOfSuggestions"]
          filtered_meetings.push(meeting)
        end
      end

      # self.send_json_with_includes(meetings, [:participants, :initiator, :suggestions])s
      # self.send_json(json)
      self.send_json(filtered_meetings)
    end

  end
end