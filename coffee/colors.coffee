###

 0000000   0000000   000       0000000   00000000    0000000
000       000   000  000      000   000  000   000  000     
000       000   000  000      000   000  0000000    0000000 
000       000   000  000      000   000  000   000       000
 0000000   0000000   0000000   0000000   000   000  0000000 

###
colors = require 'ansi-256-colors'

log = console.log

r = (i=4) -> (i < 6) and colors.fg.getRgb(i, 0, 0) or colors.fg.getRgb(  5, i-5, i-5)
R = (i=4) -> (i < 6) and colors.bg.getRgb(i, 0, 0) or colors.bg.getRgb(  5, i-5, i-5)
g = (i=4) -> (i < 6) and colors.fg.getRgb(0, i, 0) or colors.fg.getRgb(i-5,   5, i-5)
G = (i=4) -> (i < 6) and colors.bg.getRgb(0, i, 0) or colors.bg.getRgb(i-5,   5, i-5)
b = (i=4) -> (i < 6) and colors.fg.getRgb(0, 0, i) or colors.fg.getRgb(i-5, i-5,   5)
B = (i=4) -> (i < 6) and colors.bg.getRgb(0, 0, i) or colors.bg.getRgb(i-5, i-5,   5)
y = (i=4) -> (i < 6) and colors.fg.getRgb(i, i, 0) or colors.fg.getRgb(  5,   5, i-5)
Y = (i=4) -> (i < 6) and colors.bg.getRgb(i, i, 0) or colors.bg.getRgb(  5,   5, i-5)
m = (i=4) -> (i < 6) and colors.fg.getRgb(i, 0, i) or colors.fg.getRgb(  5, i-5,   5)
M = (i=4) -> (i < 6) and colors.bg.getRgb(i, 0, i) or colors.bg.getRgb(  5, i-5,   5)
c = (i=4) -> (i < 6) and colors.fg.getRgb(0, i, i) or colors.fg.getRgb(i-5,  5,    5)
C = (i=4) -> (i < 6) and colors.bg.getRgb(0, i, i) or colors.bg.getRgb(i-5,  5,    5)
w = (i=4) -> colors.fg.grayscale[i]
W = (i=4) -> colors.bg.grayscale[i]

r1 = r 1; R1 = R 1; g1 = g 1; G1 = G 1; b1 = b 1; B1 = B 1
r2 = r 2; R2 = R 2; g2 = g 2; G2 = G 2; b2 = b 2; B2 = B 2
r3 = r 3; R3 = R 3; g3 = g 3; G3 = G 3; b3 = b 3; B3 = B 3
r4 = r 4; R4 = R 4; g4 = g 4; G4 = G 4; b4 = b 4; B4 = B 4
r5 = r 5; R5 = R 5; g5 = g 5; G5 = G 5; b5 = b 5; B5 = B 5
r6 = r 6; R6 = R 6; g6 = g 6; G6 = G 6; b6 = b 6; B6 = B 6
r7 = r 7; R7 = R 7; g7 = g 7; G7 = G 7; b7 = b 7; B7 = B 7
r8 = r 8; R8 = R 8; g8 = g 8; G8 = G 8; b8 = b 8; B8 = B 8

c1 = c 1; C1 = C 1; m1 = m 1; M1 = M 1; y1 = y 1; Y1 = Y 1
c2 = c 2; C2 = C 2; m2 = m 2; M2 = M 2; y2 = y 2; Y2 = Y 2
c3 = c 3; C3 = C 3; m3 = m 3; M3 = M 3; y3 = y 3; Y3 = Y 3
c4 = c 4; C4 = C 4; m4 = m 4; M4 = M 4; y4 = y 4; Y4 = Y 4
c5 = c 5; C5 = C 5; m5 = m 5; M5 = M 5; y5 = y 5; Y5 = Y 5
c6 = c 6; C6 = C 6; m6 = m 6; M6 = M 6; y6 = y 6; Y6 = Y 6
c7 = c 7; C7 = C 7; m7 = m 7; M7 = M 7; y7 = y 7; Y7 = Y 7
c8 = c 8; C8 = C 8; m8 = m 8; M8 = M 8; y8 = y 8; Y8 = Y 8

