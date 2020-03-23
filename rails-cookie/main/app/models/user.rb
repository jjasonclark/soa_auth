class User < ActiveRecord::Base
  Application_id = '3f1edd7eba53fe64a82c6b1b7e3d590d456513053dc976f2807bf29b295475d1'
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :oauth_access_tokens, foreign_key: 'resource_owner_id', class_name: 'Doorkeeper::AccessToken'
  after_create :create_local_access_token

  def local_service_access_tokens
    oauth_access_tokens.where(application_id: Application_id, revoked_at: nil)
  end

  def current_local_service_access_token
    local_service_access_tokens.reject(){ |t| t.expired? || t.revoked? }.first
  end

  def after_database_authentication
    create_local_access_token
  end

  def create_local_access_token
    current_tokens = local_service_access_tokens.reject { |t| t.expired? || t.revoked? }
    unless current_tokens.first
      Doorkeeper::AccessToken.create!({
        :application_id    => Application_id,
        :resource_owner_id => id,
        :scopes            => "",
        :expires_in        => 1.week.from_now,
        :use_refresh_token => false
      })
    end
  end
end
