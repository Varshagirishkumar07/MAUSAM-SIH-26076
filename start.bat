@echo off
title MAUSAM - Application Server
echo ====================================================
echo   MAUSAM - Personalized Weather Advisory System
echo   Smart India Hackathon (SIH) Problem Statement 26076
echo ====================================================
echo.
echo Starting MAUSAM Application Server...
echo Access in browser: http://localhost:5000
echo.
cd /d "%~dp0\backend"
node server.js
pause
