require 'socket'
require 'openssl'

include ActionView::Helpers::TextHelper
include UsersHelper

class PushService < ApplicationRecord

  @messages = Array.new

  def self.add_invitation(recipient, meeting, inviting_user)
    title = truncate(meeting.title, :length => 30)
    options = {:alert => I18n.t('push.invitation_message', :name => self.email_name(inviting_user), :title => title),
               :badge => not_yet_voted_count(recipient),
               :custom_properties => {
                   :t => "#{title}",
                   :v => "#{meeting.id},#{(meeting.initiator == recipient) ? 1 : 0},#{(meeting.restricted) ? 1 : 0}"
               }
    }
    # Add notification to messages for every device registered by the recipient
    recipient.tokens.each do |token|
      @messages.push(self.message_for_sending(options, token.token))
    end
  end

  def self.add_user_message(recipient, message, meeting, author)
    title = truncate(meeting.title, :length => 30)
    options = {:alert => I18n.t('push.user_message', :name => self.email_name(author), :title => title, :message => message),
               :badge => not_yet_voted_count(recipient),
               :custom_properties => {
                   :t => "#{title}",
                   :v => "#{meeting.id},#{(meeting.initiator == recipient) ? 1 : 0},#{(meeting.restricted) ? 1 : 0}"
               }
    }
    # Add notification to messages for every device registered by the recipient
    recipient.tokens.each do |token|
      @messages.push(self.message_for_sending(options, token.token))
    end
  end

  def self.add_final_dates_confirmation(recipient, meeting, final_dates, location)
    title = truncate(meeting.title, :length => 30)
    alert = (meeting.picked_suggestions.size > 1) ? I18n.t('push.final_dates_multi', :title => title, :dates => final_dates) : I18n.t('push.final_dates_single', :title => title, :dates => final_dates)
    (!location.blank?) ? alert << I18n.t('push.location', :location => location) : alert
    options = {:alert => alert,
               :badge => not_yet_voted_count(recipient),
               :custom_properties => {
                   :t => "#{title}",
                   :v => "#{meeting.id},#{(meeting.initiator == recipient) ? 1 : 0},#{(meeting.restricted) ? 1 : 0}"
               }
    }
    # Add notification to messages for every device registered by the recipient
    recipient.tokens.each do |token|
      @messages.push(self.message_for_sending(options, token.token))
    end
  end

  def self.add_comment_notification(comment, recipient)
    title = truncate(comment.meeting.title, :length => 30)
    options = {:alert => I18n.t('push.comment_message', :name => self.email_name(comment.author), :title => title, :message => comment.text),
               :badge => not_yet_voted_count(recipient),
               :custom_properties => {
                   :t => "#{title}",
                   :v => "#{comment.meeting.id},#{(comment.meeting.initiator == recipient) ? 1 : 0},#{(comment.meeting.restricted) ? 1 : 0},#{comment.id}"
               }
    }
    # Add notification to messages for every device registered by the recipient
    recipient.tokens.each do |token|
      @messages.push(self.message_for_sending(options, token.token))
    end
  end

  def self.send_notifications()
    begin
      self.open_connection do |conn, sock|
        # Push each message in messages in one connection
        @messages.each do |message|
          conn.write(message)
        end
        # Clear messages after sending
        self.clear_notifications()
      end
    rescue Exception => e
      ::Rails.logger.info e
    end
  end

  def self.clear_notifications()
    @messages.clear
  end

  def self.message_for_sending(options, device_token)
    json = self.apple_hash(options).to_json
    token = [device_token.to_s()].pack('H*')
    message = "\0\0 #{token}\0#{json.length.chr}#{json}"
    return message
  end

  def self.apple_hash(options)
    result = {}
    result['aps'] = {}
    result['aps']['alert'] = self.truncate_message(options[:alert])
    result['aps']['badge'] = options[:badge].to_i if options[:badge]
    if options[:custom_properties]
      options[:custom_properties].each do |key,value|
        result["#{key}"] = "#{value}"
      end
    end
    return result
  end

  def self.truncate_message(message)
    if !message.blank? && message.size > 150
      message = truncate(message, :length => 150)
    end
    return message
  end

  def self.open_connection
    options = {:cert => File.join(::Rails.root.to_s, 'config', 'apns-dev.pem'),
               :host => 'gateway.sandbox.push.apple.com',
               :port => 2195}

    cert = File.read(options[:cert])
    ctx = OpenSSL::SSL::SSLContext.new
    ctx.key = OpenSSL::PKey::RSA.new(cert)
    ctx.cert = OpenSSL::X509::Certificate.new(cert)

    sock = TCPSocket.new(options[:host], options[:port])
    ssl = OpenSSL::SSL::SSLSocket.new(sock, ctx)
    ssl.sync = true
    ssl.connect

    yield ssl, sock

    ssl.close
    sock.close
  end

  def self.email_name(user)
    if user.name.blank?
      user.email
    else
      user.name
    end
  end

end
