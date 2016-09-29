Tudnival�k az e-magyar.hu friss�t�se el�tt:

- A v�ltoztat�sokat �rdemes el�sz�r az oldal teszt verzi�j�n letesztelni, ami a /var/www/infra2test k�nyvt�rban tal�lhat�. Ez az e-magyar.hu git rep� kl�nja.
- A teszt verzi� �ltal haszn�lt Lang_Hungarian plugin �s a web service (gate-server) f�jljai a /home/gerocs/test/hunlp-GATE k�nyvt�rban vannak. Ez a hunlp-GATE git rep� kl�nja.
- FONTOS: az �les �s a teszt verzi� egy dologban k�l�nb�zik: k�l�nb�z� portokra k�ldik a k�r�seket, az �les a 8000-re, a teszt a 8080-ra; ezt a be�ll�t�st a gate-server.props f�jl tartalmazza; ennek �gy kell maradnia, nem kell committolni

- Teh�t, ha GATE-es f�jlok v�ltoztak:

cd /home/gerocs/test/hunlp-GATE; git stash; git pull
 
- Ha a modellek is v�ltoztak:

./complete.sh

- Ha a weboldal is v�ltozott:

cd /var/www/infra2test; git pull 
 
- Ezut�n �jra kell ind�tani a web service-t:

cd /home/gerocs/test/hunlp-GATE;
export GATE_HOME=/home/joker/GATE_Developer_8.1;
./gate-server.sh &

v�g�l tesztel�s:

http://oliphant.nytud.hu/infra2test/


Ha minden OK, akkor ugyanezt elv�gezni az �les rendszeren is.

cd /home/gerocs/hunlp-GATE; git pull
./complete.sh
ellen�rizni, hogy a gate-server.props-ban a port 8000
cd /var/www/infra2; git pull

cd /home/gerocs/hunlp-GATE;
export GATE_HOME=/home/joker/GATE_Developer_8.1;
./gate-server.sh &

http://e-magyar.hu/

