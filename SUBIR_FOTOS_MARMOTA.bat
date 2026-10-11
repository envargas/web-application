@echo off
setlocal
cd /d "%~dp0"

echo.
echo ==============================================
echo   Marmota - Publicar fotos en GitHub
echo ==============================================
echo.

for /f "delims=" %%B in ('git branch --show-current') do set "RAMA=%%B"
if /I not "%RAMA%"=="feature/marmota-estilo-comentarios" (
  echo Estas en la rama "%RAMA%".
  echo Cambia a feature/marmota-estilo-comentarios antes de publicar las fotos.
  pause
  exit /b 1
)

echo Preparando solamente fotos (sin ZIP, package.json ni datos privados)...
for %%D in (galeria amigos familia viajes recuerdos hero) do (
  if exist "public\images\%%D" git add -- "public/images/%%D"
)

echo.
git diff --cached --stat -- public/images/
echo.
git diff --cached --quiet -- public/images/
if not errorlevel 1 (
  echo No hay nuevas fotos por subir.
  pause
  exit /b 0
)

choice /C SN /M "Quieres publicar las fotos que aparecen arriba"
if errorlevel 2 (
  echo Operacion cancelada.
  pause
  exit /b 0
)

git commit -m "Agregar fotos al album de Marmota" -- public/images/
if errorlevel 1 (
  echo No se pudo crear el commit.
  pause
  exit /b 1
)

git push origin feature/marmota-estilo-comentarios
if errorlevel 1 (
  echo No se pudo subir a GitHub. Revisa el mensaje anterior.
  pause
  exit /b 1
)

echo.
echo Fotos publicadas. Actualiza la pagina.
pause
