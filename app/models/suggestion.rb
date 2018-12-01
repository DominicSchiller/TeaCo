class Suggestion < ApplicationRecord

  belongs_to :meeting
  belongs_to :creator, :class_name => "User", :foreign_key => "creator_id"
  has_many :votes, :dependent => :destroy

  validates_presence_of :date, :start, :end, :meeting_id, :creator_id
  validates_associated :meeting

  public

  # resourceful_permission methods

  def updatable_by?(user)
    user.is_a?(User) &&
        (!self.meeting.restricted? || owned_by?(user) || self.meeting.initiated_by?(user))
  end

  def destroyable_by?(user)
    user.is_a?(User) &&
        (!self.meeting.restricted? || owned_by?(user) || self.meeting.initiated_by?(user))
  end

  def owned_by?(user)
    user.is_a?(User) && user == self.creator
  end

  def pickable_by?(user)
    user.is_a?(User) && (!self.meeting.restricted? || self.meeting.initiated_by?(user))
  end

  # resourceful_permissions end

  def start_as_readable
    self.start.strftime "%H:%M"
  end

  def end_as_readable
    self.end.strftime "%H:%M"
  end

  # def date_short
  #    self.date.strftime "%a %d. %b %y"
  # end

  def times_as_readable
    I18n.l(self.date, :format => :short_with_weekday) + ", " + self.start_as_readable + "-" + self.end_as_readable
  end

  def to_ical(location)
    Time.zone = "Berlin"
    stime = Time.local(self.date.year, self.date.month, self.date.day, self.start.hour, self.start.min, 0).utc
    etime = Time.local(self.date.year, self.date.month, self.date.day, self.end.hour, self.end.min, 0).utc

    title = self.meeting.title
    date  = self.date

    calendar = RiCal.Calendar do |cal|
      cal.prodid = "-//TeaCo//EN"
      cal.event do
        summary       title
        created       Time.now.strftime('%Y%m%dT%H%M%SZ')
        dtstart       Time.parse("#{date.strftime('%Y%m%d')}T#{stime.strftime('%H%M%SZ')}").in_time_zone
        dtend         Time.parse("#{date.strftime('%Y%m%d')}T#{etime.strftime('%H%M%SZ')}").in_time_zone
        location      location if location.present?
      end
    end
  end

  protected

  def validate
    # Start time must begin at least 30 minutes before end time:
    if self.start > self.end
      # errors.add_to_base(I18n.t('activerecord.errors.suggestion.start_before_end'))
    elsif self.start + 30.minutes > self.end
      # errors.add_to_base(I18n.t('activerecord.errors.suggestion.duration_too_short'))
    end
  end

  def validate_on_create
    # The suggestion must not be on a day in the past:
    if self.date < Date.today
      # errors.add_to_base(I18n.t('activerecord.errors.suggestion.date_not_in_past'))
    end
  end


end
