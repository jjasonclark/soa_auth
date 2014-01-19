class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  def after_sign_in_path_for(user)
    current_token = user.current_local_service_access_token
    if current_token
      cookies[:access_token] = {
        value: current_token.token,
        expires: current_token.created_at + current_token.expires_in.seconds,
        domain: :all
      }
    end
    root_path
  end

  def after_sign_out_path_for(user)
    cookies.delete :access_token, domain: :all
    root_path
  end

end
