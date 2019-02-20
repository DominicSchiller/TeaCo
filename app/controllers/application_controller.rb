class ApplicationController < ActionController::Base
  # protect_from_forgery with: :exception
  protect_from_forgery with: :null_session

  helper :all # include all helpers, all the time

  #before_action do
    # puts "DEBUG PARAMS:#{params.inspect}\n"
  #end

  helper_method :suggestion_restricted?

  # Replace the plain password with [FILTERED] in the log
  # filter_parameter_logging :password

  # An as-safe-as-could-be ruby-specific
  # regular expression for evaluation email addresses.
  def email_address_regex
    pattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,5}\b/i
    return pattern
  end

  def set_language
    browser_language
    I18n.locale = @user.language if @user.present?
  end

  def load_user
    if params[:confirmation_hash].present?
      @alias_address = AliasAddress.find_by_confirmation_hash(params[:confirmation_hash])
      @user = User.find_by_id(@alias_address.owner_id)
    end

    if params.present?
      params[:user_key] ||= params[:user_id]
      params[:user_key] ||= params[:id]
    end
    # In the main route (/[user_key]/[meeting_id]) and
    # in the resourse routes (/users/[user_key]/meetings/...),
    # the parameter to look for is "user_key":
    @user ||= User.find_by_key(params[:user_key])

    #not_found if @user.nil?
  end

  def not_found
    raise ActionController::RoutingError.new('Not Found')
  end

  def load_meeting
    if params.include?(:meeting_id)
      @meeting = Meeting.find_by_id(params[:meeting_id])
    else # The meeting is the last request of the URL (users/xxx/meetings/123)
      # and is therefore named "id"
      @meeting = Meeting.find_by_id(params[:id])
    end
  end

  def load_suggestion
    if params[:suggestion].present?
      params[:suggestion_id] ||= params[:suggestion][:suggestion_id]
      params[:suggestion_id] ||= params[:suggestion][:id]
    end

    if params.include?(:suggestion_id)
      @suggestion = Suggestion.find_by_id(params[:suggestion_id])
    else # The suggestion is the last request of the URL
      #(users/xxx/meetings/yyy/suggestions/234)
      # and is therefore named "id"
      @suggestion = Suggestion.find_by_id(params[:id])
    end
  end

  # Sets the +updated_at+ column of +meeting+
  # to +Time.now+.
  def touch_meeting(meeting)
    meeting.updated_at = Time.now
    meeting.save!
  end

  # Sets the +updated_at+ column of +comment+
  # to +Time.now+.
  def touch_comment(comment)
    comment.updated_at = Time.now
    comment.save!
  end

  # Returns true if the given +user+ may not freely
  # manipulate the given +suggestion+. This is the case
  # when the suggestion's meeting is restricted and the
  # user is is not the suggestions' author.
  def suggestion_restricted?(suggestion)
    !suggestion.updatable_by?(@user)
  end

  #def is_mobile_old_request?
  #  request.user_agent =~ /((iPhone.+Mobile\/.+))/
  #end

  #def is_mobile_request?
  #  request.user_agent =~ /(Series60|SymbianOS|Android|IEMobile|Opera Mini|Opera Mobi|(iPad.+Mobile\/.+))/
  #end

  def is_iphone_native_request?
    request.user_agent =~ /(TeaCoiPhoneApp)/
  end

  def is_ipad_native_request?
    request.user_agent =~ /(TeaCoPad)/
  end

  def is_android_native_request?
    request.user_agent =~ /(TeaCoAndroid)/
  end

  before_action :set_phone_format

  def set_phone_format
    #if is_mobile_request?
    #  request.format = :mobile
    #end
    if is_iphone_native_request?
      request.format = :iphone_native
    end
    if is_ipad_native_request?
      request.format = :ipad_native
    end
    if is_android_native_request?
      request.format = :android_native
    end
    #if is_mobile_old_request?
    #  query_string = request.env["REQUEST_URI"]
    #  redirect_to "http://teaco.imis.uni-luebeck.de#{query_string}"
    #end
  end

  before_action :check_referer

  def check_referer
    @referer = request.env["HTTP_REFERER"] || 'none'
    if not @referer.include? root_url
      @not_from_within = true
    end
  end

  ##
  # Returns the most preferred language of the request
  # (out of "de", "en", "fr").
  ##
  def browser_language
    # no language accepted
    return [] if request.env["HTTP_ACCEPT_LANGUAGE"].nil?

    # parse Accept-Language
    accepted = request.env["HTTP_ACCEPT_LANGUAGE"].split(",")
    accepted = accepted.map { |l| l.strip.split(";") }
    accepted = accepted.map { |l|
      if (l.size == 2)
        # quality present
        [ l[0].split("-")[0].downcase, l[1].sub(/^q=/, "").to_f ]
      else
        # no quality specified =&gt; quality == 1
        [ l[0].split("-")[0].downcase, 1.0 ]
      end
    }

    # sort by quality
    accepted.sort { |l1, l2| l2[1] <=> l1[1] }

    fav_lang = "de"

    accepted.each do |lang|
      if ["de", "en", "fr"].include?(lang.first)
        fav_lang = lang.first
        break
      end
    end

    fav_lang
  end

end
