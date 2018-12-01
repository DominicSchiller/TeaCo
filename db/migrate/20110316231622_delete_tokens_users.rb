class DeleteTokensUsers < ActiveRecord::Migration[5.1]
  def self.up
    drop_table :tokens_users
  end

  def self.down
  end
end
