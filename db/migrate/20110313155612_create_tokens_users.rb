class CreateTokensUsers < ActiveRecord::Migration[5.1]
  def self.up
    create_table :tokens_users, :id => false do |t|
      t.integer :token_id, :null => false
      t.integer :user_id, :null => false
    end
  end

  def self.down
    drop_table :tokens_users
  end
end