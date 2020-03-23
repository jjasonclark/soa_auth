class RootController < ApplicationController
  before_action :authenticate_via_oauth

  def index
  end
end
