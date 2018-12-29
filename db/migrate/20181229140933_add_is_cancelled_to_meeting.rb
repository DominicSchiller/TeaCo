class AddIsCancelledToMeeting < ActiveRecord::Migration[5.1]
  def change
    add_column :meetings, :is_cancelled, :boolean
    Meeting.all.each do |meeting|
      meeting.is_cancelled = false
      meeting.save!
    end
  end
end
