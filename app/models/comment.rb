class Comment < ApplicationRecord

  # resourceful_permission methods

  def manipulable_by?(user)
    self.text != COMMENT_DELETED &&
        user.is_a?(User) &&
        (self.meeting.initiated_by?(user) || owned_by?(user))
  end

  def owned_by?(user)
    user.is_a?(User) && user == self.author
  end

  # resourceful_permission end

  # An as-unique-as-possible string
  # indicating that a comment has been deleted.
  # FIXME: This is obsolete if (as it is now) deleted
  # comments are not replaced by a "comment deleted"-string,
  # but are completely destroyed.
  COMMENT_DELETED = "[<<[##["

  belongs_to :author, :class_name => "User", :foreign_key => "author_id"
  belongs_to :meeting

  validates_presence_of :text, :author_id
  validates_length_of :text, :minimum => 1

end
