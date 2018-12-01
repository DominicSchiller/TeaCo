module CustomHtmlSafe
  def html_safe?
    true
  end
end

class ActionView::OutputBuffer
  include CustomHtmlSafe
end

class ActionView::SafeBuffer
  include CustomHtmlSafe
end

class String
  include CustomHtmlSafe
end

module MeetingsHelper

  # The height of one "cell" representing an hour in
  # the suggestion view.
  HOUR_HEIGHT = 48

  # The width of a day box where no suggestions
  # overlap.
  DAY_WIDTH = 200

  # The width that a suggestion is indented when it
  # is overlapping with another.
  MARGIN_STEP = 50

  # Returns the height of one "cell" representing
  # an hour in the suggestion view.
  def hour_height
    return HOUR_HEIGHT
  end

  def get_meeting_title_attributes(meeting, user)
    if meeting.updatable_by?(user)
      {
          :id => "edit_title",
          :rel => user_meeting_path(@user, @meeting),
          :title => t('tooltips.change_title'),
          remote: true
      }
    else
      Hash.new # no attributes
    end
  end

  # Returns a hash for the given suggestions, which contains one
  # array for each different day. For example, if
  # suggestion_array = [Jan 1 18:00, Jan 1 20:00, Jan 2 10:00],
  # then this returns [Jan 1 => [Jan 1 18:00, Jan 1 20:00], Jan 2 =>[Jan 2 10:00]].
  def get_day_hash_for(suggestion_array)
    suggestion_array.sort { |a,b| a.date - b.date }.to_a
    days = Hash.new
    suggestion_array.each do |sugg|
      if days[sugg.date].nil?
        days[sugg.date] = [sugg]
      else
        days[sugg.date] = days[sugg.date] << sugg
      end
    end
    return days
  end

  def get_sugg_box_class(suggestion, restricted)
    classes = "sugg_box box_shadow"

    dur = suggestion.end - suggestion.start
    hours = (dur / 3600).floor
    min = ((dur / 60).floor).modulo(60)
    if hours < 1
      if min > 30
        classes += " 45_min"
      else
        classes += " 30_min"
      end
    end

    classes
    # If the meeting is not restricted, or the suggestion
    # is "owned" by the user, make it manipulable:
    unless restricted
      classes += " manipbl"
    end
    if suggestion.creator != @user
      classes += " not_mine"
    end
    # If more than one user (the creator) voted on this
    # suggestion, mark it as "voted_on":
    if suggestion.votes.select { |v| v.voter != @user && v.decision != Vote::DONTKNOW }.length > 0
      classes += " voted_on"
    end
    # If I voted on this suggestion, mark it as "ive_voted":
    if suggestion.votes.select { |v| v.voter == @user && v.decision != Vote::DONTKNOW }.length > 0
      classes += " ive_voted"
    end
    return classes
  end

  def get_sugg_table_class(suggestion)
    if suggestion.new_record?
      hours = 2
      min = 0
    else
      dur = suggestion.end - suggestion.start
      hours = (dur / 3600).floor
      min = ((dur / 60).floor).modulo(60)
    end
    if hours >= 1
      table_class = "middle"
    else
      if min > 30
        table_class = "background_45"
      else
        table_class = "background_30"
      end
    end
    return table_class
  end

  # Returns the css-style for the day-box, especially
  # its width based on the margins in the given hash values.
  def get_day_box_style(margins)
    max_margin = margins.values.max
    return "width: #{ DAY_WIDTH + max_margin }px"
  end

  # Calculates width and height for a suggestion and returns
  # a suitable CSS-style string.
  def calc_sugg_box_style(suggestion, left_margin)
    duration = suggestion.end - suggestion.start
    height = (duration/3600.0 * HOUR_HEIGHT).floor
    top = ((suggestion.start.hour + (suggestion.start.min / 60.0)) * HOUR_HEIGHT).floor
    return "height: #{height}px; top: #{top}px; margin-left: #{left_margin}px; background-color: rgba(255,255,255, 0.9); border: 3px solid grey;"
  end

  # Calculates width and height for a busy box according to
  # the given +FreebusyTimespan+ and returns
  # a suitable CSS-style string.
  def calc_busy_box_style(timespan)
    duration = timespan.end_time - timespan.start_time
    height = (duration/3600.0 * HOUR_HEIGHT).floor
    top = ((timespan.start_time.hour + (timespan.start_time.min / 60.0)) * HOUR_HEIGHT).floor
    return "height: #{height}px; top: #{top}px;"
  end


  # Returns all three vote buttons and sets one as active
  # if a vote has already been made
  def get_vote_buttons(sugg, vote, task = "input")
    button_array = ""
    decision_array = [ "no", "maybe", "yes" ]

    if task == "input"
      disabled = ""
    else
      disabled = ", disabled"
    end

    decision_array.each_with_index do |decision, index|
      if decision == vote.decision
        if index == 2
          button_array << "<input type='button', rel='#{decision}', title='#{t('tooltips.vote_' + decision)}', class='btn btn-#{decision}-active btn-vote vote_button' #{disabled} ></input>"
        else
          button_array << "<input type='button', rel='#{decision}', title='#{t('tooltips.vote_' + decision)}', class='btn btn-#{decision}-active btn-vote margin-right-1 vote_button' #{disabled} ></input>"
        end
      else
        if index == 2
          button_array << "<input type='button', rel='#{decision}', title='#{t('tooltips.vote_' + decision)}', class='btn btn-#{decision} btn-vote vote_button' #{disabled} ></input>"
        else
          button_array << "<input type='button', rel='#{decision}', title='#{t('tooltips.vote_' + decision)}', class='btn btn-#{decision} btn-vote margin-right-1 vote_button' #{disabled} ></input>"
        end
      end
    end

    #= image_tag get_button_source(:no, v), :rel => "no", :title => t('tooltips.vote_no'), :class => "vote_button tipped_top", style: "width: 30px;"
    #= image_tag get_button_source(:maybe, v), :rel => "maybe", :title => t('tooltips.vote_maybe'), :class => "vote_button tipped_top", style: "width: 30px;"
    #= image_tag get_button_source(:yes, v), :rel => "yes", :title => t('tooltips.vote_yes'), :class => "vote_button tipped_top", style: "width: 30px;"

    return button_array
  end


  #returns all given votes
  def show_decision_by_users(suggestion)
    decision_array = ""
    suggestion.votes.each_with_index do |vote|
      user = User.find_by_id(vote.voter_id)
      decision_array << "<div class='row text-right mobile-margin-bottom-1 visible-xs'><div class='col-xs-4 padding-right-0'><b>#{truncate(user.name, length: 12)}\t
                        </b></div> <div class='col-xs-7 text-right' style='padding:0; padding-right: 15px;'>#{get_vote_buttons(suggestion, vote, "show_only" )} </div> </div>"

      decision_array << "<div class='row text-right mobile-margin-bottom-1 visible-sm'><div class='col-sm-5'><b>#{truncate(user.name, length: 30)}\t
                        </b></div> <div class='col-sm-5 text-right' style='padding:0; padding-right: 18px;'>#{get_vote_buttons(suggestion, vote, "show_only")} </div> </div>"

      decision_array << "<div class='row text-right margin-bottom-1 visible-md visible-lg'><div class='col-md-6 col-lg-6 text-right'><b>#{truncate(user.name, length: 15)}\t
                        </b></div> <div class='col-md-6 col-lg-6 text-left padding-0'>#{get_vote_buttons(suggestion, vote, "show_only")} </div> </div>"
    end

    return decision_array
  end

  # Returns bootstrap progress-bar
  def get_vote_percentages(suggestion)
    votes_total = suggestion.votes.length
    color_array = ["success", "warning", "danger"]
    vote_yes = 0
    vote_maybe = 0
    vote_no = 0

    suggestion.votes.each do |vote|
      if vote.decision == "yes"
        vote_yes += 1
      elsif vote.decision == "maybe"
        vote_maybe += 1
      else
        vote_no += 1
      end
    end

    votes_array = Array.new
    votes_array << (100 / votes_total) * vote_yes
    votes_array << (100 / votes_total) * vote_maybe
    votes_array << (100 / votes_total) * vote_no

    bars_array = ""
    # 0 = yes , 1 = maybe, 2 = no
    color_array.each_with_index do |color, index|
      bars_array << "<div class='progress-bar progress-bar-#{color}'  style='width: #{votes_array[index]}%' id='suggestion_#{suggestion.id}' ></div>"
    end

    return bars_array
  end


  # Returns the percentual correct voting bar
  # for the given suggestion as HTML td elements.
  def get_vote_bar_for(suggestion)

    decision_array = [Vote::NO, Vote::MAYBE, Vote::YES, Vote::DONTKNOW]

    css_classes = { Vote::NO => "red",
                    Vote::MAYBE => "yellow",
                    Vote::YES => "green",
                    Vote::DONTKNOW => "white"
    }

    vote_groups = Hash.new

    # Create a hash which contains a key for each possible decision,
    # and has the corresponding votes as values:
    suggestion.votes.each do |vote|
      vote_groups[vote.decision] ||= Array.new
      vote_groups[vote.decision] << vote
    end

    # Search for the last decision which has votes
    # (i.e. first "?", then "no", ...)
    last_bar = Vote::NO
    decision_array.reverse_each do |decision|
      if vote_groups.has_key?(decision)
        last_bar = decision
        break
      end
    end

    votes_total = suggestion.votes.length
    vote_bar = ""
    total_percent = 0
    # As we cannot iterate in a sorted way over the Hash's keys,
    # sort it first (and make it an array of two-element arrays that way):
    vote_groups = vote_groups.sort do |group_a,group_b|
      a = group_a.first
      b = group_b.first
      if a == b then 0
      elsif a == Vote::NO || b == Vote::DONTKNOW
      then 1
      elsif b == Vote::NO || a == Vote::DONTKNOW
      then -1
      elsif a == Vote::MAYBE
      then 1
      else
        0
      end
    end

    vote_groups.reverse_each do |vote_group|
      decision = vote_group.first
      votes = vote_group.second
      css_class = css_classes[decision]
      count = votes.length

      # Avoid a total percent of less than 100:
      if decision == last_bar
        # By giving the last bar the remaining percentage:
        percent = 100 - total_percent
      else
        percent = (count * 100.0 / votes_total).round
        # Avoid percentages over 100% - clip the new percentage
        # to at most what is missing to 100:
        if total_percent + percent > 100
          percent = 100 - total_percent
        end
      end
      total_percent += percent
      vote_bar << "<div class='#{css_class}' style='width: #{percent}%;'></div>"
    end
    return vote_bar
  end

  # Returns the percentual correct voting bar
  # for the given suggestion as plist key elements.
  def get_vote_bar_for_iphone_native(suggestion)

    decision_array = [Vote::YES, Vote::MAYBE, Vote::NO, Vote::DONTKNOW]

    css_classes = { Vote::YES => "green",
                    Vote::MAYBE => "yellow",
                    Vote::NO => "red",
                    Vote::DONTKNOW => "grey" }

    vote_groups = Hash.new

    # Create a hash which contains a key for each possible decision,
    # and has the corresponding votes as values:
    suggestion.votes.each do |vote|
      vote_groups[vote.decision] ||= Array.new
      vote_groups[vote.decision] << vote
    end

    # Search for the last decision which has votes
    # (i.e. first "?", then "no", ...)
    last_bar = Vote::YES
    decision_array.reverse_each do |decision|
      if vote_groups.has_key?(decision)
        last_bar = decision
        break
      end
    end

    votes_total = suggestion.votes.length
    vote_bar = ""
    total_percent = 0
    # As we cannot iterate in a sorted way over the Hash's keys,
    # sort it first (and make it an array of two-element arrays that way):
    vote_groups = vote_groups.sort do |group_a,group_b|
      a = group_a.first
      b = group_b.first
      if a == b then 0
      elsif a == Vote::YES || b == Vote::DONTKNOW
      then 1
      elsif b == Vote::YES || a == Vote::DONTKNOW
      then -1
      elsif a == Vote::MAYBE
      then 1
      else
        0
      end
    end

    vote_groups.reverse_each do |vote_group|
      decision = vote_group.first
      votes = vote_group.second
      css_class = css_classes[decision]
      count = votes.length

      # Avoid a total percent of less than 100:
      if decision == last_bar
        # By giving the last bar the remaining percentage:
        percent = 100 - total_percent
      else
        percent = (count * 100.0 / votes_total).round
        # Avoid percentages over 100% - clip the new percentage
        # to at most what is missing to 100:
        if total_percent + percent > 100
          percent = 100 - total_percent
        end
      end
      total_percent += percent
      vote_bar << "<key>#{css_class}</key>\n<integer>#{percent}</integer>\n"
    end
    return vote_bar
  end

  # Returns the percentual correct voting bar
  # for the given suggestion as plist key elements.
  def get_vote_bar_for_android_native(suggestion)

    decision_array = [Vote::YES, Vote::MAYBE, Vote::NO, Vote::DONTKNOW]

    css_classes = { Vote::YES => "green",
                    Vote::MAYBE => "yellow",
                    Vote::NO => "red",
                    Vote::DONTKNOW => "grey" }

    vote_groups = Hash.new

    # Create a hash which contains a key for each possible decision,
    # and has the corresponding votes as values:
    suggestion.votes.each do |vote|
      vote_groups[vote.decision] ||= Array.new
      vote_groups[vote.decision] << vote
    end

    # Search for the last decision which has votes
    # (i.e. first "?", then "no", ...)
    last_bar = Vote::YES
    decision_array.reverse_each do |decision|
      if vote_groups.has_key?(decision)
        last_bar = decision
        break
      end
    end

    votes_total = suggestion.votes.length
    vote_bar = ""
    total_percent = 0
    # As we cannot iterate in a sorted way over the Hash's keys,
    # sort it first (and make it an array of two-element arrays that way):
    vote_groups = vote_groups.sort do |group_a,group_b|
      a = group_a.first
      b = group_b.first
      if a == b then 0
      elsif a == Vote::YES || b == Vote::DONTKNOW
      then 1
      elsif b == Vote::YES || a == Vote::DONTKNOW
      then -1
      elsif a == Vote::MAYBE
      then 1
      else
        0
      end
    end

    vote_groups.reverse_each do |vote_group|
      decision = vote_group.first
      votes = vote_group.second
      css_class = css_classes[decision]
      count = votes.length

      # Avoid a total percent of less than 100:
      if decision == last_bar
        # By giving the last bar the remaining percentage:
        percent = 100 - total_percent
      else
        percent = (count * 100.0 / votes_total).round
        # Avoid percentages over 100% - clip the new percentage
        # to at most what is missing to 100:
        if total_percent + percent > 100
          percent = 100 - total_percent
        end
      end
      total_percent += percent
      vote_bar << "<key>voteBar_#{css_class}</key>\n<integer>#{percent}</integer>\n"
    end
    return vote_bar
  end

  # Returns the source of the given button (out of :yes, :maybe
  # and :no), according to
  # how the user has voted (active or not active).
  def get_button_source(button, vote)
    button_names = { :yes => "greenbutton", :maybe => "yellowbutton", :no => "redbutton" }
    source = '' << button_names[button]
    unless vote.decision == "?"
      source << "_active" if vote.decision == button.to_s
    end
    source << ".png"
    return source
  end

  # Returns the iphone source of the given button (out of :yes, :maybe
  # and :no), according to
  # how the user has voted (active or not active).
  def get_iphone_button_source(button, vote)
    button_names = { :yes => "greenbutton", :maybe => "yellowbutton", :no => "redbutton" }
    source = "/images/iphone/" << button_names[button]
    source << "_active" if vote.decision == button.to_s
    source << ".png"
    return source
  end

  # Returns image title and rel attribute for the
  # pick button of the given +suggestion+.
  def get_pick_button_attributes(suggestion, box_size, mobile)

    if (box_size == "big")
      width = "30px;"
    else
      width = "25px;"
    end

    picked_value = suggestion.picked? ? "1" : "0"

    tooltip = if suggestion.picked?
    then "tooltips.unpick_suggestion"
              else "tooltips.pick_suggestion"
              end

    classes = "pick_button tipped_top pointer "

    if mobile == "true"
      if suggestion.picked?
        classes << "btn btn-block btn-pick-active "
      else
        classes << "btn btn-block btn-pick "
      end
      return { title: t(tooltip), rel: picked_value, class: classes, remote: true }
    else
      return { title: t(tooltip), rel: picked_value, width: width , class: classes, remote: true}
    end

  end

  # Returns image source,
  def get_pick_button_source(suggestion)
    source = 'pick'
    source << '_active' if suggestion.picked?
    source << '.png'

    return source
  end


  # Returns a select tag which contains an option
  # for each meeting the user participates in
  # (with a standard "select a meeting" prompt).
  def insert_meeting_selector
    select_tag('meeting',
               ("<option value='none'>" + t("meetings.select_a_meeting_long") + "</option>") << (options_from_collection_for_select(@user.meetings.sort_by{ |m| m.updated_at }.reverse, 'id', 'title')),
               { :id => "meeting_selector", :title => t("tooltips.meeting_selector"), class: "form-control selector_header" })
  end

  # Returns a select tag which contains an option
  # for each meeting the user participates in
  # (with a shorter "select a meeting" prompt).
  def insert_short_meeting_selector
    select_tag 'meeting',
               "<option value='none'>" + t("meetings.select_a_meeting_short") + "</option>" << (options_from_collection_for_select(@user.meetings.sort_by{ |m| m.updated_at }.reverse, 'id', 'title')),
               { :id => "meeting_selector", :rel => user_meetings_url(@user) }
  end

  # Returns the attributes-hash for the clickable
  # edit-time div for the given +suggestion+. If +restricted+
  # is true, the div is not clickable and has no tooltip.
  def get_edit_time_attributes(suggestion, restricted)
    attr = {
        :id => "edit_time_#{suggestion.id}",
    }
    # If the meeting is not restricted, more options are available:
    unless restricted
      attr.merge!({
                      #href: edit_user_meeting_suggestion_path(@user, suggestion.meeting, suggestion),
                      title: t("tooltips.edit_time"),
                      class: "tipped_top pointer",
                      remote: true
                  })
    end
    return attr

  end

  # Returns a hash of the form :suggestion => margin_in_pixels
  # which determines for each of the given suggestions by how
  # much pixels they must be indented from the left when
  # they overlap.
  def get_margins_for_suggestions(suggestions)

    # Sort suggestions by their starting time:
    suggestions.sort! { |a,b| a.start <=> b.start }
    # The very first suggestion is always not indented
    # at all:
    margins = { suggestions.first => 0 }

    # Iterate over all remaining suggestions:
    1.upto(suggestions.size - 1) do |i|
      current_sugg = suggestions[i]
      overlap = 0

      # Compare each of them with all suggestions
      # with an earlier starting time:
      0.upto(i - 1) do |j|
        compare_sugg = suggestions[j]

        # Does the other suggestion end after
        # the current one has started?
        if compare_sugg.end > current_sugg.start
          # Then we have to indent the current suggestion
          # by one space, relatively to the
          # overlapping suggestion:
          overlap = margins[compare_sugg] + 1
        end
      end
      margins[current_sugg] = overlap
    end
    # Multiply the relative values with the absolute
    # indentation width:
    margins.each do |key, value|
      margins[key] = value * MARGIN_STEP
    end

    return margins
  end

  def get_participant_check_attributes(participant, meeting)
    att = {
        :class => "participant_check",
        :id => "uninvite_#{participant.id}"
    }
    if meeting.initiated_by?(participant)
      att.merge!({
                     :title => t('tooltips.initiator_cannot_be_uninvited')
                 })
    end
    att
  end

  def get_uninvite_participants_button_attributes(screen_size)

    if screen_size == "large"
      temp_class = "btn btn-primary btn-block"
    else
      temp_class = "btn btn-primary btn-block"
    end


    return attr = {
      :type => "submit",
      :value => t('.uninvite_button_short'),
      class: temp_class,
      :disabled => true,
      :id => if !@meeting.restricted || @user == @meeting.initiator
        then "uninvite_submit"
        else "uninvite_submit_disabled"
        end
    }

  end

  def get_uninvite_participants_button_attributes_short
    attr = {
        :type => "submit",
        class: "btn btn-primary",
        :value => t('.uninvite_button_short'),
        :disabled => true,
        :id => if !@meeting.restricted || @user == @meeting.initiator
        then "uninvite_submit"
               else "uninvite_submit_disabled"
               end
    }
  end

  def get_invite_participants_button_attributes
    attr = {
        :type => "submit",
        :value => t('.invite_participants_button'),
        :rel => invite_participants_user_meeting_path(@user, @meeting)
    }
  end

  # Returns a nicely formatted list of who is unavailable
  # in the given +FreebusyTimespan+.
  def get_busy_box_tooltip(timespan)
    content = t('tooltips.busy_users')
    content << "<ul>"
    timespan.unavailables.each_pair do |times, user|
      tag = "<li>"
      tag << l(times.first, :format => :time) + " - " + l(times.second, :format => :time)
      tag << ": " + user_name_or_email(user)
      tag << "</li>"
      content << tag
    end
    content << "</ul>"
  end

  # Returns a nicely formatted list of who is unavailable
  # in the given +FreebusyTimespan+.
  def get_busy_box_infos_for_qtip(timespan, suggestion)
    suggspan = FreebusyTimespan.new(
        suggestion.date,
        # The "from" date:
        Time.utc(suggestion.date.year, suggestion.date.month, suggestion.date.day, suggestion.start.hour, suggestion.start.min),
        # The "to" date:
        Time.utc(suggestion.date.year, suggestion.date.month, suggestion.date.day, suggestion.end.hour, suggestion.end.min)
    )
    if timespan.overlapping_with?(suggspan)
      content = "<p style='font-weight:bold; margin-top:10px;'>" + t('tooltips.busy_users_title') + "</p>"
      content << "<ul class='fb_list'>"
      timespan.unavailables.each_pair do |times, user|
        tag = "<li>"
        tag << l(times.first, :format => :time) + " - " + l(times.second, :format => :time)
        tag << ": " + user_name_or_email(user)
        tag << "</li>"
        content << tag
      end
      content << "</ul>"
    end
    return content
  end

  def start_tutorial
    if !@meeting.initiated_by?(@user) && !@user.watched_vote_tutorial?
      # Now the user has watched it:
      #@user.watched_vote_tutorial = true
      #@user.save!
      # Include everything for the "How to vote"-tutorial video:
      haml_tag :div, { :id => "play_vote_tut", :rel => "/users/"+@user.key }
    elsif @meeting.initiated_by?(@user) && !@user.watched_new_meeting_tutorial?
      #@user.watched_new_meeting_tutorial = true
      #@user.save!
      # Include everything for the "How to make a new meeting"-tutorial video:
      haml_tag :div, { :id => "play_new_meeting_tut", :rel => "/users/"+@user.key }
    end
  end

  # Returns those suggestions in the current meeting, on which
  # the current user didn't vote yet.
  def get_open_suggestions
    open = @meeting.suggestions.select { |suggestion|
      suggestion.votes.select {
          |vote| vote.voter == @user }.first.decision == Vote::DONTKNOW
    }.sort_by { |s| [ s.date, s.start, s.end ] }
    return open
  end

  # Returns a shorter name or email with an info-icon
  def get_short_name(participant, cnt, mobile)
    length = cnt
    name = user_name_or_email(participant)

    if mobile == "false"
      if (name.length > length)
        short_name = truncate(name, :length => length)
        short_name += " <i title='"+name+"' class='icon-info-circled medium_icon'>"
      else
        short_name = name
      end
      if participant.name.blank?
        short_name += " <i title='"+participant.email+"' >"
      end
      return short_name
    else
      if (name.length > length)
        short_name = truncate(name, :length => length)
        short_name += " <i title='"+name+"' >"
      else
        short_name = name
      end
      if participant.name.blank?
        short_name += " <i title='"+participant.email+"' >"
      end
      return short_name
    end
  end

end