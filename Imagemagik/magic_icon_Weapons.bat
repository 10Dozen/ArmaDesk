:: set size=1280x640+320+220
set size=1300x800+300+220
set bgcolor=#c0c0c0

set fuzz=7%%
set blur=x0.35

REM set outsize=512x256
REM set extent_to=115%%
REM set extent_gravity=SouthEast

set outsize=512x512
set extent_to=135%%
set extent_gravity=Center


set suffix=ca
set pbopath=\CUP\Weapons\CUP_Weapons_West_Attachments\BAF_Llm\data\ui

SETLOCAL EnableDelayedExpansion
echo ==== > out/result.txt

mkdir "out"
for %%f in (%*) do (
	@echo %%f
	
	magick %%f -crop %size% -alpha set -channel RGBA -fill none -fuzz %fuzz% -transparent %bgcolor% -trim -background none -blur %blur%  -gravity %extent_gravity% -extent %extent_to% -gravity Center -resize %outsize% -extent %outsize% out/%%~nf_%suffix%.png
	
	"E:\GMZ\STEAM\SteamApps\common\Arma 3 Tools\TexView2\Pal2PacE.exe" out/%%~nf_%suffix%.png out/%%~nf_%suffix%.paa
	
	SET var=%%~nf_%suffix%
    Set MyVar=!var!
    set MyVar=!MyVar: =!
	
	echo picture = "%pbopath%\!MyVar!.paa"; >> out/result.txt
)