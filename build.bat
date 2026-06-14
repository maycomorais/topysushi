@echo off
:: ─────────────────────────────────────────────────────────────────────────────
:: build.bat — Gera gaveta-bridge.exe (standalone, sem Node.js no cliente)
:: Execute este arquivo UMA VEZ na sua máquina de desenvolvimento.
:: O .exe gerado em /dist pode ser distribuído para qualquer cliente Windows.
:: ─────────────────────────────────────────────────────────────────────────────

echo.
echo  Construindo gaveta-bridge.exe...
echo.

:: Verifica se Node.js está instalado
where node >nul 2>&1
if errorlevel 1 (
  echo  [ERRO] Node.js nao encontrado. Instale em https://nodejs.org
  pause
  exit /b 1
)

:: Instala o pkg globalmente (ferramenta de empacotamento)
echo  [1/3] Instalando pkg...
call npm install -g pkg >nul 2>&1

:: Cria a pasta de saída
if not exist dist mkdir dist

:: Empacota em .exe
echo  [2/3] Empacotando drawer-bridge.js...
call pkg drawer-bridge.js --target node18-win-x64 --output dist\gaveta-bridge.exe --compress GZip

if errorlevel 1 (
  echo.
  echo  [ERRO] Falha ao empacotar. Verifique o erro acima.
  pause
  exit /b 1
)

echo  [3/3] Pronto!
echo.
echo  ─────────────────────────────────────────────────────────────
echo   Arquivo gerado: dist\gaveta-bridge.exe
echo   Tamanho aprox.: 35-45 MB (Node.js embutido)
echo.
echo   Entregue ao cliente:
echo     1. Copie gaveta-bridge.exe para qualquer pasta
echo     2. Duplo clique para iniciar
echo     3. Na primeira execucao: o browser abre automaticamente
echo        em http://127.0.0.1:9091 para configurar o IP
echo     4. Para iniciar com o Windows: clique direito no .exe
echo        > Criar atalho > mover para shell:startup
echo  ─────────────────────────────────────────────────────────────
echo.
pause
