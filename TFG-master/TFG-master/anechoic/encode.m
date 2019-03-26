function [W,X,Y,Z] = encode(monoaudio, azimuth, elevation)

W = monoaudio;
X = monoaudio*cos(azimuth)*cos(elevation);
Y = monoaudio*sin(azimuth)*cos(elevation);
Z = monoaudio*sin(elevation);


end