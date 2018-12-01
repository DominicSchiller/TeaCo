class AddPickedColumnToSuggestion < ActiveRecord::Migration[5.1]
  def self.up
    add_column :suggestions, :picked, :boolean, :null => false, :default => false
  end

  def self.down
    remove_column :suggestions, :picked
  end
end