w1 = w 0*3; W1 = W 0*3+2;
w2 = w 1*3; W2 = W 1*3+2;
w3 = w 2*3; W3 = W 2*3+2;
w4 = w 3*3; W4 = W 3*3+2;
w5 = w 4*3; W5 = W 4*3+2;
w6 = w 5*3; W6 = W 5*3+2;
w7 = w 6*3; W7 = W 6*3+2;
w8 = w 7*3; W8 = W 7*3+2;

module.exports = 
	show_values : () ->
		log W8+r3+" r3" + W8+r5+" r5" + W8+r6+" r6" + W8+g2+" g2" + W8+g3+" g3" + W8+g4+" g4" + W8+b3+" b3" + W8+b5+" b5" + W8+b6+" b6" + W8+c2+" c2" + W8+c3+" c3" + W8+c4+" c4" + W8+m3+" m3" + W8+m4+" m4" + W8+m6+" m6" + W8+y1+" y1" + W8+y3+" y3" + W8+y4+" y4" + W8+w1+" w1" + W8+w7+" w7" + W8+w7+" w7" + colors.reset
		log W7+r3+" r3" + W7+r4+" r4" + W7+r6+" r6" + W7+g2+" g2" + W7+g3+" g3" + W7+g4+" g4" + W7+b3+" b3" + W7+b5+" b5" + W7+b6+" b6" + W7+c2+" c2" + W7+c3+" c3" + W7+c6+" c6" + W7+m3+" m3" + W7+m4+" m4" + W7+m6+" m6" + W7+y2+" y2" + W7+y3+" y3" + W7+y7+" y7" + W7+w2+" w2" + W7+w6+" w6" + W7+w6+" w6" + colors.reset
		log W6+r3+" r3" + W6+r4+" r4" + W6+r6+" r6" + W6+g2+" g2" + W6+g3+" g3" + W6+g5+" g6" + W6+b3+" b3" + W6+b5+" b5" + W6+b6+" b6" + W6+c2+" c2" + W6+c3+" c3" + W6+c5+" c5" + W6+m3+" m3" + W6+m4+" m4" + W6+m6+" m6" + W6+y2+" y2" + W6+y5+" y5" + W6+y7+" y7" + W6+w3+" w3" + W6+w5+" w5" + W6+w5+" w5" + colors.reset
		log W5+r3+" r3" + W5+r4+" r4" + W5+r5+" r6" + W5+g2+" g2" + W5+g4+" g4" + W5+g5+" g7" + W5+b3+" b3" + W5+b5+" b5" + W5+b6+" b6" + W5+c2+" c2" + W5+c4+" c4" + W5+c5+" c5" + W5+m3+" m3" + W5+m4+" m4" + W5+m7+" m7" + W5+y3+" y3" + W5+y5+" y5" + W5+y7+" y7" + W5+w4+" w4" + W5+w4+" w4" + W5+w4+" w4" + colors.reset
		log W4+r2+" r2" + W4+r3+" r3" + W4+r6+" r7" + W4+g3+" g3" + W4+g5+" g5" + W4+g7+" g7" + W4+b3+" b3" + W4+b5+" b5" + W4+b7+" b7" + W4+c3+" c3" + W4+c4+" c4" + W4+c5+" c5" + W4+m3+" m3" + W4+m5+" m5" + W4+m7+" m7" + W4+y3+" y3" + W4+y5+" y5" + W4+y7+" y7" + W4+w4+" w4" + W4+w6+" w6" + W4+w6+" w6" + colors.reset
		log W3+r4+" r4" + W3+r5+" r5" + W3+r6+" r7" + W3+g3+" g3" + W3+g5+" g5" + W3+g7+" g7" + W3+b4+" b4" + W3+b6+" b6" + W3+b7+" b7" + W3+c2+" c2" + W3+c3+" c3" + W3+c4+" c4" + W3+m4+" m4" + W3+m5+" m5" + W3+m7+" m7" + W3+y3+" y3" + W3+y5+" y5" + W3+y7+" y7" + W3+w3+" w3" + W3+w6+" w6" + W3+w6+" w6" + colors.reset
		log W2+r3+" r3" + W2+r5+" r5" + W2+r7+" r7" + W2+g3+" g3" + W2+g5+" g5" + W2+g7+" g7" + W2+b5+" b5" + W2+b6+" b6" + W2+b7+" b7" + W2+c2+" c2" + W2+c3+" c3" + W2+c4+" c4" + W2+m3+" m3" + W2+m5+" m5" + W2+m7+" m7" + W2+y3+" y3" + W2+y5+" y5" + W2+y7+" y7" + W2+w2+" w2" + W2+w7+" w7" + W2+w7+" w7" + colors.reset
		log W1+r3+" r3" + W1+r5+" r5" + W1+r7+" r7" + W1+g3+" g3" + W1+g5+" g5" + W1+g7+" g7" + W1+b5+" b5" + W1+b6+" b6" + W1+b7+" b7" + W1+c2+" c2" + W1+c3+" c3" + W1+c4+" c4" + W1+m3+" m3" + W1+m5+" m5" + W1+m7+" m7" + W1+y3+" y3" + W1+y5+" y5" + W1+y7+" y7" + W1+w3+" w3" + W1+w8+" w8" + W1+w8+" w8" + colors.reset

		log R8+r3+" r3" + R8+g2+" g2" + R8+b3+" b3" + R8+c2+" c2" + R8+m3+" m3" + R8+y7+" y7" + R8+w1+" w1"  + M8+r3+" r3" + M8+g2+" g2" + M8+b3+" b3" + M8+c2+" c2" + M8+m3+" m3" + M8+y7+" y7" + M8+w1+" w1"  + B8+r3+" r3" + B8+g2+" g2" + B8+b3+" b3" + B8+c2+" c2" + B8+m3+" m3" + B8+y7+" y7" + B8+w1+" w1" + colors.reset
		log R7+r3+" r3" + R7+g2+" g2" + R7+b3+" b3" + R7+c2+" c2" + R7+m3+" m3" + R7+y7+" y7" + R7+w1+" w1"  + M7+r3+" r3" + M7+g2+" g2" + M7+b3+" b3" + M7+c2+" c2" + M7+m3+" m3" + M7+y7+" y7" + M7+w1+" w1"  + B7+r3+" r3" + B7+g2+" g2" + B7+b3+" b3" + B7+c2+" c2" + B7+m3+" m3" + B7+y7+" y7" + B7+w1+" w1" + colors.reset
		log R6+r3+" r3" + R6+g2+" g2" + R6+b3+" b3" + R6+c2+" c2" + R6+m3+" m3" + R6+y7+" y7" + R6+w1+" w1"  + M6+r3+" r3" + M6+g2+" g2" + M6+b3+" b3" + M6+c2+" c2" + M6+m3+" m3" + M6+y7+" y7" + M6+w1+" w1"  + B6+r3+" r3" + B6+g1+" g1" + B6+b3+" b3" + B6+c3+" c3" + B6+m6+" m6" + B6+y7+" y7" + B6+w1+" w1" + colors.reset
		log R5+r3+" r3" + R5+g3+" g3" + R5+b5+" b5" + R5+c3+" c3" + R5+m7+" m7" + R5+y5+" y5" + R5+w8+" w8"  + M5+r3+" r3" + M5+g3+" g3" + M5+b5+" b5" + M5+c3+" c3" + M5+m7+" m7" + M5+y5+" y5" + M5+w8+" w8"  + B5+r4+" r4" + B5+g3+" g3" + B5+b7+" b7" + B5+c2+" c2" + B5+m6+" m6" + B5+y5+" y5" + B5+w8+" w8" + colors.reset
		log R4+r3+" r3" + R4+g3+" g3" + R4+b5+" b5" + R4+c3+" c3" + R4+m7+" m7" + R4+y5+" y5" + R4+w8+" w8"  + M4+r3+" r3" + M4+g3+" g3" + M4+b5+" b5" + M4+c3+" c3" + M4+m7+" m7" + M4+y5+" y5" + M4+w8+" w8"  + B4+r4+" r4" + B4+g3+" g3" + B4+b7+" b7" + B4+c2+" c2" + B4+m6+" m6" + B4+y5+" y5" + B4+w8+" w8" + colors.reset
		log R3+r4+" r4" + R3+g3+" g3" + R3+b7+" b7" + R3+c3+" c3" + R3+m7+" m7" + R3+y5+" y5" + R3+w8+" w8"  + M3+r4+" r4" + M3+g3+" g3" + M3+b7+" b7" + M3+c3+" c3" + M3+m7+" m7" + M3+y5+" y5" + M3+w8+" w8"  + B3+r4+" r4" + B3+g3+" g3" + B3+b7+" b7" + B3+c2+" c2" + B3+m6+" m6" + B3+y5+" y5" + B3+w8+" w8" + colors.reset
		log R2+r4+" r4" + R2+g3+" g3" + R2+b7+" b7" + R2+c3+" c3" + R2+m7+" m7" + R2+y5+" y5" + R2+w8+" w8"  + M2+r4+" r4" + M2+g3+" g3" + M2+b7+" b7" + M2+c3+" c3" + M2+m7+" m7" + M2+y5+" y5" + M2+w8+" w8"  + B2+r4+" r4" + B2+g3+" g3" + B2+b7+" b7" + B2+c2+" c2" + B2+m6+" m6" + B2+y5+" y5" + B2+w8+" w8" + colors.reset
		log R1+r4+" r4" + R1+g3+" g3" + R1+b7+" b7" + R1+c3+" c3" + R1+m7+" m7" + R1+y5+" y5" + R1+w8+" w8"  + M1+r4+" r4" + M1+g3+" g3" + M1+b7+" b7" + M1+c3+" c3" + M1+m7+" m7" + M1+y5+" y5" + M1+w8+" w8"  + B1+r4+" r4" + B1+g3+" g3" + B1+b7+" b7" + B1+c2+" c2" + B1+m6+" m6" + B1+y5+" y5" + B1+w8+" w8" + colors.reset

		log Y8+r3+" r3" + Y8+g2+" g2" + Y8+b3+" b3" + Y8+c2+" c2" + Y8+m3+" m3" + Y8+y4+" y4" + Y8+w1+" w1"  + G8+r3+" r3" + G8+g2+" g2" + G8+b3+" b3" + G8+c2+" c2" + G8+m3+" m3" + G8+y4+" y4" + G8+w1+" w1"   + C8+r4+" r4" + C8+g3+" g2" + C8+b3+" b3" + C8+c2+" c2" + C8+m3+" m3" + C8+y3+" y3" + C8+w1+" w1" + colors.reset
		log Y7+r3+" r3" + Y7+g2+" g2" + Y7+b3+" b3" + Y7+c2+" c2" + Y7+m3+" m3" + Y7+y4+" y4" + Y7+w1+" w1"  + G7+r3+" r3" + G7+g2+" g2" + G7+b3+" b3" + G7+c2+" c2" + G7+m3+" m3" + G7+y7+" y7" + G7+w1+" w1"   + C7+r4+" r4" + C7+g3+" g2" + C7+b3+" b3" + C7+c2+" c2" + C7+m3+" m3" + C7+y3+" y3" + C7+w1+" w1" + colors.reset
		log Y6+r3+" r3" + Y6+g2+" g2" + Y6+b3+" b3" + Y6+c2+" c2" + Y6+m3+" m3" + Y6+y4+" y4" + Y6+w1+" w1"  + G6+r3+" r3" + G6+g2+" g2" + G6+b3+" b3" + G6+c2+" c2" + G6+m3+" m3" + G6+y7+" y7" + G6+w1+" w1"   + C6+r4+" r4" + C6+g3+" g2" + C6+b3+" b3" + C6+c2+" c2" + C6+m3+" m3" + C6+y3+" y3" + C6+w1+" w1" + colors.reset
		log Y5+r4+" r4" + Y5+g3+" g3" + Y5+b4+" b4" + Y5+c2+" c2" + Y5+m3+" m3" + Y5+y4+" y4" + Y5+w1+" w1"  + G5+r4+" r4" + G5+g3+" g3" + G5+b4+" b4" + G5+c2+" c2" + G5+m3+" m3" + G5+y5+" y5" + G5+w1+" w1"   + C5+r4+" r4" + C5+g3+" g2" + C5+b3+" b3" + C5+c2+" c2" + C5+m3+" m3" + C5+y3+" y3" + C5+w1+" w1" + colors.reset
		log Y4+r4+" r4" + Y4+g3+" g3" + Y4+b4+" b4" + Y4+c2+" c2" + Y4+m3+" m3" + Y4+y5+" y5" + Y4+w1+" w1"  + G4+r4+" r4" + G4+g3+" g3" + G4+b4+" b4" + G4+c2+" c2" + G4+m3+" m3" + G4+y5+" y5" + G4+w8+" w8"   + C4+r4+" r4" + C4+g2+" g2" + C4+b4+" b4" + C4+c2+" c2" + C4+m3+" m3" + C4+y5+" y5" + C4+w1+" w1" + colors.reset
		log Y3+r4+" r4" + Y3+g2+" g2" + Y3+b4+" b4" + Y3+c2+" c2" + Y3+m4+" m4" + Y3+y5+" y5" + Y3+w8+" w8"  + G3+r4+" r4" + G3+g2+" g2" + G3+b4+" b4" + G3+c2+" c2" + G3+m4+" m4" + G3+y5+" y5" + G3+w8+" w8"   + C3+r4+" r4" + C3+g2+" g2" + C3+b5+" b5" + C3+c2+" c2" + C3+m4+" m4" + C3+y5+" y5" + C3+w8+" w8" + colors.reset
		log Y2+r4+" r4" + Y2+g4+" g4" + Y2+b5+" b5" + Y2+c3+" c3" + Y2+m7+" m7" + Y2+y5+" y5" + Y2+w8+" w8"  + G2+r4+" r4" + G2+g3+" g3" + G2+b5+" b5" + G2+c3+" c3" + G2+m7+" m7" + G2+y5+" y5" + G2+w8+" w8"   + C2+r6+" r6" + C2+g3+" g3" + C2+b7+" b7" + C2+c3+" c3" + C2+m6+" m6" + C2+y5+" y5" + C2+w8+" w8" + colors.reset
		log Y1+r6+" r6" + Y1+g3+" g3" + Y1+b7+" b7" + Y1+c3+" c3" + Y1+m7+" m7" + Y1+y5+" y5" + Y1+w8+" w8"  + G1+r4+" r4" + G1+g3+" g3" + G1+b7+" b7" + G1+c3+" c3" + G1+m7+" m7" + G1+y5+" y5" + G1+w8+" w8"   + C1+r6+" r6" + C1+g3+" g3" + C1+b7+" b7" + C1+c3+" c3" + C1+m7+" m7" + C1+y5+" y5" + C1+w8+" w8" + colors.reset
		log colors.reset

