require 'digest/sha1'
class AliasAddressesController < ApplicationController

  # layout 'users'

  before_action :build_object, only: [:create, :new]
  before_action :load_object
  before_action :set_language
  before_action :create_confirmation_hash, only: [:create]

  # make_resourceful do
  #   build :create, :destroy, :index
  #   belongs_to :user

  #   response_for :index do |format|
  #     format.mobile {
  #       load_user
  #       email_array = Array.new
  #       email_addresses = AliasAddress.find_all_by_owner_id(@user.id)
  #       email_addresses.each do |address|
  #         primary = false
  #         if address.address == @user.email
  #           primary = true
  #         end
  #         entry = Hash.new
  #         entry = {
  #           :id => address.id,
  #           :email => address.address,
  #           :primary => primary,
  #           :confirmed => address.confirmed
  #         }
  #         email_array << entry
  #       end
  #       render :json => email_array
  #     }
  #   end

  def create
    if @alias_address.save
      flash[:notice] = t("notices.alias_address_created")
      # TODO Kommentar entfernen, wenn funktionsfähig!
      #TeacoMailer.alias_confirmation(@alias_address.address, @alias_address.confirmation_hash).deliver
      respond_to do |format|
        format.html
        format.js { render :file => "alias_addresses/create.js.erb" }
        # format.mobile
        # format.iphone_native { render :file => "shared/show_errors_iphone_native.js.erb", :status => 500 }
      end
    else
      flash[:alert] = t("alerts.error")
      respond_to do |format|
        format.html
        format.js { render :file => "shared/show_errors.js.erb" }
      end
    end
  end

  def destroy
    @alias_address = AliasAddress.find_by_id(params[:id])
    if @alias_address.owner.id == @user.id
      flash[:notice] = t("notices.alias_address_deleted")
      @alias_address.destroy
      respond_to do |format|
        format.html
        format.js { render :file => "alias_addresses/destroy.js.erb" }
        # format.mobile
        # format.iphone_native{ render :file => "alias_addresses/destroy_iphone_native.haml" }
        # format.android_native{ render :file => "alias_addresses/destroy_android_native.haml" }
      end
    end
  end

  # end

  # If called with a confirmation hashkey in +params[:confirmation_hash]+,
  # this will activate the corresponding alias address:
  def confirm
    confirmation_hash = params[:confirmation_hash]
    if confirmation_hash.nil?
      respond_to do |format|
        format.html {
          @page_title = I18n.t('errors.confirmation_failed')
          @user = nil
          render :template => "alias_addresses/confirmation_failed_#{I18n.locale}.haml", :layout => "users"
        }
      end
      return
    end

    confirmed_address = AliasAddress.find_by_confirmation_hash(confirmation_hash)

    # No address with the given hash key was found,
    # or the address was already activated:
    if confirmed_address.nil? || confirmed_address.confirmed
      respond_to do |format|
        format.html {
          @page_title = I18n.t('errors.confirmation_failed')
          @user = nil
          render :template => "alias_addresses/confirmation_failed_#{I18n.locale}.haml", :layout => "users"
        }
      end
      return
    end

    # If there was already a user with the specified e-mail address,
    # merge his meetings into the "master" account:
    other_user = AliasAddress.find_by_address_and_confirmed(confirmed_address.address, true)

    confirmed_address.confirmed = true
    confirmed_address.save!

    new_user = confirmed_address.owner

    if other_user
      other_user = other_user.owner
      meetings = other_user.meetings
      meetings.each do |meeting|
        # Is the "master" user invited to this meeting as well?
        double_invite = meeting.participants.include?(new_user)

        meeting.suggestions.each do |suggestion|

          # If both are participants, simply delete all votes by the other user:
          if double_invite
            to_delete = suggestion.votes.select { |vote| vote.voter == other_user }
            suggestion.votes.delete(to_delete)
          else
            # Otherwise, replace the voter of the vote if neccessary:
            suggestion.votes.each do |vote|
              if vote.voter == other_user
                vote.voter = new_user
                vote.save!
                break
              end
            end
          end

          # Replace the creator of the suggestion if neccessary:
          if suggestion.creator == other_user
            suggestion.creator = new_user
          end
          suggestion.save!
        end
        meeting.comments.select{ |c| c.author == other_user }.each do |comment|
          # Replace the comment author if neccessary:
          comment.author = new_user
          comment.save!
        end
        # Switch the initiator of the meeting if neccessary:
        meeting.initiator = new_user if meeting.initiator == other_user

        # Switch the participants of the meeting:
        meeting.participants.delete(other_user)
        meeting.participants << new_user unless double_invite

        meeting.save!
      end

      # Also, make all the alias addresses of other_user over
      # to new_user (by copying them - this is neccessay as
      # the "alias_addresses" accociation has the
      # ":dependent => :destroy" option and all aliases would
      # therefore be lost when the other_user is deleted):
      other_user.alias_addresses.each do |address|
        new_user.alias_addresses << AliasAddress.new(
            :owner_id => new_user.id,
            :address => address.address,
            :confirmation_hash => address.confirmation_hash,
            :confirmed => address.confirmed
        )
      end

      # And finally, delete the now redundant other user:
      other_user.destroy

      # Delete the now obsolete alias (one for its address
      # has already been taken over from the other user):
      confirmed_address.destroy

      # And don't forget to save the manipulated user:
      new_user.save!

    end

    @alias_address = confirmed_address

    I18n.locale = @alias_address.owner.language

  end


  def create_confirmation_hash
    if @alias_address && @alias_address.new_record?
      # Find the alias a key that is not yet in use:
      key = ""
      loop do
        key = Digest::SHA1.hexdigest(Time.now.to_s << "#" << @alias_address.address)
        break unless AliasAddress.find_by_confirmation_hash(key)
      end
      @alias_address.confirmation_hash = key
      @alias_address.confirmed = false
    end
  end


  private

  def load_object
    load_user
    # In case "new" or "create" was called, the newley created alias_address is
    # stored in @current_object:
    if @current_object
      @alias_address = @current_object
    end
  end

  def build_object
    if params[:alias_address].nil?
      @current_object = AliasAddress.new(alias_address_params)
    else
      @current_object = AliasAddress.find_or_create(alias_address_params)
    end
  end

  def alias_address_params
    params.require(:alias_address).permit(:id, :address, :owner_id, :confirmation_hash, :confirmed, :created_at, :updated_at)
  end

end
