##
# Meeting progress model
class MeetingProgress
  ##
  # The pending progress in percent
  attr_accessor :pending
  ##
  # the started progress in percent
  attr_accessor :started
  ##
  # the completed progress in percent
  attr_accessor :completed

  ##
  # Constructor
  def init
    @pending = 0
    @started = 0
    @completed = 0
  end
end