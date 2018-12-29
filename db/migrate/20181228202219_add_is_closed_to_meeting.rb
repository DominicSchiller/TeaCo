class AddIsClosedToMeeting < ActiveRecord::Migration[5.1]
  def change
    add_column :meetings, :is_closed, :boolean
    Meeting.all.each do |meeting|
      is_closed = false
      meeting.suggestions.each do |suggestion|
        if suggestion.picked
          is_closed = true
        end
      end
      meeting.is_closed = is_closed
      meeting.save!
    end
  end

  def self.down
    remove_column :meetings, :is_closed
  end
end
