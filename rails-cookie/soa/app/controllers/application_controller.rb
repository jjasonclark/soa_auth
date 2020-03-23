class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  def authenticate_via_oauth
    unless authorized_request?
      render file: "public/401", layout: false, status: :unauthorized
    end
  end

  def authorized_request?
    result = Faraday.post('http://localhost:3000/access_token/verify.json',
      { :access_token => cookies[:access_token].to_s }.to_json,
      { "content-type" => "application/json" })
    json = JSON.parse(result.body)
    json["valid"]
  end
end
