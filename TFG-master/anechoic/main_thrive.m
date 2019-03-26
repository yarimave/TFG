%%Ambisonics to binaural
clear();
%%
%Choose values
[sm, fs] = audioread('thecatalyst.wav');
azimuth = pi/2;
elevation = 0;
%HRTF in each cube position
a1 = audioread('E35.26_A135_D1.4.wav'); 
a2 = audioread('E35.26_A-135_D1.4.wav'); 
a3 = audioread('E-35.26_A135_D1.4.wav'); 
a4 = audioread('E-35.26_A-135_D1.4.wav'); 
a5 = audioread('E35.26_A45_D1.4.wav'); 
a6 = audioread('E35.26_A-45_D1.4.wav'); 
a7 = audioread('E-35.26_A45_D1.4.wav'); 
a8 = audioread('E-35.26_A-45_D1.4.wav'); 

%Decodermatrix
a = 0.125;
b = 0.216495;
c = 0.21653;
DM = [a a a a a a a a;
    b -b b -b b -b b -b;
    c c -c -c c c -c -c;
    -b -b -b -b b b b b];
%%
%Encoding
[W, X, Y, Z] = encode(sm, azimuth, elevation);
Amb = [W Y Z X];

%%
%Decode ambisonics
matrix = Amb * DM;

%%
%Convolve with HRTF
l1 = conv(matrix(:,1),a1(:,1));
r1 = conv(matrix(:,1),a1(:,2));
l2 = conv(matrix(:,2),a2(:,1));
r2 = conv(matrix(:,2),a2(:,2));
l3 = conv(matrix(:,3),a3(:,1));
r3 = conv(matrix(:,3),a3(:,2));
l4 = conv(matrix(:,4),a4(:,1));
r4 = conv(matrix(:,4),a4(:,2));
l5 = conv(matrix(:,5),a5(:,1));
r5 = conv(matrix(:,5),a5(:,2));
l6 = conv(matrix(:,6),a6(:,1));
r6 = conv(matrix(:,6),a6(:,2));
l7 = conv(matrix(:,7),a7(:,1));
r7 = conv(matrix(:,7),a7(:,2));
l8 = conv(matrix(:,8),a8(:,1));
r8 = conv(matrix(:,8),a8(:,2));

%%
%Binaural output
L = l1+l2+l3+l4+l5+l6+l7+l8;
R = r1+r2+r3+r4+r5+r6+r7+r8;

output = [L R];