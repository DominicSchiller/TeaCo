class AddUpdatedAtToTokens < ActiveRecord::Migration[5.1]
  def self.up
    add_column :tokens, :updated_at, :datetime
  end

  def self.down
    remove_column :updated_at
  end
end
