class AddUsersToTables < ActiveRecord::Migration[5.1]
  def self.up
    # Join table for which users are participants on which meeting:
    create_table :meetings_users, :id => false do |t|
      t.integer :meeting_id, :null => false
      t.integer :user_id, :null => false
    end

    # Add initiator to every meeting:
    change_table :meetings do |t|
      t.column :initiator_id, :integer, :null => false
    end

    # Add creator to every suggestion:
    change_table :suggestions do |t|
      t.column :creator_id, :integer, :null => false
    end

    # Add voter to every vote:
    change_table :votes do |t|
      t.column :voter_id, :integer, :null => false
    end

  end

  def self.down

    remove_column :votes, :voter_id

    remove_column :suggestions, :creator_id

    remove_column :meetings, :initiator_id

    drop_table :meetings_users
  end
end
