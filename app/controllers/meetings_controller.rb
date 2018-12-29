class MeetingsController < ApplicationController

  layout "meetings", :only => [:show]

  #include Helper for time_ago_in_words
  include ActionView::Helpers::DateHelper

  before_action :load_object
  before_action :set_language
  #before_action :check_destroyable, only: [:destroy]
  #after_action :clone_meeting, only: [:create]

  # make_resourceful do
  #   build :all

  # belongs_to :user

  after_action only: :create do
    if params[:clone] && cloned = Meeting.find_by_id(params[:clone])
      @meeting.participants |= cloned.participants
    else
      @meeting.participants << @user
    end
  end

  before_action only: :destroy do
    unless @meeting.destroyable_by?(@user)
      raise PermissionViolation
    end
  end


  #def clone_meeting
  #  if params[:clone] && cloned = Meeting.find_by_id(params[:clone])
  #    @meeting.participants |= cloned.participants
  #  else
  #    @meeting.participants << @user
  #  end
  #end

  #def check_destroyable
  #  unless @meeting.destroyable_by?(@user)
  #    raise PermissionViolation
  #  end
  #end

  def new
    @meeting ||= Meeting.new
    @meeting = Meeting.create(meeting_params)
    @meeting.is_closed = false
    @meeting.is_cancelled = false
    @meeting.location = ""
    @meeting.save!
    render :layout => false, :template => 'meetings/new.haml'
  end

  def update
    @meeting = Meeting.find(params[:id])
    unless @meeting.updatable_by?(@user)
      raise PermissionViolation
    end

    if @meeting.update_attributes(meeting_params)
      flash[:notice] = t("notices.meeting_updated")
      respond_to do |format|
        format.html { redirect_to show_meeting_path }
        format.js { render layout: false }
      end
    else
      flash[:alert] = t("alerts.error")
    end

    # "Touch" the meeting's update dates:
    touch_meeting(@meeting)
  end

  #   response_for :index do |format|
  #  format.mobile {
  #    load_user
  #       meetings_array = Array.new
  #       @user.meetings.each do |meeting|
  #         state = "1" #bereits abgestimmt

  #         voted = true
  #         meeting.suggestions.each do |sugg|
  #           votes = Vote.find_all_by_suggestion_id_and_voter_id(sugg.id, @user.id)
  #           votes.each do |v|
  #             if v.decision == "?"
  #               voted = false
  #             end
  #           end
  #         end

  #         if !voted
  #           state = "0" #noch nicht abgestimmt
  #         end

  #         initiator = false
  #         if meeting.initiator_id == @user.id
  #           initiator = true #eigenes meeting
  #         end

  #         entry = Hash.new
  #         entry = {
  #           :id => meeting.id,
  #           :title => meeting.title,
  #           :state => state,
  #           :restricted => "#{meeting.restricted}",
  #           :initiator_id => meeting.initiator_id,
  #           :updated_at => meeting.updated_at,
  #           :updated_at_in_words => time_ago_in_words(meeting.updated_at),
  #           :initiator => "#{initiator}"
  #         }
  #         meetings_array << entry
  #       end
  #       render :json => meetings_array
  #     }
  #   end

  #   response_for :show_fails do |format|
  #     format.html {
  #       I18n.locale = browser_language
  #       @page_title = I18n.t('errors.not_found')
  #       @user = nil
  #       render :template => "layouts/not_found_#{I18n.locale}.haml", :layout => "users"
  #     }
  #     format.mobile {
  #       redirect_to show_administration_url
  #     }
  #     format.iphone_native {
  #       render :file => "layouts/not_found.iphone_native.haml", :status => 404
  #     }
  #   end

  #   response_for :edit do |format|
  #     format.html { render :file => "meetings/edit.haml" }
  #     format.js { render :file => "meetings/edit.haml" }
  #   end

  #   response_for :update do |format|
  #     format.html
  #     format.js
  #     format.mobile
  #     format.iphone_native { render :file => "meetings/update.iphone_native.haml" }
  #     format.android_native { render :file => "meetings/update.android_native.haml" }
  #   end

  def show
    set_language
    unless @meeting.viewable_by?(@user)
      raise PermissionViolation
      #flash[:notice] = "Du bist kein Teilnehmer dieses Meetings und hast daher keinen Zugriff darauf"
      #redirect_to show_administration_path(:user_key => @user.key)
    end
    # Before rendering the suggestion view, update all participants
    # free/busy data once, so it is up to date:
    # (only if last update is older than 15 minutes)
    @meeting.participants.each do |user|
      if user.updated_at < 15.minutes.ago
        user.update_freebusy_data
      end
    end
  end

  def create
    @meeting = Meeting.create(meeting_params)
    @meeting.is_closed = false
    @meeting.is_cancelled = false
    @meeting.location = ""
    @meeting.save!

    if @meeting.present? && @meeting.valid?
      flash[:notice] = t("notices.meeting_created")
      respond_to do |format|
        format.html { redirect_to user_meeting_url(@user, @meeting) }
        format.js { render :js => "location.href = '#{show_meeting_url(@user, @meeting)}';" }
        # format.mobile { render :json => @meeting }
        # format.iphone_native { render :file => "meetings/new.iphone_native.haml" }
        # format.ipad_native { render :file => "meetings/new.ipad_native.haml" }
        # format.android_native { render :file => "meetings/new.android_native.haml" }
      end
    else
      flash[:alert] = t("alerts.error")
      respond_to do |format|
        format.html { render :file => "shared/show_errors.js.erb" }
        format.js { render :file => "shared/show_errors.js.erb" }
        # format.mobile
        # format.iphone_native { render :file => "shared/show_errors_iphone_native.js.erb", :status => 500 }
        # format.android_native { render :text => "" }
      end
    end
  end

  def destroy
    @meeting.destroy
    flash[:notice] = t("notices.meeting_destroyed")
    respond_to do |format|
      format.html { redirect_to show_administration_url(@user) }
      format.js { render :file => 'meetings/destroy.js.erb', layout: false, locals: { user_meetings: @user.meetings } }
      # format.mobile
      # format.iphone_native { render :file => "meetings/destroy_iphone_native.js.erb" }
      # format.android_native { render :text => "success" }
    end
  end

  # end

  # def get_meetinginfos
  #   load_object # Load the user and the meeting

  #   respond_to do |format|
  #     format.mobile {
  #       meeting_array = Array.new

  #       # Try to find a user to that address:
  #       user = User.find_by_id(@meeting.initiator_id)

  #       if !user.name.blank?
  #         name = user.name
  #       else
  #         name = user.email
  #       end

  #       entry = Hash.new
  #       entry = {
  #         :id => @meeting.id,
  #         :title => @meeting.title,
  #         :restricted => @meeting.restricted,
  #         :initiator_id => @meeting.initiator_id,
  #         :initiator_name => name,
  #         :participants_cnt => @meeting.participants.count
  #       }
  #       meeting_array << entry
  #       render :json => meeting_array
  #     }
  #   end
  # end

  # def get_participants
  #   load_object # Load the user and the meeting
  #   respond_to do |format|
  #     format.mobile {
  #       participants_array = Array.new
  # @meeting.participants.each do |participant|
  #         display_name = participant.name.blank? ? participant.email : participant.name
  #         isInitiator = false
  #         if participant == @meeting.initiator
  #           isInitiator = true
  #         end
  #         entry = Hash.new
  #         entry = {
  #           :id => participant.id,
  #           :user_id => @user.id,
  #           :address => participant.email,
  #           :display_name => display_name,
  #           :isInitiator => isInitiator
  #         }
  #         participants_array << entry
  #       end
  #       render :json => participants_array
  #     }
  #   end
  # end

  # invite_participants responds to GET and POST requests, so behaviour
  # differs according to the method:
  # - GET: returns the form to enter new participants into
  # - POST: must be called with the list (i.e. the string) of
  # addresses to add in the params[:participants] in the params-hash,
  # these addresses will then be added to the list of participants.
  def invite_participants
    load_object # Load the user and the meeting

    if request.request_method == :get
      render :partial => "invitation_form"
      return
    end

    participants = params[:participants]
    participants = split_addresses participants

    text = params[:message] || ""
    # The comment text (in case it's needed later):
    comment_text = text + "\n\n *_" + I18n.t('invited_users') + "_*  "
    first = true

    # Add these users to our meeting:
    participants.each do |email|
      # Check if each of these users already has got an account on TeaCo or
      # otherwise create one for him:
      user = User.find_or_create({ :email => email })
      if @meeting.participants.include?(user)
        addition = unless user.name.blank?
                     " (#{user.name})"
                   else
                     if email != user.email
                       " (#{user.email})"
                     else
                       ""
                     end
                   end
        add_flash_notice_for_double_user(email + addition)
        next
      end
      # Insert the user into the meeting's participants list:
      @meeting.participants << user
      # And create a "?"-vote for him in each suggestion of the meeting:
      @meeting.suggestions.each do |sugg|
        sugg.votes << Vote.new(:voter => user, :decision => "?")
      end
      # Add the user to the comment text:
      comment_text << if first then " " else ", " end
      first = false
      comment_text << (user.name.blank? ? user.email : user.name)
      # Send an invitation mail to the user:
      I18n.locale = user.language
      TeacoMailer.invitation(user, @meeting, @user, text).deliver
      # Add message to push service
      PushService.add_invitation(user, @meeting, @user)
    end
    # Push added messages
    PushService.send_notifications()

    # Restore user's locale:
    I18n.locale = @user.language

    # If the user want's to enter the invitation text as a comment
    # as well, do so:
    if params[:also_comment] == "1" && !text.blank?
      @meeting.comments << Comment.new(
          :author_id => @user.id,
          :text => comment_text)
    end

    # Whenever someone invites you or you invite someone, you "get in touch"
    # with all the meetings participants, so update or create the known_addresses
    # for everyone here:
    @meeting.participants.each do |partic|
      addresses_to_know = @meeting.participants.select{
          |user| user != partic  }.map{
          |user| user.email }.concat( participants.select{ |address| address != partic.email  })


      addresses_to_know.each do |address|
        KnownAddress.update_or_create(address, partic)
      end

    end

    # Finally, "touch" the meetings update dates:
    touch_meeting(@meeting)

    respond_to do |format|
      flash[:notice] = t("notices.participant_invited")
      format.html { redirect_to user_meeting_url(@user, @meeting) }
      format.js { render(:layout => false) }
      # format.mobile
      # format.iphone_native { render :file => "meetings/invite_participants_iphone_native.haml" }
      # format.android_native { render :file => "meetings/invite_participants_android_native.haml" }
    end

  end

  # Removes each participant whose ID is listed in params[:participant_ids]
  # (which is either an Array or a Hash with the IDs in its values)
  # from the current meeting (if the current user has the right to do this).
  # All votes cast by the deleted participants are used as well.
  def uninvite_participants
    load_object
    participants = params[:participant_ids]
    if participants.nil?
      # TODO: Fehlermeldung (500, Serverfehler)
      return
    end
    if participants.is_a? Hash
      participants = participants.values
    end
    unless participants.is_a? Array
      # TODO: Fehlermeldung (500, Serverfehler)
      return
    end
    participants.map! { |id| User.find_by_id(id)}
    participants.compact! # Remove nil elements where no user was found
    participants.delete_if { |user| @meeting.initiated_by?(user) } # Never remove the initiator!
    # Remove votes cast by the deleted users:
    @meeting.suggestions.each do |suggestion|
      votes = suggestion.votes.select { |vote| participants.include?(vote.voter)}
      suggestion.votes.delete(votes)
    end
    # Remove the users themselves:
    @meeting.participants.delete participants
    @meeting.save!

    # "Touch" the meetings update dates:
    touch_meeting(@meeting)
    respond_to do |format|
      flash[:notice] = t("notices.participant_uninvited")
      format.html { redirect_to user_meeting_path(@user, @meeting) }
      format.js {}
      # format.mobile {}
      # format.iphone_native { render :file => "meetings/uninvite_participants_iphone_native.haml" }
      # format.android_native { render :file => "meetings/uninvite_participants_android_native.haml" }
    end
  end

  def send_message_form
    render :partial => "meetings/send_message_form"
  end

  # send_message responds to GET and POST requests, so behaviour
  # differs according to the method:
  # - GET: returns the form to enter a message
  # - POST: confirms the message and delivers an email with the
  # message to all selected participants. Therefor the message must
  # be sent in +params[:message]+ and the user-IDs of all recipients
  # in +params[:participant_ids], either as an Array or a Hash
  # the IDs in its values.
  def send_message
    load_object # Load the user and the meeting

    # This was a POST-request, so deliver the email with
    # the message:
    message = params[:message] || ""
    recipients = params[:participant_ids]
    if recipients.nil?
      # TODO: Fehlermeldung (500, Serverfehler)
      flash[:alert] = t("alerts.error")
      return
    end
    if recipients.is_a? Hash
      recipients = recipients.values
    end
    unless recipients.is_a? Array
      # TODO: Fehlermeldung (500, Serverfehler)
      flash[:alert] = t("alerts.error")
      return
    end
    recipients.map! { |id| User.find_by_id(id)}
    recipients.each do |recipient|
      I18n.locale = recipient.language
      TeacoMailer.user_message(recipient, message, @meeting, @user).deliver
      # Add message to push service
      PushService.add_user_message(recipient, message, @meeting, @user)
    end
    # Push added messages
    PushService.send_notifications()

    I18n.locale = @user.language

    respond_to do |format|
      flash[:notice] = t("notices.message_sent")
      format.html
      format.js
      # format.mobile
      # format.iphone_native
      # format.android_native { render :text => "success" }
    end

  end

  # send_dates responds to GET and POST requests, so behaviour
  # differs according to the method:
  # - GET: returns the form to confirm sending of dates
  # - POST: confirms date sending and delivers an email to
  # all participants, containing the final dates as a file attachment.
  def send_dates
    load_object # Load the user and the meeting

    @meeting.is_closed = true
    @meeting.is_cancelled = false
    @meeting.location = params[:location]
    @meeting.save!

    if request.request_method == :get
      render :partial => "meetings/send_dates_form"
      return
    end

    # This was a POST-request, so deliver the email with
    # the final dates:
    message = params[:message] || ""
    comment_text = message + "\n\n  _*" + I18n.t('final_dates') + "*_ \n\n"
    first = true
    location = params[:location] || ""
    final_dates = ""
    @meeting.picked_suggestions.each do |suggestion|
      final_dates << ("\n* #{l(suggestion.date, :format => :short_with_weekday)}: #{suggestion.start_as_readable} - #{suggestion.end_as_readable}")
    end
    @meeting.participants.each do |participant|
      I18n.locale = participant.language
      TeacoMailer.dates_confirmation(participant, message, @meeting, @user, location).deliver
      # Add message to push service (exclude sending user)
      if participant != @user
        PushService.add_final_dates_confirmation(participant, @meeting, final_dates, location)
      end
    end

    # If the user want's to enter the message text as a comment
    # as well, do so:
    if params[:also_comment] == "1" && !message.blank?
      @meeting.picked_suggestions.each do |suggestion|
        comment_text << ("*   #{ l(suggestion.date, :format => :short_with_weekday) }: #{suggestion.start_as_readable} - #{suggestion.end_as_readable}#{(', ' + location) unless location.blank?} \n")
      end
      @meeting.comments << Comment.new(
          :author_id => @user.id,
          :text => comment_text)
    end

    # Push added messages
    PushService.send_notifications()

    I18n.locale = @user.language

    respond_to do |format|
      flash[:notice] = t("notices.date_sent")
      format.html { redirect_to user_meeting_path(@user, @meeting) }
      format.js
      # format.mobile
      # format.iphone_native { render :file => "meetings/send_dates_iphone_native.haml" }
      # format.android_native { render :file => "meetings/send_dates_android_native.haml" }
    end

  end

  # send_cancellation responds POST requests, so behaviour
  # - POST: cancels meeting planning and delivers an email to
  #         all participants to inform about the cancellation.
  def send_cancellation
    # TODO: add sending mail and push notification
    load_object
    @meeting.is_closed = true
    @meeting.is_cancelled = true
    @meeting.location = ""
    @meeting.save!

    respond_to do |format|
      format.html {
        redirect_to show_meeting_url(@user.key, @meeting)
      }
      format.js
    end
  end

  # Removes the current user from the meeting. (Accepts this only as a DELETE
  # request).
  def leave
    # load_object

    @meeting.suggestions.each do |suggestion|
      to_delete = suggestion.votes.select { |vote| vote.voter == @user }
      suggestion.votes.delete(to_delete)
    end

    @meeting.participants.delete @user

    if @meeting.participants.empty?
      @meeting.destroy
    end

    # "Touch" the meeting's update dates:
    touch_meeting(@meeting)

    respond_to do |format|
      flash[:notice] = t("notices.meeting_leaved")
      format.html
      format.js { render :file => 'meetings/destroy.js.erb', layout: false, locals: { user_meetings: @user.meetings } } # TODO user_id mitgeben?
      # format.mobile { render :nothing => true }
      # format.iphone_native { render :file => "meetings/destroy_iphone_native.js.erb" }
      # format.android_native { render :text => "success" }
    end
  end

  private

  def load_object
    load_user
    # In case "new" or "create" was called, the newley created meeting is
    # stored in @current_object:
    if @current_object
      @meeting = @current_object
    else
      load_meeting
    end
  end

  def parent_object
    @parent_object ||= parent_model.find_by_key(params["#{parent_name}_id"])
  end

  # Splits a string of adresses into an array of single addresses,
  # according to a set of rules
  def split_addresses(address_string)
    address_string = address_string.gsub(/[;,]/," ") # replace all ; and , with spaces
    address_string = address_string.squeeze(" ") # remove multiple spaces ("   " => " ")
    result_array = address_string.split(" ") # return the array that consists of single adresses
    addresses = Array.new
    result_array.each do |string|
      if string =~ email_address_regex
        matcher = email_address_regex.match string
        addresses << the_real_email_address_without_braces = matcher[0]
      else
        @meeting.errors.add string, t('activerecord.errors.messages.no_valid_email')
      end
    end
    return addresses
  end

  def add_flash_notice_for_double_user(email)
    notice = t('activerecord.errors.messages.is_already_invited')
    @meeting.errors.add email, notice
  end

  private

  def meeting_params
    params.require(:meeting).permit(:id, :title, :created_at, :updated_at, :initiator_id, :restricted)
  end

end
