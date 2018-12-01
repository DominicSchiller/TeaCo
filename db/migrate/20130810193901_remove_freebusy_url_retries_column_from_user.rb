class RemoveFreebusyUrlRetriesColumnFromUser < ActiveRecord::Migration[5.1]
  def self.up
    remove_column :users, :freebusy_url_retries
  end

  def self.down
    add_column :users, :freebusy_url_retries, :integer, :default => 0
  end
end
