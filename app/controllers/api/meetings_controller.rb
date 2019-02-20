require_relative 'api_response_handler'
require_relative '../../services/notification_service'

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
      user = self.load_user(params)

      if user != nil
        req_meeting_type = params["type"]
        user = load_user(params)
        if req_meeting_type == nil || req_meeting_type == "all"
          meetings = user.meetings
        else
          meetings = user.meetings.select{ |meeting| meeting.is_closed == (req_meeting_type == "closed") }
        end
        self.send_json(self.convert_to_custom_json(meetings: meetings))
      else
        self.send_error 401
      end
    end

    ##
    # Fetches one specific meeting defined by it's unique ID
    def show
      user = self.load_user(params)
      meeting = load_meeting(params)

      if user != nil && meeting != nil
        self.send_json(
            meeting.to_json(:include => {
                :participants => {:only => [:id, :name, :email]},
                :suggestions => {:include => [:votes]}
            })
        )
      else
        self.send_error 401
      end
    end

    ##
    # Create a new meeting.
    # Note: Requires at least a title property as parameter and
    # optionally a pre-defined list of participant objects.
    def create
      initiator = self.load_user(params)

      if initiator != nil
        new_meeting = Meeting.create
        new_meeting.initiator_id = initiator.id
        new_meeting.location = params["meeting"]["location"]
        new_meeting.title = params["meeting"]["title"]
        new_meeting.participants << initiator
        new_meeting.save!
        self.send_json(build_custom_meeting_json(meeting: new_meeting))
      else
        self.send_error 401
      end
    end

    ##
    # Update a meeting's information.
    def update
      user = self.load_user(params)
      meeting = self.load_meeting(params)
       if user != nil and meeting != nil
         title = params["meeting"]["title"]
         if title != nil
           meeting.title = title
         end
         result = meeting.save!
          if result
            self.send_ok
          else
            self.send_error 422
          end
       else
         self.send_error 401
       end
    end

    ##
    # Delete a specific meeting given by it's id.
    def delete
      user = self.load_user(params)
      meeting = self.load_meeting(params)

      if user != nil and meeting != nil
        participants = meeting.participants
        meeting.participants.delete(participants)
        meeting.delete
        self.send_ok
      else
        self.send_error 401
      end
    end

    ##
    # Add one or multiple participants to a specific meeting.
    def add_participant
      user = self.load_user(params)
      meeting = self.load_meeting(params)
      participant_ids = params["participant_ids"]
      comment = params["comment"].nil? ? "" : params["comment"]

      if user != nil and meeting != nil and participant_ids.length > 0
        participant_ids.each do |participant_id|
          unless meeting.participants.exists?(participant_id)
            new_participant = User.find(participant_id)
            meeting.participants << new_participant
            # add default vote for the new added participant to each suggestion
            meeting.suggestions.each do |suggestion|
              suggestion.votes << Vote.new(:voter => new_participant, :decision => "?")
            end

            NotificationService.send_meeting_invitation(user, new_participant, meeting, comment)
          end
        end
        self.send_ok
      else
        self.send_error 401
      end
    end

    ##
    # Remove one or multiple participants from a specific meeting.
    def remove_participant
      user = self.load_user(params)
      meeting = self.load_meeting(params)
      participant_ids = params["participant_ids"]

      if user != nil and meeting != nil and participant_ids.length > 0
        participant_ids.each do |participant_id|
          if meeting.participants.exists?(participant_id)
            # remove all the participant's votes from each suggestion
            meeting.suggestions.each do |suggestion|
              vote = Vote.where(:voter_id => participant_id, :suggestion_id => suggestion.id)
              if vote != nil
                suggestion.votes.delete(vote)
              end
            end
            meeting.participants.delete(User.find(participant_id))
          end
        end
        self.send_ok
      else
        self.send_error 401
      end
    end

    ##
    # Get all participants associated to an explicit meeting.
    def get_participants
      user = self.load_user(params)
      meeting = self.load_meeting(params)

      if user != nil and meeting != nil
        users = meeting.participants
        send_json(users)
      else
        send_error 401
      end
    end

    ##
    # Finish the meeting planning
    def finish_planning
      user = load_user(params)
      meeting = load_meeting(params)
      if user != nil && meeting != nil
        meeting.is_closed = true
        meeting.is_cancelled = false
        location = params["location"]
        if location != nil
          meeting.location = location
        end
        meeting.save!
        suggestionsInfo = params["suggestions"]
        if suggestionsInfo != nil
          suggestionsInfo.each do |suggestionInfo|
            suggestion = Suggestion.find(suggestionInfo["id"])
            suggestion.picked = true
            suggestion.save!
          end
          comment = params["comment"] != nil ? params["comment"]: ""
          # send dates
          NotificationService.send_finished_meeting_details(user, meeting, comment, location)
          send_ok
        end
      else
        send_error 401
      end
    end

    ##
    # Convert a list of meetings to a JSON array with customized properties
    def convert_to_custom_json(meetings: Meeting[])
      json_meetings = []
      meetings.each do |meeting|
        json_meeting = build_custom_meeting_json(meeting: meeting)
        json_meetings.push(json_meeting)
      end
      json_meetings
    end

    def build_custom_meeting_json(meeting: Meeting)
      json_meeting = JSON.parse(meeting.to_json(:include => {
          # :participants => {:only => [:id]},
          # :suggestionsInfo => {
          #     :only => [:id], :include => [:votes => {:only => [:id, :decision]}]}
      }))

      if meeting.is_closed && !meeting.is_cancelled
        picked_suggestions = meeting.suggestions.select { |suggestion| suggestion.picked }
        json_meeting["suggestions"] = JSON.parse(picked_suggestions.to_json)
      end

      json_meeting["numberOfParticipants"] = meeting.participants.count
      json_meeting["numberOfSuggestions"] = meeting.suggestions.count
      json_meeting["progress"] = JSON.parse(meeting.meeting_progress.to_json)
      json_meeting
    end
    
  end
end