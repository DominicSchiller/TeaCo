module UsersHelper

  # Returns a link to delete or leave the given +meeting+, depending
  # on whether the +user+ is its initiator or not.
  #def insert_delete_or_leave_link(user, meeting)
  #  if meeting.destroyable_by?(user)
  #    link_to t('users.show.delete'), user_meeting_path(@user, meeting),method: :delete, data: { confirm: 'Are you sure?' }
  #
  #    #link_to image_tag("icons/delete_white.png", width: "15px"), '#', :rel => user_meeting_path(@user, meeting), :class => "confirmed btn btn-primary"
  #  else
  #    link_to t('users.show.leave'), '#', :rel => leave_user_meeting_path(@user, meeting), :class => "confirmed"
  #    #link_to image_tag("icons/leaven.png"), '#', :rel => leave_user_meeting_path(@user, meeting), :class => "confirmed"
  #  end
  #end

  # Function for native iPhone app
  # Returns a link to delete or leave the given +meeting+, depending
  # on whether the +user+ is its initiator or not.
  def insert_delete_or_leave_link_native(user, meeting)
    if meeting.destroyable_by?(user)
      user_meeting_path(@user, meeting)
    else
      leave_user_meeting_path(@user, meeting)
    end
  end

  # Returns a select-tag with all languages available.
  def insert_language_selector(default_lang)
    options = { "Deutsch" => "de", "English" => "en", "Français" => "fr" }
    select "user", "language", options, {selected: default_lang}, class: 'form-control'
  end



  def get_pick_address_attributes(alias_address, user)
    address = alias_address.address
    is_master = address == user.email
    title = is_master ? t('tooltips.is_master_address') : t('tooltips.make_master_address')
    css_class = "tipped_top" + ( is_master ? " icon-star medium_icon" : " icon-star-empty medium_icon make_active" )

    {
        title: title,
        class: css_class,
        rel: address
    }

  end

  # Returns 'true' if user has voted on all
  # suggestions of the given meeting, else 'false'
  def user_has_voted(user, meeting)
    meeting.suggestions.each do |suggestion|
      if suggestion.meeting_id == meeting.id
        suggestion.votes.each do |vote|
          if vote.voter_id == user.id && vote.decision == Vote::DONTKNOW
            return false
          end
        end
      end
    end
    return true
  end

  # Returns 'true' if user has voted on all
  # suggestions of the given meeting, else 'false'
  def meeting_info_for(user, meeting)
    picked_count = decision = votes_total = votes = 0
    meeting.suggestions.each do |suggestion|
      if suggestion.meeting_id == meeting.id
        votes_total = votes_total + suggestion.votes.length
        votes = votes + suggestion.votes.length
        suggestion.votes.each do |vote|
          if vote.decision == Vote::DONTKNOW
            votes = votes - 1
            if vote.voter_id == user.id
              decision = 1
            end
          end
        end
        if suggestion.picked
          picked_count = picked_count + 1
        end
      end
    end
    return [(decision == 0) ? true : false, votes_total == 0 ? 'n/a' : (votes * 100.0 / votes_total).round, picked_count]
  end

  # Returns the percentage of the voted suggestions
  def get_percentage_of_open_suggestions(meeting)
    not_voted = all = 0
    meeting.suggestions.each do |suggestion|
      suggestion.votes.each do |vote|
        all += 1
        if vote.decision == Vote::DONTKNOW
          not_voted += 1
        end
      end
    end
    if all == 0
      percent_voted = 0
    else
      percent_voted = 100 * (all - not_voted) / all
    end
    return percent_voted.round
  end

  def not_yet_voted_count(user)
    cnt = 0
    user.meetings.each do |meeting|
      if !meeting_info_for(user, meeting)[0]
        cnt = cnt + 1
      end
    end
    return cnt
  end

end
