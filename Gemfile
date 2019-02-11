source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end


# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 5.1.4'
# Use mysql as the database for Active Record
gem 'mysql2', '~> 0.5.2'
# Use Puma as the app server
gem 'puma', '~> 3.7'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# use rack-cors to allow Cross-Origin Resource Sharing (CORS)
gem 'rack-cors', :require => 'rack/cors'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby

# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
# gem 'turbolinks', '~> 5.0', '>= 5.0.1'

# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '~> 4.2'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.5'
# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 3.0'
# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use Capistrano for deployment
gem 'capistrano-rails', group: :development

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara', '~> 2.13'
  gem 'selenium-webdriver'
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'web-console', '>= 3.3.0'
  gem 'debase'
  gem 'ruby-debug-ide', '0.7.0.beta6'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

# Gibt genauere Fehlermeldungen für Entwicklungsarbeiten zurück
gem 'better_errors', '~> 2.4'


# = = = = = = = = = = TeaCo = = = = = = = = = =
gem 'ri_cal'
gem 'whenever', :require => false
gem 'haml', '~> 5.0', '>= 5.0.1'
gem 'tilt', '~> 2.0', '>= 2.0.7'
gem 'responders', '~> 2.4'
gem 'fontello_rails_converter'
gem 'will_paginate', '~> 3.1', '>= 3.1.6'
gem 'rails-i18n', '~> 5.0.0' # For 5.0.x and 5.1.x

# = = = = = = = = = = Firebase = = = = = = = = = =
gem 'fcm', '~> 0.0.6'

# = = = = = = = = = = Bootstrap = = = = = = = = = =
gem 'bootstrap3-rails', '~> 3.2'
gem 'bootstrap-sass', '~> 3.3', '>= 3.3.7'
gem 'data-confirm-modal', '~> 1.6', '>= 1.6.2'

# = = = = = = = = = = Bootstrap Datepicker = = = = = = = = = =
gem 'momentjs-rails', '~> 2.20', '>= 2.20.1'
gem 'bootstrap-datepicker-rails', '~> 1.8', '>= 1.8.0.1'

# = = = = = = = = = = JQuery = = = = = = = = = =
gem 'jquery-migrate-rails', '~> 1.2', '>= 1.2.1'
gem 'jquery-rails', '~> 4.3', '>= 4.3.3'
