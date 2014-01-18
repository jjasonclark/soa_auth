# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

app_id = '3f1edd7eba53fe64a82c6b1b7e3d590d456513053dc976f2807bf29b295475d1'
app_secret = 'bf08d547d8cd208273da74c2ec266579936f5973e553670398b46f52e33731c6'

unless Doorkeeper::Application.where(uid: app_id, secret: app_secret).first
  Doorkeeper::Application.create! name: "Local services",
    uid: app_id,
    secret: app_secret,
    redirect_uri: 'http://localhost:3001'
end
