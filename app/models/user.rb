require 'digest/sha1'
require "net/https"

class User < ApplicationRecord

  validates_presence_of :email, :language
  validates_presence_of :password, :if => :perform_password_validation?
  validates_confirmation_of :password, :if => :perform_password_validation?

  before_save :hash_password
  attr_accessor :password

  has_and_belongs_to_many :meetings
  has_and_belongs_to_many :push_tokens

  # The meetings initiated by the user are destroyed when the user is deleted:
  has_many :initiated_meetings, :class_name => "Meeting", :foreign_key => "initiator_id", :dependent => :destroy

  has_many :suggestions, :foreign_key => "creator_id", :dependent => :destroy

  has_many :votes, :foreign_key => "voter_id", :dependent => :destroy

  has_many :comments, :foreign_key => "author_id", :dependent => :destroy

  has_many :alias_addresses, :foreign_key => "owner_id", :dependent => :delete_all

  has_many :known_addresses, :foreign_key => "owner_id", :dependent => :destroy

  has_many :tokens, :foreign_key => "owner_id", :dependent => :destroy

  before_create :set_key
  after_create :set_alias

  def self.update_freebusy_cronjob
    User.where("freebusy_url <> ?", '').each do |user|
      user.update_freebusy_data
    end
  end

  def set_key
    # Find the user a key that is not yet in use:
    key = ""
    loop do
      key = Digest::SHA1.hexdigest(Time.now.to_s << "#" << self.email)
      break unless User.find_by_key(key)
    end
    self.key = key
  end

  def set_alias
    # First, delete any possible alias requests for this address:
    aliases = AliasAddress.find_by_address(self.email)
    AliasAddress.delete(aliases)
    # Then create an alias address for the user's master address:
    a = AliasAddress.new(
        :address => self.email,
        :owner_id => self.id,
        :confirmed => true,
        :confirmation_hash => "none")
    self.alias_addresses << a
  end

  # Returns true if the given password matches the password in the database
  def valid_password?(password)
    self.password_hash == self.class.hash_password(password)
  end

  # Performs the actual password encryption.
  def self.hash_password(password)
    Digest::SHA1.hexdigest(password)
  end

  # Sets the hashed version of self.password to password_hash, unless it's blank.
  def hash_password
    self.password_hash = self.class.hash_password(self.password) unless self.password.blank?
  end

  # Assert wether or not the password validations should be performed.
  def perform_password_validation?
    !self.password.blank?
  end

  # Any user is publically identified via his secret key, not his id.
  # So if e.g. "form_for @user" is called, the key of the user
  # is inserted.
  def to_param
    self.key
  end

  def to_s
    unless self.name.blank?
      self.name
    else
      self.email
    end
  end

  def freebusy_warning?
    self.freebusy_data && !(/\d\d\d\d-\d?\d-\d?\d/.match(self.freebusy_data))
  end

  def update_freebusy_data
    unless self.freebusy_url.blank?
      begin
        self.update_freebusy
      rescue URI::InvalidURIError
        #@user.errors.add("freebusy_url", "no valid path to a free/busy-file.")
        self.freebusy_url = ""
        self.freebusy_data = ""
        self.save
      end
    else
      self.freebusy_data = ""
      self.save
    end
  end

  # Finds the user with the given email address in the database and returns him, or
  # - if there is no user with the given address in the database - creates
  # a new user and saves him.
  def self.find_or_create(user_parameters)
    alias_address = AliasAddress.find_by_address(user_parameters[:email])
    if alias_address.nil? || !alias_address.confirmed?
      # If there is no alias, try the "master" accounts:
      user = User.new(user_parameters)
    else
      user = alias_address.owner
    end
    return user
  end

  # Tries to to find a user that owns an alias with the given address
  # and returns him if he existrs, otherwise +nil+.
  def self.find_by_alias(address)
    alias_address = AliasAddress.find_by_address(address)
    if alias_address
      alias_address.owner
    else
      nil
    end
  end

  protected

  def validate
    pattern = /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,5}\b/i

    unless self.email =~ pattern
      errors.add("email", I18n.t('activerecord.errors.email_invalid'))
    end
  end

  def update_freebusy
    begin
      url = URI.parse(self.freebusy_url)
    rescue URI::InvalidURIError
      self.freebusy_data = I18n.t('errors.no_valid_url')
      self.freebusy_url  = ""
      self.save
      return
    end

    begin
      if url && url.scheme == 'https'
        http = Net::HTTP.new(url.host, url.port)
        http.use_ssl = true
        http.verify_mode = OpenSSL::SSL::VERIFY_NONE

        request = Net::HTTP::Get.new(url.request_uri)
        @response = http.request(request)
      else
        @response = Net::HTTP.get_response(url)
      end

      unless @response.code == "200"
        self.freebusy_data = I18n.t('errors.file_not_found')
        self.freebusy_url  = ""
        self.save
        return
      end

      cal = RiCal.parse_string(@response.body)
      @freebusys = cal.first.freebusys
      @freebusys = cal.first.events if @freebusys.none?

      if @freebusys.count < 1
        if @events.count < 1
          self.freebusy_data = I18n.t('errors.no_freebusy_found')
          self.save
          return
        else
          @freebusys = @events
        end
      end

      data = ""
      @freebusys.each do |fb|
        dtstart = DateTime.parse(fb.dtstart.to_s).in_time_zone.to_s(:db)
        dtend   = DateTime.parse(fb.dtend.to_s).in_time_zone.to_s(:db)
        data << "#{dtstart} #{dtend};"
      end

      self.freebusy_data = data
      self.save

    rescue ArgumentError, NoMethodError
      self.freebusy_data = I18n.t('errors.no_valid_url')
      self.freebusy_url = ''
      self.save
      raise URI::InvalidURIError
    rescue SocketError
      self.freebusy_data = I18n.t('errors.server_unavailable')
      self.freebusy_url = ''
      self.save
      return
    rescue RuntimeError
      self.freebusy_data = I18n.t('errors.common_error', :error => $! )
      self.freebusy_url = ''
      self.save
      return
    end
  end

end