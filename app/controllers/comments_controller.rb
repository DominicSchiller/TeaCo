class CommentsController < ApplicationController
  before_action :load_parent_object
  before_action :user_has_rights, only: [:update, :destroy]
  after_action :comment_notification, only: [:create, :update]

  def create
    @comment = @meeting.comments.create(comment_params)
    if @comment
      flash[:notice] = t("notices.comment_created")
      respond_to do |format|
        format.html { redirect_to user_meeting_path(@user, @meeting) }
        format.js
        # format.mobile
        # format.iphone_native { render :file => 'comments/create_iphone_native.haml' }
        # format.android_native { render :file => 'comments/create_android_native.haml' }
      end
    else
      flash[:alert] = t("alerts.error")
      respond_to do |format|
        format.html { redirect_to user_meeting_path(@user, @meeting) }
        format.js { render :file => "shared/show_errors.js.erb" }
      end
    end
  end

  def comment_notification
    # If an email-copy to all participants is
    # requested, do so:
    if params[:also_mail] == "1"
      @meeting.participants.each do |user|
        I18n.locale = user.language
        TeacoMailer.comment_notification(@comment, user).deliver
        # Add message to push service (exclude author)
        if user != @comment.author
          PushService.add_comment_notification(@comment, user)
        end
      end
      # Push added messages
      PushService.send_notifications()
      I18n.locale = @user.language
    end
    touch_meeting(@comment.meeting)
  end


  def user_has_rights
    @comment = Comment.find_by_id(params[:id])
    # TODO: Mit den Manipulationsmoeglichkeiten von TeaCo sollte diese
    # Exceptions eigentlich nicht geworfen werden, aber als Webservice
    # kanns passieren => dann geeignet rescuen und drauf reagieren:
    unless @comment.manipulable_by?(@user)
      raise PermissionViolation
    end
  end

  def index
    @comments = Comment.all.paginate(page: params[:page], per_page: 10)
    #respond_to :index do |format|
      # format.mobile {
      #   comments_array = Array.new
      #   @comments.reverse_each do |comment|
      #     entry = Hash.new
      #     user = User.find_by_id(comment.author_id)
      #     manipulable = comment.manipulable_by?(@user)
      #     if !user.name.blank?
      #       name = user.name
      #     else
      #       name = user.email
      #     end
      #     entry = {
      #       :id => comment.id,
      #       :author => name,
      #       :author_id => comment.author_id,
      #       :text => comment.text,
      #       :text_formatted => textilize(html_escape(comment.text)),
      #       :manipulable => manipulable
      #     }
      #     comments_array << entry
      #   end
      # render :json => comments_array
      # }
    # end
  end

  def destroy
    if @comment.destroy
      flash[:notice] = t("notices.comment_destroyed")
      respond_to do |format|
        format.html
        format.js  { render :file => 'comments/destroy.js.erb' }
        # format.mobile
        # format.iphone_native { render :file => 'comments/update_iphone_native.js.erb' }
        # format.android_native { render :file => 'comments/update_android_native.haml' }
      end
    else
      respond_to do |format|
        format.html
        format.js { render :file => "shared/show_errors.js.erb" }
      end
    end
  end

  def edit
    @comment = Comment.find(params[:id])
    @meeting = Meeting.find(params[:meeting_id])
    @user = User.find(params[:user_id])
    respond_to do |format|
      format.js { render file: "comments/edit.js.erb", layout: false, locals: { comment: @comment} }
    end
  end

  def update
    if @comment.update_attributes(comment_params)
      flash[:notice] = t("notices.comment_updated")
      respond_to do |format|
        format.html
        format.js  { render :file => 'comments/update.js.erb' }
        # format.mobile
        # format.iphone_native { render :file => 'comments/update_iphone_native.js.erb' }
        # format.android_native { render :file => 'comments/update_android_native.haml' }
      end
    else
      flash[:alert] = t("alerts.error")
      respond_to do |format|
        format.html
        format.js { render :file => "shared/show_errors.js.erb" }
      end
    end
  end

  def show
    @comment = Comment.find_by_id(params[:id])
    respond_to do |format|
      format.html { render :template => 'comments/show', :layout => false }
      format.js  { render :file => 'comments/update.js.erb' }
      # format.mobile
      # format.iphone_native { render :file => 'comments/update_iphone_native.js.erb' }
      # format.android_native { render :file => 'comments/update_android_native.haml' }
    end

  end

  private

  # Overwrites make_resourceful method:
  def load_parent_object
    load_user
    load_meeting
  end

  def comment_params
    params.require(:comment).permit(:id, :author_id, :meeting_id, :text, :created_at, :updated_at)
  end

end
