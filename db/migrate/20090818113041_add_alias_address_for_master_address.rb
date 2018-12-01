class AddAliasAddressForMasterAddress < ActiveRecord::Migration[5.1]
  def self.up
    User.all.each do |user|
      a = AliasAddress.new(
        :address => user.email,
        :owner_id => user.id,
        :confirmed => true,
        :confirmation_hash => "none")
      user.alias_addresses << a
    end
  end

  def self.down
    User.all.each do |user|
      a = AliasAddress.find_by_address(user.email)
      user.alias_addresses.delete(a) if a
    end
  end
end
