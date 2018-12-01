class CreateMeetings < ActiveRecord::Migration[5.1]
  def self.up
    create_table :meetings do |t|
      t.string :title, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :meetings
  end
end
