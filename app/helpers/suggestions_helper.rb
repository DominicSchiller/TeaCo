module SuggestionsHelper

  # Gets a time string for the start of the given suggestion,
  # or a default start time if the suggestion is new.
  def get_default_date(suggestion)
    if suggestion.new_record? || suggestion.date < Date.today
      return Date.today.to_s
    else
      return suggestion.date
    end
  end

  # Gets a time string for the start of the given suggestion,
  # or a default start time if the suggestion is new.
  def get_default_start_time(suggestion)
    if suggestion.new_record?
      return "10:00"
    else
      start_hour =  suggestion.start.hour.to_s
      start_minutes =  (suggestion.start.min < 10 ? "0" : "") << suggestion.start.min.to_s
      start_time = "#{start_hour}:#{start_minutes}"
      return start_time
    end
  end

  # Gets a time string for the end of the given suggestion,
  # or a default start time if the suggestion is new.
  def get_default_end_time(suggestion)
    if suggestion.new_record?
      return "12:00"
    else
      end_hour = suggestion.end.hour.to_s
      end_minutes = (suggestion.end.min < 10 ? "0" : "") << suggestion.end.min.to_s
      end_time = "#{end_hour}:#{end_minutes}"
      return end_time
    end
  end


  # Gets a time string for the duration of the given suggestion,
  # or a default duration if the suggestion is new.
  def get_default_duration(suggestion)
    if suggestion.new_record?
      return "2:00"
    else
      dur =  suggestion.end - suggestion.start
      hours = (dur / 3600).floor.to_s
      minutes = ((dur / 60.0) % 60).floor.to_s
      minutes = "0" << minutes if minutes.length == 1
      return "#{hours}:#{minutes}"
    end
  end

  # Gets a time int for the duration of the given suggestion,
  # or a default duration if the suggestion is new.
  def get_duration_hours(suggestion)
    if suggestion.new_record?
      return 2
    else
      dur =  suggestion.end - suggestion.start
      hours = (dur / 3600).floor
      return hours
    end
  end

  # Gets a time int for the duration of the given suggestion,
  # or a default duration if the suggestion is new.
  def get_duration_minutes(suggestion)
    if suggestion.new_record?
      return 120
    else
      dur =  suggestion.end - suggestion.start
      minutes = (dur / 60).floor
      return minutes
    end
  end

  # Gets the appropriate text on the submit button
  # of the edit/add suggestion form.
  def get_edit_submit_button_text(suggestion)
    suggestion.new_record? ? t('suggestions.edit_form.add') : t('suggestions.edit_form.update')
  end

  # Returns a select tag which contains an option
  # for each time between 00:00 and 23:45 in 15 min steps
  def insert_time_selector(suggestion, type)
    time_array = Array.new
    (0..23).each do |hour|
      ["00", "15", "30", "45"].each do |minute|
        time_array << (hour.to_s + ":" + minute)
      end
    end
    if type == "start_time"
      collection_select(:suggestion, :start, time_array, :to_s, :to_s, {:selected => get_default_start_time(suggestion)}, {:class => "sugg_start"})
    elsif type == "end_time"
      collection_select(:suggestion, :end, time_array, :to_s, :to_s, {:selected => get_default_end_time(suggestion)}, {:class => "sugg_end"})
    end

  end

  # Returns the position of the suggestion of the given meeting
  def get_array_position(suggestion, meeting)
    index = 0;
    meeting.suggestions.sort_by{|a| [a.date, a.start, a.end]}.each do |sugg|
      if sugg.date == suggestion.date && sugg.start == suggestion.start && sugg.end == suggestion.end
        return index
      end
      index = index + 1
    end
  end

  # Returns the suggestion count of the given meeting
  def get_suggestion_count(meeting)
    return meeting.suggestions.count
  end

end
