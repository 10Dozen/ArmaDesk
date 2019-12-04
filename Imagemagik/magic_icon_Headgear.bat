:: set size=1280x640+320+220
set size=1000x700+300+150
set bgcolor=#c0c0c0
set outsize=512x512
set extent_to=135%%
set extent_gravity=Center

set pbopath=\CUP\Creatures\People\Military\CUP_Creatures_People_Military_Russia\data\ui

SETLOCAL EnableDelayedExpansion
echo ==== > out/result.txt

mkdir "out"
for %%f in (%*) do (
	@echo %%f
	
	magick %%f -crop %size% -alpha set -channel RGBA -fill none -fuzz 10%% -transparent %bgcolor% -trim -background none -gravity Center -extent %extent_to% -gravity %extent_gravity% -resize %outsize% -extent %outsize% -blur x0.5 out/%%~nf_ca.png
	"E:\GMZ\STEAM\SteamApps\common\Arma 3 Tools\TexView2\Pal2PacE.exe" out/%%~nf_ca.png out/%%~nf_ca.paa
	
	SET var=%%~nf_ca
    Set MyVar=!var!
    set MyVar=!MyVar: =!
	
	echo picture = "%pbopath%\!MyVar!.paa"; >> out/result.txt
)