class Meeting < ApplicationRecord

  has_many :suggestions, :dependent => :destroy

  has_many :comments, :dependent => :destroy

  has_and_belongs_to_many :participants, :class_name => "User"

  belongs_to :initiator, :class_name => "User", :foreign_key => "initiator_id"

  validates_presence_of :title, :initiator
  validates_length_of :title, :within => 2..60

  # resourceful_permission methods

  def updatable_by?(user)
    user.is_a?(User) &&
      (!self.restricted? || initiated_by?(user))
  end

  def destroyable_by?(user)
    user.is_a?(User) && initiated_by?(user)
  end

  def viewable_by?(user)
    user.is_a?(User) && self.participants.include?(user)
  end

  # resourceful_permissions end

  def initiated_by?(user)
    user.is_a?(User) && user == self.initiator
  end

  # Returns only those suggestions within +self+ which are picked.
  def picked_suggestions
    self.suggestions.select{ |sugg| sugg.picked }
  end

  # Returns a Hash which contains for each day in the meeting an array
  # of +FreebusyTimespan+s. These represent the timespans when one or
  # more users are unavailable at that day.
  def freebusy_day_hash

    days_to_spans = Hash.new
    self.participants.each do |user|
      # Is the user's free-busy data really fb-data? If so,
      # there should be a date (2001-01-01) in it:
      if /\d\d\d\d-\d?\d-\d?\d/.match(user.freebusy_data)

        # The freebusy data consists of chunks, separated by ";" symbols:
        chunks = user.freebusy_data.split(";")
        chunks.each do |chunk|
          # Transform that chunk into a FreebusyTimespan:
          timespans = freebusy_data_to_dates(chunk)
          timespans.each do |span|
            span.unavailables = { [span.start_time, span.end_time] => user }
            # Now add the found timespans to the hash (create the
            # array at that position, if neccessary):
            days_to_spans[span.date] ||= Array.new
            days_to_spans[span.date] <<  span
          end

        end
      end
    end

    # Now we have a hash from the following scheme:
    # { Day => [ FreebusyTimespan, FreebusyTimespan, ...] }
    # We now have to compress overlapping timespans:
    compressed_days_to_spans = Hash.new
    days_to_spans.each_pair do |day, span_array|

      # Sort the timespans by their start time:
      span_array.sort! { |a,b| a.start_time <=> b.start_time }
      # new_span contains the compressed spans for this day at the end:
      new_span_array = [ span_array.first ]

      # Iterate over each span except the first
      span_array[1..-1].each do |span|
        overlapped = false
        new_span_array.each_with_index do |other_span, index|
          if span.overlapping_with?(other_span)
            new_span_array[index] = span.union(other_span)
            overlapped = true
          end
        end
        # If the span did not overlap with any other,
        # insert it "purely":
        unless overlapped
          new_span_array << span
        end
      end

      compressed_days_to_spans[day] = new_span_array

    end

    return compressed_days_to_spans

  end

  private

  def freebusy_data_to_dates(line)
    # Single parts of the free busy information chunk
    # are divided by spaces (format: YYYY-MM-DD hh:mm hh:mm):
    parts = line.split(" ")
    # TODO: not very elegant: we parse the time strings (which delivers
    # local time zone objects), create a UTC time out of the data (all
    # identical except the time zone) and convert it into a local time
    # by "localtime" (which substracts one or two hours, depending on
    # daylight ssaving time or not).
    start_time = Time.parse(parts.first + " " + parts.second)
    end_time = Time.parse(parts.third + " " + parts.fourth)
    start_time = Time.utc(start_time.year, start_time.month, start_time.day, start_time.hour, start_time.min).localtime
    end_time = Time.utc(end_time.year, end_time.month, end_time.day, end_time.hour, end_time.min).localtime
    # Prevent an ending time of "0:00" - this would cause errors:
    if end_time.hour == 0 && end_time.min == 0
      end_time -= 1.minute
    end

    start_date = "#{start_time.year}-#{start_time.month}-#{start_time.day}"
    end_date = "#{end_time.year}-#{end_time.month}-#{end_time.day}"

    dates = Array.new

    (start_date..end_date).each do |day|
      # Is this the first day?
      if day == start_date
        start_hour = start_time.hour
        start_minute = start_time.min
      else
        start_hour = 0
        start_minute = 0
      end

      # Does another day follow?
      if day == end_date
        end_hour = end_time.hour
        end_minute = end_time.min
      else
        end_hour = 23
        end_minute = 59
      end

      day_object = Date.parse(day)

      span = FreebusyTimespan.new(
        day_object,
        # The "from" date:
        Time.utc(day_object.year, day_object.month, day_object.day, start_hour, start_minute),
        # The "to" date:
        Time.utc(day_object.year, day_object.month, day_object.day, end_hour, end_minute)
      )

      dates << span
    end

    return dates
  end

  ##
  # Calculate a meeting's overall progress and add the progress result to an JSON object
  public def meeting_progress
    pending_count = 0
    started_count = 0
    completed_count = 0
    self.suggestions.each do |suggestion|
      case suggestion.votes.select{ |vote| vote.decision != Vote::DONTKNOW }
      when 0
        pending_count += 1
      when self.participants.count
        completed_count += 1
      else
        started_count += 1
      end
    end
    suggestions_count = self.suggestions.count

    progress = MeetingProgress.new
    progress.pending = pending_count / suggestions_count
    progress.started = started_count / suggestions_count
    progress.completed = completed_count / suggestions_count
    progress
  end

end
