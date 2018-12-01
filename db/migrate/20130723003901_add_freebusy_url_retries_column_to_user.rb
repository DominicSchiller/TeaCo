class AddFreebusyUrlRetriesColumnToUser < ActiveRecord::Migration[5.1]
  def self.up
    add_column :users, :freebusy_url_retries, :integer, :default => 0
  end

  def self.down
    remove_column :users, :freebusy_url_retries
  end
end