BG_FG_COLORS = 
	R1: { r:r4, g:g3, b:b7, c:c3, m:m7, y:y5, w:w8 },
	R2: { r:r4, g:g3, b:b7, c:c3, m:m7, y:y5, w:w8 },
	R3: { r:r4, g:g3, b:b7, c:c3, m:m7, y:y5, w:w8 },
	R4: { r:r3, g:g3, b:b5, c:c3, m:m7, y:y5, w:w8 },
	R5: { r:r3, g:g3, b:b5, c:c3, m:m7, y:y5, w:w8 },
	R6: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y7, w:w1 },
	R7: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y7, w:w1 },
	R8: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y7, w:w1 },
	M1: { r:r4, g:g3, b:b7, c:c3, m:m7, y:y5, w:w8 },
	M2: { r:r4, g:g3, b:b7, c:c3, m:m7, y:y5, w:w8 },
	M3: { r:r4, g:g3, b:b7, c:c3, m:m7, y:y5, w:w8 },
	M4: { r:r3, g:g3, b:b5, c:c3, m:m7, y:y5, w:w8 },
	M5: { r:r3, g:g3, b:b5, c:c3, m:m7, y:y5, w:w8 },
	M6: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y7, w:w1 },
	M7: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y7, w:w1 },
	M8: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y7, w:w1 },
	B1: { r:r4, g:g3, b:b7, c:c2, m:m6, y:y5, w:w8 },
	B2: { r:r4, g:g3, b:b7, c:c2, m:m6, y:y5, w:w8 },
	B3: { r:r4, g:g3, b:b7, c:c2, m:m6, y:y5, w:w8 },
	B4: { r:r4, g:g3, b:b7, c:c2, m:m6, y:y5, w:w8 },
	B5: { r:r4, g:g3, b:b7, c:c2, m:m6, y:y5, w:w8 },
	B6: { r:r3, g:g1, b:b3, c:c3, m:m6, y:y7, w:w1 },
	B7: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y7, w:w1 },
	B8: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y7, w:w1 },
	Y1: { r:r6, g:g3, b:b7, c:c3, m:m7, y:y5, w:w8 },
	Y2: { r:r4, g:g4, b:b5, c:c3, m:m7, y:y5, w:w8 },
	Y3: { r:r4, g:g2, b:b4, c:c2, m:m4, y:y5, w:w8 },
	Y4: { r:r4, g:g3, b:b4, c:c2, m:m3, y:y5, w:w1 },
	Y5: { r:r4, g:g3, b:b4, c:c2, m:m3, y:y4, w:w1 },
	Y6: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y4, w:w1 },
	Y7: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y4, w:w1 },
	Y8: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y4, w:w1 },
	G1: { r:r4, g:g3, b:b7, c:c3, m:m7, y:y5, w:w8 },
	G2: { r:r4, g:g3, b:b5, c:c3, m:m7, y:y5, w:w8 },
	G3: { r:r4, g:g2, b:b4, c:c2, m:m4, y:y5, w:w8 },
	G4: { r:r4, g:g3, b:b4, c:c2, m:m3, y:y5, w:w8 },
	G5: { r:r4, g:g3, b:b4, c:c2, m:m3, y:y5, w:w1 },
	G6: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y7, w:w1 },
	G7: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y7, w:w1 },
	G8: { r:r3, g:g2, b:b3, c:c2, m:m3, y:y4, w:w1 },
	C1: { r:r6, g:g3, b:b7, c:c3, m:m7, y:y5, w:w8 },
	C2: { r:r6, g:g3, b:b7, c:c3, m:m6, y:y5, w:w8 },
	C3: { r:r4, g:g2, b:b5, c:c2, m:m4, y:y5, w:w8 },
	C4: { r:r4, g:g2, b:b4, c:c2, m:m3, y:y5, w:w1 },
	C5: { r:r4, g:g2, b:b3, c:c2, m:m3, y:y3, w:w1 },
	C6: { r:r4, g:g2, b:b3, c:c2, m:m3, y:y3, w:w1 },
	C7: { r:r4, g:g2, b:b3, c:c2, m:m3, y:y3, w:w1 },
	C8: { r:r4, g:g2, b:b3, c:c2, m:m3, y:y3, w:w1 },
	W1: { r:r5, g:g4, b:b6, c:c3, m:m5, y:y5, w:w8 },
	W2: { r:r5, g:g4, b:b6, c:c3, m:m5, y:y5, w:w8 },
	W3: { r:r5, g:g4, b:b6, c:c3, m:m5, y:y5, w:w8 },
	W4: { r:r3, g:g4, b:b5, c:c4, m:m5, y:y5, w:w8 },
	W5: { r:r4, g:g4, b:b5, c:c4, m:m4, y:y5, w:w1 },
	W6: { r:r4, g:g3, b:b5, c:c3, m:m4, y:y5, w:w1 },
	W7: { r:r4, g:g3, b:b5, c:c3, m:m4, y:y5, w:w1 },
	W8: { r:r5, g:g3, b:b5, c:c3, m:m4, y:y3, w:w1 }
	
