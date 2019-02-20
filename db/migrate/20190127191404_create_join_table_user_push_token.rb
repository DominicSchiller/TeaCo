class CreateJoinTableUserPushToken < ActiveRecord::Migration[5.1]
  def change
    create_join_table :users, :push_tokens do |t|
      # t.index [:user_id, :push_token_id]
      # t.index [:push_token_id, :user_id]
    end
  end
end
