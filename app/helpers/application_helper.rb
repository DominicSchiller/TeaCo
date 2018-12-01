module ApplicationHelper

  def ajax_link_to(name, options = {}, method = 'GET', html_opt = {})
    classes = 'ajax method_' + method + ' ' + (html_opt[:class] ? html_opt[:class] : "")
    html_options = {}.merge html_opt
    html_options[:class] = classes
    link_to(name, options, html_options)
  end

  # Renders a +&block+, which is surrounded by a div with
  # the specified +attributes+ if +condition+ is true.
  def conditional_div(condition, attributes, &block)
    if condition
      haml_tag :div, attributes, &block
    else
      haml_concat capture_haml(&block)
    end
  end

  # Returns the name of the user, if it is not blank,
  # or otherwise his email.
  def user_name_or_email(user)
    user.name.blank? ? user.email : user.name
  end

  # Returns the name of the user, if it is not blank,
  # or otherwise his email.
  def user_name_or_email_escaped(user)
    user.name.blank? ? user.email : CGI.escapeHTML(user.name)
  end

  # Shows the errors stored in the instance objects
  def display_errors(page)
    errors = Array.new
    if @suggestion
      errors.concat @suggestion.errors.full_messages
    end
    if @meeting
      errors.concat @meeting.errors.full_messages
    end
    if @comment
      errors.concat @comment.errors.full_messages
    end
    if @user
      errors.concat @user.errors.full_messages
    end
    if @alias_address
      errors.concat @alias_address.errors.full_messages
    end

    unless errors.blank?
      page.remove "errors"
      page.insert_html :top, "body", :partial => "shared/errors.haml", :locals => { :errors => errors }
    end
  end

  # Shows the errors stored in the instance objects
  def display_errors_iphone(page)
    errors = Array.new
    if @suggestion
      errors.concat @suggestion.errors.full_messages
    end
    if @meeting
      errors.concat @meeting.errors.full_messages
    end
    if @comment
      errors.concat @comment.errors.full_messages
    end
    if @user
      errors.concat @user.errors.full_messages
    end
    if @alias_address
      errors.concat @alias_address.errors.full_messages
    end

    unless errors.blank?
      page.remove "errors"
      page.insert_html :top, "body", :partial => "shared/errors.iphone", :locals => { :errors => errors }
      page.call "scroll", "(0, 1)"
    end
  end

  # Shows the errors stored in the instance objects
  def display_errors_iphone_native(page)
    errors = Array.new
    if @suggestion
      errors.concat @suggestion.errors.full_messages
    end
    if @meeting
      errors.concat @meeting.errors.full_messages
    end
    if @comment
      errors.concat @comment.errors.full_messages
    end
    if @user
      errors.concat @user.errors.full_messages
    end
    if @alias_address
      errors.concat @alias_address.errors.full_messages
    end

    unless errors.blank?
      page.remove "errors"
    end
  end

  # Converts the given input text to HTML via Markdown/Maruku.
  def format_input(text)
    #text.blank? ? "" : Maruku.new(html_escape(text)).to_html TODO obsolete mit Textile statt Markdown
    #text.blank? ? "" : textilize(html_escape(text))
    text.blank? ? "" : text
  end

  # Replaces the \n line break with \r
  # \n causes two spaces on a new line on the iPhone
  def line_break(text)
    text.gsub("\n", "\r")
  end

  # Replaces the \n line break with \r
  def line_break_android(text)
    text.gsub("\n", "\r\r\r")
  end

end
