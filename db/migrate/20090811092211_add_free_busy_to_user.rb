class AddFreeBusyToUser < ActiveRecord::Migration[5.1]
  def self.up
    add_column :users, :freebusy_url, :string, :null => false, :default => ""
    add_column :users, :freebusy_data, :text, :null => false, :default => ""
    User.all.each do |user|
      user.freebusy_url = ""
      user.freebusy_data = ""
      user.save!
    end
  end

  def self.down
    remove_column :users, :freebusy_url
    remove_column :users, :freebusy_data
  end
end
