class KnownAddressesController < ApplicationController
  include KnownAddressesHelper

  # make_resourceful do
  #   build :index, :create, :destroy, :update

  #   belongs_to :user
  before_action :load_objects

  def index
    respond_to do |format|
      format.js do
        address_array = []
        sort_for_list!(@known_addresses)
        if @meeting
          @known_addresses = @known_addresses.reject { |known| @meeting.participants.include?(User.find_by_alias(known.address)) }
        end
        @known_addresses.each do |address|
          entry = {}
          # Try to find a user to that address:
          user = User.find_by_alias(address.address)
          # If there is a name to that email address, find it:
          name = nil
          name = user.name if user && !user.name.blank?
          entry = if name
                    {
                      name: name,
                      address: address.address
                    }
                  else
                    { address: address.address }
                  end

          address_array << entry
        end
        render json: address_array
      end
      # format.mobile {
      #       address_array = Array.new
      #       sort_for_list!(@known_addresses)
      #       if @meeting
      #         @known_addresses = @known_addresses.reject{ |known| @meeting.participants.include?(User.find_by_alias(known.address)) }
      #       end
      #       @known_addresses.each do |address|
      #         entry = Hash.new
      #         user = User.find_by_alias(address.address)
      #         name = nil
      #         if user && !user.name.blank?
      #             name = user.name
      #         end
      #         entry = {
      #           :name => name,
      #           :address => address.address
      #         }
      #         address_array << entry
      #       end
      #       render :json => address_array
      #     }
    end
  end

  def destroy
    respond_to do |format|
      flash[:notice] = t("notices.known_address_deleted")
      format.js { render file: 'known_addresses/destroy.js.erb' }
      format.html
    end
  end

  def delete_known_addresses
    load_objects
    known_addresses = params[:known_addresses_ids]
    if known_addresses.nil?
      # TODO: Fehlermeldung (500, Serverfehler)
      return
    end
    #known_addresses = known_addresses.values if known_addresses.is_a? Hash
    #unless known_addresses.is_a? Array
    #  # TODO: Fehlermeldung (500, Serverfehler)
    #  return
    #end

    known_addresses = known_addresses.values

    known_addresses.map! { |id| KnownAddress.find_by_id(id) }
    known_addresses.compact!
    @user.known_addresses.delete(known_addresses)

    respond_to do |format|
      format.js { render file: 'known_addresses/delete_known_addresses.js.erb' }
      format.html
    end
  end

  private

  def load_objects
    load_user
    load_meeting
    @current_objects = @user.known_addresses
    @known_addresses = @current_objects
  end

  def load_parent_object
    load_user
    load_meeting
  end

  def known_address_params
    params.require(:alias_address).permit(:address, :owner_id, :confirmation_hash, :confirmed)
  end
end
