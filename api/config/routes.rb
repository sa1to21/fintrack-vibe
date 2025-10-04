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
      resources :users, only: [:show, :update, :destroy]

      # Accounts
      resources :accounts do
        resources :transactions, only: [:index, :create]
      end

      # Transactions
      resources :transactions, only: [:show, :update, :destroy]

      # Categories
      resources :categories, only: [:index, :show]

      # Analytics
      get '/analytics/summary', to: 'analytics#summary'
      get '/analytics/monthly', to: 'analytics#monthly'
      get '/analytics/categories', to: 'analytics#by_category'
    end
  end
end
