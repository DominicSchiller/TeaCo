class AliasAddress < ApplicationRecord

  validates_presence_of :address, :owner_id, :confirmation_hash

  belongs_to :owner, :class_name => "User", :foreign_key => "owner_id"
  before_create :secure_alias_for_master_address


  def secure_alias_for_master_address
    # def before_destroy
    # Don't allow to destroy the alias for the master address:
    if self.address == self.owner.email
      false
    else
      true
    end
  end

  def self.find_or_create(alias_address_parameters)
    # Is there an alias with the same address that was not yet confirmed?
    alias_address = AliasAddress.find_by_address_and_confirmed(alias_address_parameters[:address], false)

    # If so, delete it:
    if alias_address
      AliasAddress.delete(alias_address)
    end
    # ... and always create a new one:
    alias_address = AliasAddress.new(alias_address_parameters)

    return alias_address
  end

  protected

  def validate
    pattern = /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i

    unless self.address =~ pattern
      errors.add("address", I18n.t('activerecord.errors.email_invalid'))
    end
  end

  def validate_on_create
    # If the alias address is already activated and old and new user
    # are the same, DON'T DO IT!
    other_alias = AliasAddress.find_by_address(self.address)

    if other_alias && other_alias.owner == self.owner
      errors.add("address", I18n.t('activerecord.errors.email_already_registered'))
    end
  end

end
