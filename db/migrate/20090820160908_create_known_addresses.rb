class CreateKnownAddresses < ActiveRecord::Migration[5.1]
  def self.up
    create_table :known_addresses do |t|
      t.string :address
      t.integer :owner_id

      t.timestamps
    end

    User.all.each do |user|
      user.meetings.each do |meeting|
        meeting.participants. each do |participant|
          KnownAddress.update_or_create(participant.email, user)
        end
      end
    end

  end

  def self.down
    drop_table :known_addresses
  end
end
