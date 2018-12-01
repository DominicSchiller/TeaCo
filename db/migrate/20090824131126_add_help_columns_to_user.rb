class AddHelpColumnsToUser < ActiveRecord::Migration[5.1]
  def self.up
    add_column :users, :watched_vote_tutorial, :boolean, :null => false, :default => false
    add_column :users, :watched_new_meeting_tutorial, :boolean, :null => false, :default => false
  end

  def self.down
    remove_column :users, :watched_new_meeting_tutorial
    remove_column :users, :watched_vote_tutorial
  end
end
