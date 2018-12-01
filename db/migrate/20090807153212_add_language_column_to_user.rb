class AddLanguageColumnToUser < ActiveRecord::Migration[5.1]
  def self.up
    add_column :users, :language, :string, :null => false, :default => "de"
    User.all.each do |user|
      user.language = "de"
    end
  end

  def self.down
    remove_column :users, :language
  end
end
