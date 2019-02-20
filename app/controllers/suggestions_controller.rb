class SuggestionsController < ApplicationController

  before_action :load_parent_object, except: [:create]
  before_action :destroy_permission_violation, only: [:destroy]
  after_action :touch_dates, only: [:update, :destroy]

  # make_resourceful do
  #   build :all

  #   belongs_to :meeting, :user

  def destroy_permission_violation
    unless @suggestion.destroyable_by?(@user)
      raise PermissionViolation
    end
  end

  def touch_dates
    # "Touch" the meeting's update dates:
    touch_meeting(@suggestion.meeting)
  end

  #   response_for :index do |format|
  #     format.mobile {
  #       load_parent_object
  #       sugg_array = Array.new
  #       @meeting.suggestions.sort_by{|a| [a.date, a.start, a.end]}.each do |sugg|
  #         vote = Vote.find_by_suggestion_id_and_voter_id(sugg.id, @user.id)
  #         votes = Vote.find_all_by_suggestion_id(sugg.id)
  #         votes_array = Array.new
  #         votes.each do |v|
  #           ventry = Hash.new
  #           user = User.find_by_id(v.voter_id)
  #           display_name = user.name.blank? ? user.email : user.name
  #           ventry = {
  #             :decision => v.decision,
  #             :name => display_name
  #           }
  #           votes_array << ventry
  #         end
  #         entry = Hash.new
  #         entry = {
  #         	:id => sugg.id,
  #         	:meeting_id => @meeting.id,
  #         	:vote_id => vote.id,
  #         	:date_raw => sugg.date,
  #           :date => l(sugg.date, :format => :short_with_weekday),
  #           :start => l(sugg.start, :format => :time),
  #           :end => l(sugg.end, :format => :time),
  #           :picked => sugg.picked,
  #           :own_vote => vote.decision,
  #           :votebar => get_vote_bar_for(sugg),
  #           :votes => votes_array,
  #           :destroyable => sugg.destroyable_by?(@user),
  #           :pickable => sugg.pickable_by?(@user)
  #         }
  #         sugg_array << entry

  #       end
  #       render :json => sugg_array
  #     }
  #   end

  def show
    respond_to do |format|
      #format.html { redirect_to show_meeting_url(@user.key, @meeting.id) }
      format.html { redirect_to user_meeting_path(@user.key, @meeting.id) }
      format.js { render :file => 'suggestions/update.js.erb' }
    end
  end

  def new
    @sugg = Suggestion.new
  end

  def create
    @user = User.find_by_key(params[:user_id])
    @meeting = Meeting.find(params[:meeting_id])
    @suggestion = Suggestion.create(suggestion_params)

    @suggestion.meeting.participants.each do |participant|
      vote = Vote.create(:voter => participant,
                         :decision => Vote::DONTKNOW,
                         :suggestion => @suggestion)
      # The creator of the suggestion automatically votes for "yes":
      if participant == @user
        vote.decision = Vote::YES
      end
      vote.save!
      # Add the new vote:
      @suggestion.votes << vote
      @suggestion.save!
    end

    if @suggestion
      flash[:notice] = t("notices.suggestion_created")
      respond_to do |format|
        format.js
        format.html { redirect_to user_meeting_path(@user.key, @meeting) }
        # format.mobile
        # format.iphone_native { render :file => "suggestions/create_iphone_native.haml" }
        # format.android_native { render :file => "suggestions/create_android_native.haml" }
      end
    else
      flash[:alert] = t("alerts.suggestion_not_created")
      respond_to do |format|
        format.js { render :file => "shared/show_errors.js.erb" }
        # format.iphone_native { render :file => "shared/show_errors_iphone_native.js.erb", :status => 500 }
      end
    end
  end

  #def edit
  #  #@suggestion = Suggestion.find_by(params[:id])
  #  respond_to do |format|
  #    format.js {  }
  #  end
  #end

  def update
    params[:suggestion].delete(:meeting_id)
    @suggestion = Suggestion.find_by_id(params[:id])

    unless @suggestion.updatable_by?(@user)
      raise PermissionViolation
    end

    # Does the user want to reset the votes?
    @reset_votes = (params[:reset_votes] && params[:reset_votes] == "true")

    if @reset_votes
      @suggestion.votes.each do |v|
        v.decision = Vote::DONTKNOW
        v.save!
      end
    end

    # Remember what was updated in what way,
    # in order to react to
    # it accordingly in the response:
    @update_method = :inplace
    if params[:suggestion][:start] || params[:suggestion][:end]
      @update_method = :only_day
    end
    if params[:suggestion][:date] || @reset_votes
      @update_method = :complete
    end

    !@suggestion.update_attributes(suggestion_params)
    respond_to do |format|
      flash[:notice] = t("notices.suggestion_updated")
      format.js { @update_method ||= :inplace }
      format.html { redirect_to show_meeting_url(@user.key, @meeting) }
      # format.mobile { render :text => get_vote_bar_for(@suggestion) }
      # format.iphone_native { render :file => "suggestions/update_iphone_native.haml" }
      # format.android_native { render :file => "suggestions/update_android_native.haml" }
    end
  end

  def pick
    @suggestion = Suggestion.find_by(params[:suggestion_id])

    unless @suggestion.pickable_by?(@user)
      raise PermissionViolation
    end

    @picked_status = :not_picked
    if @suggestion.picked?
      @picked_status = :picked
    end

    !@suggestion.update_attributes(suggestion_params)
    respond_to do |format|
      format.js { @picked_status ||= :not_picked }
      format.html { redirect_to show_meeting_url(@user.key, @meeting) }
    end
  end

  def destroy
    @suggestion.destroy
    flash[:notice] = t("notices.suggestion_deleted")
    respond_to do |format|
      format.js
      format.html { redirect_to show_meeting_url(@user.key, @meeting) }
      # format.mobile { render :nothing => true }
      # format.iphone_native { render :file => "suggestions/destroy_iphone_native.haml" }
      # format.android_native { render :text => "success" }
    end
  end

  private

  # Overwrites make-resourceful method:
  def load_parent_object
    load_user
    load_meeting
    load_suggestion
  end

  # Votebar Infos
  # Returns the percentual correct voting bar
  # for the given suggestion as HTML td elements.
  def get_vote_bar_for(suggestion)

    decision_array = [Vote::NO, Vote::MAYBE, Vote::YES, Vote::DONTKNOW]

    css_classes = { Vote::NO => "red",
                    Vote::MAYBE => "yellow",
                    Vote::YES => "green",
                    Vote::DONTKNOW => "white"
    }

    vote_groups = Hash.new

    # Create a hash which contains a key for each possible decision,
    # and has the corresponding votes as values:
    suggestion.votes.each do |vote|
      vote_groups[vote.decision] ||= Array.new
      vote_groups[vote.decision] << vote
    end

    # Search for the last decision which has votes
    # (i.e. first "?", then "no", ...)
    last_bar = Vote::NO
    decision_array.reverse_each do |decision|
      if vote_groups.has_key?(decision)
        last_bar = decision
        break
      end
    end

    votes_total = suggestion.votes.length
    vote_bar = ""
    total_percent = 0
    # As we cannot iterate in a sorted way over the Hash's keys,
    # sort it first (and make it an array of two-element arrays that way):
    vote_groups = vote_groups.sort do |group_a,group_b|
      a = group_a.first
      b = group_b.first
      if a == b then 0
      elsif a == Vote::NO || b == Vote::DONTKNOW
      then 1
      elsif b == Vote::NO || a == Vote::DONTKNOW
      then -1
      elsif a == Vote::MAYBE
      then 1
      else
        0
      end
    end

    vote_groups.reverse_each do |vote_group|
      decision = vote_group.first
      votes = vote_group.second
      css_class = css_classes[decision]
      count = votes.length

      # Avoid a total percent of less than 100:
      if decision == last_bar
        # By giving the last bar the remaining percentage:
        percent = 100 - total_percent
      else
        percent = (count * 100.0 / votes_total).round
        # Avoid percentages over 100% - clip the new percentage
        # to at most what is missing to 100:
        if total_percent + percent > 100
          percent = 100 - total_percent
        end
      end
      total_percent += percent
      vote_bar << "<div class='#{css_class}' style='width: #{percent}%;'></div>"
    end
    return vote_bar
  end

  private
  def suggestion_params
    params.require(:suggestion).permit(:id, :meeting_id, :date, :start, :end,
                                       :created_at, :updated_at, :creator_id,
                                       :picked)
  end

end
