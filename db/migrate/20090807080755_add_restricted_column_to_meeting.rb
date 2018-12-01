class AddRestrictedColumnToMeeting < ActiveRecord::Migration[5.1]
  def self.up
    add_column :meetings, :restricted, :boolean, :default => false, :null => false
    Meeting.all.each do |meeting|
      meeting.restricted = false
      meeting.save!
    end
  end

  def self.down
    remove_column :meetings, :restricted
  end
end
