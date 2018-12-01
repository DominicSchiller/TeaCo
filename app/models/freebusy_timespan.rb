# Contains a date, a start time, an end time and a hash with
# [start,end]-arrays as keys and the corresponding unavailable
# users as values.

class FreebusyTimespan < ApplicationRecord

  attr_accessor :date,:start_time, :end_time, :unavailables

  def initialize(date, start_time, end_time)
    @date = date
    @start_time = start_time
    @end_time = end_time
  end

  # Returns true if the two timespans overlap.
  def overlapping_with?(other)
    (self.start_time <= other.start_time && self.end_time >= other.start_time) ||
        (other.start_time <= self.start_time && other.end_time >= self.start_time)
  end

  # Returns a timespan which begins at the earliest start time and
  # ends at the latest end time of +self+ and +other+, but only if the
  # two do overlap. If not, +union+ returns false.
  def union(other)
    return false unless self.overlapping_with?(other)
    new_start_time = if self.start_time < other.start_time
    then self.start_time
                     else other.start_time end
    new_end_time = if self.end_time > other.end_time
    then self.end_time
                   else other.end_time end

    new_unavailables = self.unavailables.merge(other.unavailables)

    new_span = FreebusyTimespan.new(self.date, new_start_time, new_end_time)
    new_span.unavailables = new_unavailables
    return new_span

  end

end
