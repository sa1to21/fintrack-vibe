@echo off
cd /d "C:\main\Projects\fintrack\api"
bundle exec rake notifications:send_reminders
