%%Ambisonics to binaural
clear();
%%
%Enter values
[sm, fs] = audioread('thecatalyst.wav');

%Decodermatrix
a = 0.125;
b = 0.216495;
c = 0.21653;
DM = [a a a a a a a a;
    b -b b -b b -b b -b;
    c c -c -c c c -c -c;
    -b -b -b -b b b b b];

%HRTF in each cube position
a1 = audioread('E35_A135.wav'); 
a2 = audioread('E35_A-135.wav'); 
a3 = audioread('E-35_A135.wav'); 
a4 = audioread('E-35_A-135.wav'); 
a5 = audioread('E35_A45.wav'); 
a6 = audioread('E35_A-45.wav'); 
a7 = audioread('E-35_A45.wav'); 
a8 = audioread('E-35_A-45.wav'); 

%RIR recordings
ls1 = audioread('ls1.wav'); %E3.44 A90
ls2 = audioread('ls2.wav'); %E65.89 A60
ls3 = audioread('ls3.wav'); %E3.44 A60
ls4 = audioread('ls4.wav'); %E65.89 A120
ls5 = audioread('ls5.wav'); %E3.44 A120
ls6 = audioread('ls6.wav'); %E65.89 A90
ls7 = audioread('ls7.wav'); %E3.44 A-160
ls8 = audioread('ls8.wav'); %E65.89 A-20
ls9 = audioread('ls9.wav'); %E65.89 A-160
ls10 = audioread('ls10.wav'); %E.3.44 A-20

%%
%Convolve sound with rir

%ls1
aw = conv(ls1(:,1),sm);
ax = conv(ls1(:,2),sm);
ay = conv(ls1(:,3),sm);
az = conv(ls1(:,4),sm);

% %ls2
% aw = conv(ls2(:,1),sm);
% ax = conv(ls2(:,2),sm);
% ay = conv(ls2(:,3),sm);
% az = conv(ls2(:,4),sm);
%
% %ls3
% aw = conv(ls3(:,1),sm);
% ax = conv(ls3(:,2),sm);
% ay = conv(ls3(:,3),sm);
% az = conv(ls3(:,4),sm);
% 
% %ls4
% aw = conv(ls4(:,1),sm);
% ax = conv(ls4(:,2),sm);
% ay = conv(ls4(:,3),sm);
% az = conv(ls4(:,4),sm);
% 
% %ls5
% aw = conv(ls5(:,1),sm);
% ax = conv(ls5(:,2),sm);
% ay = conv(ls5(:,3),sm);
% az = conv(ls5(:,4),sm);
% 
% %ls6
% aw = conv(ls6(:,1),sm);
% ax = conv(ls6(:,2),sm);
% ay = conv(ls6(:,3),sm);
% az = conv(ls6(:,4),sm);
% 
% %ls7
% aw = conv(ls7(:,1),sm);
% ax = conv(ls7(:,2),sm);
% ay = conv(ls7(:,3),sm);
% az = conv(ls7(:,4),sm);
% 
% %ls8
% aw = conv(ls8(:,1),sm);
% ax = conv(ls8(:,2),sm);
% ay = conv(ls8(:,3),sm);
% az = conv(ls8(:,4),sm);
% 
% %ls9
% aw = conv(ls9(:,1),sm);
% ax = conv(ls9(:,2),sm);
% ay = conv(ls9(:,3),sm);
% az = conv(ls9(:,4),sm);
% 
% %ls10
% aw = conv(ls10(:,1),sm);
% ax = conv(ls10(:,2),sm);
% ay = conv(ls10(:,3),sm);
% az = conv(ls10(:,4),sm);

%%
%Decoder
Amb = [aw ay az ax];
matrix = Amb*DM;

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