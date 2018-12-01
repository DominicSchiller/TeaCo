class AddSuggestionIdToVote < ActiveRecord::Migration[5.1]
  def self.up
    add_column :votes, :suggestion_id, :integer, :null => false
  end

  def self.down
    remove_column :votes, :suggestion_id
  end
end
