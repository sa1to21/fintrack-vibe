Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    # Telegram Authentication (без версионирования для упрощения)
    post '/auth/telegram', to: 'telegram_auth#authenticate'

    namespace :v1 do
      # Authentication
      post '/auth/login', to: 'auth#login'
      post '/auth/register', to: 'auth#register'
      get '/auth/me', to: 'auth#me'

      # Users
      resources :users, only: [:show, :update, :destroy] do
        collection do
          get :current
          put :current, action: :update_current
        end
      end

      # Accounts
      resources :accounts do
        resources :transactions, only: [:index, :create]
      end

      # Transactions
      resources :transactions, only: [:show, :update, :destroy]

      # Categories
      resources :categories, only: [:index, :show, :create, :update, :destroy]

      # Dashboard - unified endpoint for accounts + recent transactions
      get '/dashboard', to: 'dashboard#index'
      get '/dashboard/monthly_stats', to: 'dashboard#monthly_stats'

      # Analytics
      get '/analytics/summary', to: 'analytics#summary'
      get '/analytics/monthly', to: 'analytics#monthly'
      get '/analytics/categories', to: 'analytics#by_category'
      get '/analytics/accounts_balance', to: 'analytics#accounts_balance'
      get '/analytics/comparison', to: 'analytics#comparison'
      get '/analytics/insights', to: 'analytics#insights'

      # User Data Management
      delete '/user_data', to: 'user_data#destroy_all'

      # Transfers
      post '/transfers', to: 'transfers#create'
      put '/transfers/:transfer_id', to: 'transfers#update'
      delete '/transfers/:transfer_id', to: 'transfers#destroy'
    end
  end
end
