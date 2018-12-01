module VotesHelper

  def get_vote_class_for(vote)
    case vote.decision
      when Vote::YES
        "green"
      when Vote::MAYBE
        "yellow"
      when Vote::NO
        "red"
      when Vote::DONTKNOW
        "gray"
      else
        ""
    end
  end

end
