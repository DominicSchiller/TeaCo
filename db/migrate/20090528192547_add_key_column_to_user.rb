class AddKeyColumnToUser < ActiveRecord::Migration[5.1]
  def self.up
    add_column :users, :key, :string, :null => false
  end

  def self.down
    remove_column :users, :key
  end
end
