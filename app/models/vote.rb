class Vote < ApplicationRecord

  YES = "yes"
  MAYBE = "maybe"
  NO = "no"
  DONTKNOW = "?"

  validates_presence_of :decision, :suggestion_id, :voter_id

  validates_inclusion_of :decision, :in => [Vote::YES, Vote::MAYBE, Vote::NO, Vote::DONTKNOW ],
                         :message => "Decision for a vote must be either yes, no, maybe or ?"

  belongs_to :voter, :class_name => "User", :foreign_key => "voter_id"

  belongs_to :suggestion

end
