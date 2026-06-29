@echo off
chcp 65001 >nul
title KPSS Dashboard Sunucusu
cd /d "%~dp0"

echo.
echo  KPSS Hazirlik Dashboard baslatiliyor...
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo  HATA: Node.js yuklu degil!
  echo  https://nodejs.org adresinden Node.js 18+ indirin.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo  Ilk kurulum: paketler yukleniyor...
  call npm install
  if errorlevel 1 (
    echo  npm install basarisiz oldu.
    pause
    exit /b 1
  )
)

echo  Sunucu baslatildi. Bu pencereyi KAPATMAYIN.
echo  Tarayicida http://localhost:3000 acin.
echo.
node server.js
pause
