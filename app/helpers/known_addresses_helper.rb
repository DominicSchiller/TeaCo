module KnownAddressesHelper

  def sort_for_list!(known_addresses)
    known_addresses.sort{ |known_a, known_b|
      a = User.find_by_alias(known_a.address)
      if a && !a.name.blank?
        a = a.name.downcase
      else
        a = known_a.address.downcase
      end
      b = User.find_by_alias(known_b.address)
      if b && !b.name.blank?
        b = b.name.downcase
      else
        b = known_b.address.downcase
      end
      a <=> b
    }.to_a
    return known_addresses
  end

  def get_delete_known_addresses_button_attributes(size)

    if size == "small"
      button = " btn-block"
    else
      button = ""
    end

    attr = {
        type: "submit",
        value: t('users.show.delete'),
        title: t('users.show.delete'),
        class: "btn btn-secondary panel_button" + button,
        disabled: true,
        id: "delete_known_addresses_submit",
    }
  end

end
