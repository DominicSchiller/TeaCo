class KnownAddress < ApplicationRecord

  belongs_to :owner, :class_name => "User", :foreign_key => "owner_id"

  # Finds the known_address with the given email address owned by the given
  # in the database, updates its +updated_at+ field and returns it, or - if
  # there is no known_adress with the given address and user in the
  # database - creates a new known address and saves it.
  def self.update_or_create(address, user)
    known = KnownAddress.find_by_address_and_owner_id(address, user.id)
    if known
      known.updated_at = Time.now
      known.save!
    else
      known = KnownAddress.create({ :owner_id => user.id, :address => address })
    end
  end

  protected

  def validate
    pattern = /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,5}\b/i

    unless self.address =~ pattern
      errors.add("address", I18n.t('activerecord.errors.email_invalid'))
    end

  end

end
