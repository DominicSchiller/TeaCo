class AddOwnerIdColumnToTokens < ActiveRecord::Migration[5.1]
  def self.up
    add_column :tokens, :owner_id, :integer, :null => false
  end

  def self.down
    remove_column :owner_id
  end
end
