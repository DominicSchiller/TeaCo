Rails.application.routes.draw do

  # Route Definitions for REST API
  namespace 'api' do
    resources :users, param: :key do
      get '/', to: "users#show"

      resources :meetings
    end
  end

  # Route Definitions for the TeaCo Web App
  resources :known_addresses

  root 'users#new'
  match 'users/login', :to => 'users#login', :as => "login", :via => [:get, :post]
  get 'imprint', :to => 'users#imprint', :as => 'show_imprint'
  match 'users/authenticate', :to => 'users#authenticate', :via => [:get, :post], :as => 'authenticate'

  resources :users, member_path: ':user_key' do
    resources :alias_addresses
    resources :known_addresses
    resources :tokens

    resources :meetings do
      resources :comments
      resources :suggestions do
        resources :votes
      end

      member do
        get :invite_participants
        post :invite_participants
        post :uninvite_participants
        delete :uninvite_participants
        get :send_message_form
        post :send_message
        get :send_dates
        post :send_dates
        delete :leave
      end
    end
  end

  put '/users/:user_key/meeting/:id/suggestions/pick/:id', to: 'suggestions#pick', as: 'pick_suggestion'

  get ':user_key', :to => 'users#show', :as => 'show_administration'
  get ':user_key/settings', :to => 'users#show', :as => 'show_administration_mobile'
  patch 'confirm_alias/:confirmation_hash', :to => 'alias_addresses#confirm', :as => 'confirm_alias'
  delete 'users/:user_key/delete_known_addresses', :to => 'known_addresses#delete_known_addresses', :as => 'delete_known_addresses'

  get ':user_key/userinfos', :to => 'users#get_userinfos', :as => 'userinfos'
  get ':user_key/meetinginfos/:meeting_id', :to => 'meetings#get_meetinginfos', :as => 'get_meeting_infos'
  get 'users/:user_key/meeting/:meeting_id/participants', :to => 'meetings#get_participants', :as => 'get_participants'

  get ':user_key(/:id)', :to => 'meetings#show', :as => 'show_meeting'
  get ':user_key/:id/edit', :to => 'meetings#edit', :as => 'edit_meeting'
  get ':user_key/:meeting_id(/:id)', :to => 'suggestions#show', :as => 'show_suggestion'

end





