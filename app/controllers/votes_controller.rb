class VotesController < ApplicationController

  before_action :load_dependent

  # make_resourceful do
  #   build :all

  #   belongs_to :suggestion, :meeting, :user

  #   response_for :update do |format|
  #     format.js { render :file => 'suggestions/update.js.erb' }
  #     format.html { redirect_to show_meeting_url(@user.key, @meeting.id) }
  #     format.mobile { render :file => 'votes/update_mobile.haml' }
  #     format.iphone_native { render :file => 'votes/update_iphone_native.haml' }
  #     format.ipad_native { render :file => 'votes/update_ipad_native.haml' }
  #     format.android_native { render :file => 'votes/update_android_native.haml' }
  #   end

  # end

  def create
    @vote = Vote.create(vote_params)
  end

  def update
    @vote = Vote.find_by_id(params[:id])
    @vote.update_attributes(vote_params)
    respond_to do |format|
      format.html { redirect_to show_meeting_url(@user.key, @meeting.id) }
      format.js { render :file => 'suggestions/update.js.erb' }
    end
    # "Touch" the meeting's update dates:
    touch_meeting(@vote.suggestion.meeting)
  end

  def destroy
    @vote.destroy

    respond_to do |format|
      format.html { redirect_to show_meeting_url(@user.key, @meeting.id) }
      format.js { render :file => 'suggestions/update.js.erb' }
    end
  end

  def show
    @votes = @suggestion.votes
  end

  protected

  def load_dependent
    load_user
    load_meeting
    load_suggestion
    @votes = @suggestion.votes
  end

  private

  def vote_params
    params.require(:vote).permit(:id, :decision, :suggestion_id, :voter_id, :created_at, :updated_at)
  end

end
