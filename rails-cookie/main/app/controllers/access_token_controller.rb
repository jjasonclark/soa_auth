class AccessTokenController < ApplicationController
  skip_before_filter :verify_authenticity_token, only: :verify

  def verify
    access_token = params[:access_token]
    if access_token.present?
      token = Doorkeeper::AccessToken.where(token: access_token).first
      @valid = token && !token.expired? && !token.revoked?
    else
      @valid = false
    end

    respond_to do |format|
      format.json do
        render text: { valid: @valid }.to_json
      end
    end
  end
end
