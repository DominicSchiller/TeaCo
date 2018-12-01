class CreateVotes < ActiveRecord::Migration[5.1]
  def self.up
    create_table :votes do |t|
      t.string :decision, :null => false, :default => "?"

      t.timestamps
    end
  end

  def self.down
    drop_table :votes
  end
end
