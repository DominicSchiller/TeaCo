class CreateAliasAddresses < ActiveRecord::Migration[5.1]
  def self.up
    create_table :alias_addresses do |t|
      t.string :address, :null => false
      t.integer :owner_id, :null => false
      t.string :confirmation_hash, :null => false
      t.boolean :confirmed, :default => false
      t.timestamps
    end
  end

  def self.down
    drop_table :alias_addresses
  end
end
