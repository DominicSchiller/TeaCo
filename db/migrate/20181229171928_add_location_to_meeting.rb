class AddLocationToMeeting < ActiveRecord::Migration[5.1]
  def change
    add_column :meetings, :location, :string, :default => "", :null => false
    Meeting.all.each do |meeting|
      if meeting.location == nil
        meeting.location = ""
        meeting.save!
      end
    end
  end
end
