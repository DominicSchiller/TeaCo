class CreatePushTokens < ActiveRecord::Migration[5.1]
  def change
    create_table :push_tokens do |t|
      t.string :token
      t.string :device_class
      t.string :operating_system

      t.timestamps
    end
  end
end