FG_COLORS = ['r', 'g', 'b', 'c', 'm', 'y', 'w']
BG_COLORS = ['R', 'M', 'B', 'Y', 'G', 'C', 'W']

module.exports['Ri'] = (bi,fi) -> R(bi)+BG_FG_COLORS['R'+bi][FG_COLORS[fi-1]]
module.exports['Gi'] = (bi,fi) -> G(bi)+BG_FG_COLORS['G'+bi][FG_COLORS[fi-1]]
module.exports['Bi'] = (bi,fi) -> B(bi)+BG_FG_COLORS['B'+bi][FG_COLORS[fi-1]]
module.exports['Yi'] = (bi,fi) -> Y(bi)+BG_FG_COLORS['Y'+bi][FG_COLORS[fi-1]]
module.exports['Mi'] = (bi,fi) -> M(bi)+BG_FG_COLORS['M'+bi][FG_COLORS[fi-1]]
module.exports['Ci'] = (bi,fi) -> C(bi)+BG_FG_COLORS['C'+bi][FG_COLORS[fi-1]]
module.exports['Wi'] = (bi,fi) -> W((bi-1)*3+2)+BG_FG_COLORS['W'+bi][FG_COLORS[fi-1]]
module.exports['x']  = colors.reset
module.exports['d']  = '\x1b[1m';

for bg in BG_COLORS
	module.exports[bg] = eval(bg)
	for bi in [1...9]
		bn = bg+bi
		module.exports[bn] = eval(bn)
		for fg in FG_COLORS
			fn = bn+fg
			module.exports[fn] = eval(bn)+BG_FG_COLORS[bn][fg]

for fg in FG_COLORS
	module.exports[fg] = eval(fg)

module.exports.show = () ->
	for bg in BG_COLORS
		for bi in [1...9]
			s = colors.reset
			bn = bg+bi
			s += eval(bg.toLowerCase())(bi) + (bg + bi) + " " + eval(bn)
			for fg in FG_COLORS
				fn = bn+fg
				s += module.exports[fn] + ' ' + fg + ' '
			log s + colors.reset
	log " "
	
