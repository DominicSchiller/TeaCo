class CreateSuggestions < ActiveRecord::Migration[5.1]
  def self.up
    create_table :suggestions do |t|
      t.integer :meeting_id, :null => false
      t.date :date, :null => false
      t.time :start, :null => false
      t.time :end, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :suggestions
  end
end
