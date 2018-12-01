set :application, "teaco3"
set :repository,  "ssh://git@teaco3.informatik.uni-hamburg.de:1026/home/git/teaco3.git"
set :local_repository,  "ssh://git@teaco3.informatik.uni-hamburg.de:1026/home/git/teaco3.git"
set :scm, :git
set :branch, "master"

set :user, "triduong.tran"
set :port, "1026"
set :password, "teaco3deploy"

set :use_sudo, true
set :deploy_to, "/opt/rails/#{application}"
#set :deploy_via, :remote_cache

default_run_options[:pty] = true

# set :scm, :git # You can set :scm explicitly or Capistrano will make an intelligent guess based on known version control directory names
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

role :web, "teaco3.informatik.uni-hamburg.de"                          # Your HTTP server, Apache/etc
role :app, "teaco3.informatik.uni-hamburg.de"                          # This may be the same as your `Web` server
role :db,  "teaco3.informatik.uni-hamburg.de", :primary => true # This is where Rails migrations will run
# role :db,  "your slave db-server here"

# if you want to clean up old releases on each deploy uncomment this:
# after "deploy:restart", "deploy:cleanup"

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# require "whenever/capistrano"
# set :whenever_command, "bundle exec whenever"

# If you are using Passenger mod_rails uncomment this:
namespace :deploy do
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "touch #{current_path}/tmp/restart.txt"
  end
end
