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
        self.send_error
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
        self.send_error
      end
    end

    ##
    # Create a new meeting.
    # Note: Requires at least a title property as parameter and
    # optionally a pre-defined list of participant objects.
    def create
      initiator = self.load_user(params)
      participants_list = params["participants"]
      suggestions_list = params["suggestions"]

      if initiator != nil
        new_meeting = Meeting.create
        new_meeting.initiator_id = initiator.id
        new_meeting.title = params["meeting"]["title"]
        new_meeting.participants << initiator
        new_meeting.save!

        # assign participants
        if participants_list != nil
          participants_list.each do |participant_params|
            if participant_params != nil && participant_params["id"] != nil && participant_params["id"] > -1
              user = User.find(participant_params["id"])
              if user != nil
                  new_meeting.participants << user
              end
            else
              # check if user is not already recorded in TeaCo via his/her email
              user = User.find_by_email(participant_params["email"])
              if user != nil
                new_meeting.participants << user
              else
                # create a brand new user and invite him to teaco
                new_user = User.create
                new_user.email = participant_params["email"]
                new_user.save!
                new_meeting.participants << new_user
                NotificationService.send_account_confirmation(new_user)
              end
            end
          end
          new_meeting.save!
        end
        # assign suggestions
        if suggestions_list != nil
          suggestions_list.each do |suggestion_params|
            if suggestion_params != nil && suggestion_params["date"] != nil && suggestion_params["startTime"] != nil && suggestion_params["endTime"] != nil
              self.create_suggestion(initiator, new_meeting, suggestion_params)
            end
          end
          new_meeting.save!
        end
        self.send_json(build_custom_meeting_json(meeting: new_meeting))
      else
        self.send_error
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
            self.send_error
          end
       else
         self.send_error
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
        self.send_error
      end
    end

    ##
    # Add one or multiple participants to a specific meeting.
    def add_participant
      user = self.load_user(params)
      meeting = self.load_meeting(params)
      participant_ids = params["participant_ids"]

      if user != nil and meeting != nil and participant_ids.length > 0
        participant_ids.each do |participant_id|
          unless meeting.participants.exists?(participant_id)
            new_participant = User.find(participant_id)
            meeting.participants << new_participant
            # add default vote for the new added participant to each suggestion
            meeting.suggestions.each do |suggestion|
              suggestion.votes << Vote.new(:voter => new_participant, :decision => "?")
            end

            NotificationService.send_meeting_invitation(user, new_participant, meeting, "")
          end
        end
        self.send_ok
      else
        self.send_error
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
        self.send_error
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
      json_meeting
    end
    
  end
end