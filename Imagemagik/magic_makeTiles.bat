:: set size=1280x640+320+220
set size=4x4@
set outsize=5120x5120


SETLOCAL EnableDelayedExpansion
for %%f in (%*) do (
	@echo %%f
	
	
	magick %%f -crop %size% +repage +adjoin %%~nf_d.png
	
	
)