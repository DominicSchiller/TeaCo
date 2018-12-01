class Token < ApplicationRecord

  validate :check_duplicate, on: :create

  validates_presence_of :token, :owner_id

  belongs_to :owner, :class_name => "User", :foreign_key => "owner_id"

  protected

  def check_duplicate
    other_token = Token.find_by_token(self.token)
    if other_token
      Token.delete(other_token)
    end
  end

end
