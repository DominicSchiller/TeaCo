class CreateComments < ActiveRecord::Migration[5.1]
  def self.up
    create_table :comments do |t|
      t.integer :author_id, :null => false
      t.integer :meeting_id, :null => false
      t.text :text, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :comments
  end
end
