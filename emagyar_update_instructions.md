## az e-magyar.hu friss�t�se

Tudnival�k az e-magyar.hu friss�t�se el�tt:

- A v�ltoztat�sokat �rdemes el�sz�r az oldal **teszt** verzi�j�n letesztelni, ami a `/var/www/infra2test` k�nyvt�rban tal�lhat�. Ez egy teszt deploy az `e-magyar.hu` git rep�b�l (aminek a kl�nja itt van: `/home/gerocs/e-magyar.hu`).
- A teszt verzi� �ltal haszn�lt `Lang_Hungarian` plugin �s a web service (`gate-server`) f�jljai a `/home/gerocs/test/hunlp-GATE` k�nyvt�rban vannak. Ez a `hunlp-GATE` git rep� kl�nja.
- FONTOS: az �les �s a teszt verzi� egy dologban k�l�nb�zik: k�l�nb�z� portokra k�ldik a k�r�seket, az �les a 8000-re, a teszt a 8080-ra; ezt a be�ll�t�st a `gate-server.props` f�jl tartalmazza; ennek �gy kell maradnia, nem kell committolni. S�t, ez�rt kell az al�bbi `git stash`, hogy a 8080 megmaradjon a tesztverzi�ban, ott ind�tsuk a szervert, **�gy nem l�vi ki az �les szervert**.

- Teh�t, ha GATE-es f�jlok v�ltoztak:

`cd /home/gerocs/test/hunlp-GATE; git stash; git pull`
 
- Ha a modellek is v�ltoztak:

`./complete.sh`

- Ha a weboldal is v�ltozott:

`cd /home/gerocs/e-magyar.hu ; git pull`

ellen�rizni, hogy a `deploy/testconfig` f�jlok megfelel�ek,
azaz csakis a sz�ks�ges dolgokban t�rnek el az `application/config`-ban
tal�lhat� megfelel� f�jlokt�l.

`cd deploy ; ./deploy.sh /var/www/infra2test test`

a deployban a `download`, `temp` �s `parser_logs` kvt�rnak rekurz�ve
a `www-data` user� kell lennie csoportilag!
 
- Ezut�n �jra kell ind�tani a web service-t:

ellen�rizni, hogy a `gate-server.props`-ban a port 8080!

```
cd /home/gerocs/test/hunlp-GATE
export GATE_HOME=/home/joker/GATE_Developer_8.1
./gate-server.sh &
```

v�g�l tesztel�s:

`http://oliphant.nytud.hu/infra2test`

-----

Ha minden OK, akkor ugyanezt elv�gezni az **�les** rendszeren is.

```
cd /home/gerocs/hunlp-GATE; git pull
./complete.sh
```

```
cd /home/gerocs/e-magyar.hu ; git pull
cd deploy ; ./deploy.sh /var/www/infra2
```

a deployban a `download`, `temp` �s `parser_logs` kvt�rnak rekurz�ve
a `www-data` user� kell lennie csoportilag!
 
ellen�rizni, hogy a `gate-server.props`-ban a port 8000!

```
cd /home/gerocs/hunlp-GATE
export GATE_HOME=/home/joker/GATE_Developer_8.1
./gate-server.sh &
```

ellen�rz�s:

`http://e-magyar.hu`

-----

| m�d   | dir                       | rep� clone        | port |
|-------|---------------------------|-------------------|------|
| teszt | `oli:/var/www/infra2test` | `test/hunlp-GATE` | 8080 |
| �les  | `oli:/var/www/infra2`     | `hunlp-GATE`      | 8000 |

