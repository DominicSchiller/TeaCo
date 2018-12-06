class UsersController < ApplicationController

  # make_resourceful do
  #   # build all REST-actions except index, as an
  #   # overview about all users must not be public
  #   build :new, :create, :edit, :show, :update, :destroy

  #before_action :build_object
  before_action :load_object
  before_action :set_language
  before_action :disallow_update_email, only: [:update]

  after_action :update_freebusy_information, only: [:update]
  after_action :send_confirmation, only: [:create]

  #validates_presence_of :user

  layout "users", :only => [:new, :show]

  def new
  end

  def index
    print("Hello World")
  end

  def create
    @user = User.create(user_params)

    if @user.valid?
      flash[:notice] = t("notices.user_created")
      respond_to do |format|
        format.js {render inline: "location.reload();" }
      end
        # format.js { render file: "users/create.js.erb" }
      # end
    else
      flash[:alert] = t("alerts.user_not_created")
      respond_to do |format|
        format.js {render inline: "location.reload();" }
        # format.js { render :file => "shared/show_errors.js.erb" }
        # format.mobile
        # format.iphone_native { render :file => "shared/show_errors_iphone_native.js.erb", :status => 500 }
      end
    end
  end

  def send_confirmation
    if @user.valid?
      # Send a confirmation mail to the newly created user:
      # TODO wieder einfügen, wenn funktionsfähig
      if TeacoMailer.account_confirmation(@user).deliver

      end
    end
  end

  def show
    unless @user
      respond_to do |format|
        format.html {
          I18n.locale = browser_language
          @page_title = I18n.t('errors.not_found')
          @user = nil
          render :template => "layouts/not_found_#{I18n.locale}.haml", :layout => "users"
        }
        # format.mobile { redirect_to root_url }
        # format.iphone_native { render :file => "layouts/not_found.iphone_native.haml", :status => 404 }
      end
    end
  end

  def update
    @user = User.find_by_key(params[:id])
    if @user.update(user_params)
      flash[:notice] = t("notices.user_updated")
      respond_to do |format|
        format.html { redirect_to user_path }
        format.js { render layout: false }
        # format.mobile
        # format.iphone_native { render :file => "users/update_iphone_native.haml" }
        # format.android_native { render :file => "users/update_android_native.haml" }
      end
    else
      flash[:alert] = t("alerts.user_not_updated")
      respond_to do |format|
        format.js {
          render :file => "shared/show_errors.js.erb"
        }
        # format.mobile
        # format.iphone_native { render :file => "shared/show_errors_iphone_native.js.erb", :status => 500 }
      end
    end
  end

  def destroy
    @user = User.find_by_key(params[:id])
    @user.destroy
    respond_to do |format|
      flash[:notice] = t("notices.user_deleted")
      format.html { redirect_to root_url }
      format.js { render :js => "location.href = '#{root_url}';" }
      # format.mobile { render :js => "location.href = '#{root_url}';" }
      # format.iphone_native { redirect_to root_url }
      # format.android_native { render :text => "success" }
    end
  end

  # end

  def show_meeting
    @meeting = Meeting.find(params[:meeting_id])
  end

  def get_userinfos
    respond_to do |format|
      format.mobile {
        load_user
        user_array = Array.new
        entry = Hash.new
        entry = {
            :name => @user.name,
            :freebusy_url => @user.freebusy_url,
            :language => @user.language
        }
        user_array << entry
        render :json => user_array
      }
    end
  end

  # Authenticates the user and redirects him to his administrations page
  # if the e-mail and password matches a user in the database
  def authenticate
    alias_address = AliasAddress.find_by_address(params[:user][:email])
    @user = User.find_by_id(alias_address.owner_id)
    if alias_address && @user.valid_password?(params[:user][:password])
      flash[:notice] = t("notices.logged_in")
      respond_to do |format|
        format.html {
          redirect_to '/'+alias_address.owner.key, :controller => 'users', :action => 'show'
        }
        format.js {
          render :js => "location.href = '/#{alias_address.owner.key}';"
        }
        # format.mobile {
        #   render :text => alias_address.owner.key
        # }
        # format.iphone_native {
        #   render :text => "#{alias_address.owner.key},#{alias_address.owner.id}"
        # }
        # format.ipad_native {
        #   render :text => alias_address.owner.key
        # }
        # format.android_native {
        #   render :text => alias_address.owner.key
        # }
      end
    else
      flash[:alert] = t("alerts.login_failed")
      # @user.errors.add_to_base(t('errors.invalid_login'))
      respond_to do |format|
        format.js {
          render :file => "shared/show_errors.js.erb"
        }
      end
    end
  end

  def login
    respond_to do |format|
      format.html {
        render :file => "users/login.haml"
      }
    end
  end

  def imprint
    respond_to do |format|
      format.html {
        render :template => "layouts/imprint", :layout => "users"
      }
    end
  end

  private

  def disallow_update_email
    # If the user tries to set an email address which is not registred for him,
    # disallow to update the email address:
    if params[:user][:email]
      alias_address = AliasAddress.find_by_address(params[:user][:email])
      if alias_address.nil? || alias_address.owner != @user || !alias_address.confirmed?
        (params[:user]).delete(:email)
      end
    end
  end

  def update_freebusy_information
    # Update the free-busy-information for the user:
    @user.update_freebusy_data
  end

  def current_object
    @current_object ||= @user
  end

  # Populate the @user instance variable with the right value (either a "new"
  # user or one from the database, identified by his hash key).
  def load_object
    # In case "new" or "create" was called, the newley created user is
    # stored in @current_object:
    if @current_object
      @user = @current_object
    else
      load_user
    end
  end

  def build_object
    if user_params.nil?
      @current_object = User.new(user_params)
    else
      @current_object = User.find_or_create(user_params)
    end
  end

  def user_params
    params.require(:user).permit(:id, :name, :email, :language, :created_at, :updated_at, :freebusy_url, :freebusy_data, :watched_vote_tutorial, :watched_new_meeting_tutorial, :password_hash, :password, :confirmation_hash )
  end

end
