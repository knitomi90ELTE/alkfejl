# Dokumentáció
## 1. Követelményanalízis
### Funkcionális követelmények

Megvalósítani egy tantárgyak felvételére, kezelésére szolgáló webes technológiákkal fejlesztett alkalmazást. Elvárt követelmények aminek tartalmaznia kell:

- legalább két modellt, egy-sok kapcsolatban
- legalább 1 űrlapot
- legalább 1 listázó oldalt
- legyen lehetőség új felvételére
- legyen lehetőség meglévő szerkesztésére
- legyen lehetőség meglévő törlésére
- legyenek benne csak hitelesítés után elérhető funkciók
- perzisztálás fájlba történjen
- közzététel Herokun

### Nem funkcionális követelmények

- Felhaszánálóbarát, ergonomikus elrendezés és kinézet
- Jelszavak tárolása, biztonság
- A weboldal könnyen bővíthető
- Teljesítmény, rendelkezésre állás

### Használatieset-modell
#### Szerepkörök
- **vendég**: nem rendezik jogosultsággal az oldal tartalmának megtekintéséhez, két dolgot tehet: bejelentkezik vagy regisztrál
- **hallgató**: megtekintheti a rendszerben levő tantárgyakat és azokat felveheti illetve leadhatja
- **tanár**: létrehozhat, törölhet és módosíthat tantárgyakat

### Folyamat pontos menete: Regisztráció


![Használatieset-modell](img/usecase.png)

## 2. Tervezés

### - Architektúra terv
komponensdiagram
####Oldaltérkép
Publikus:
- Bejelentkezés
- Regisztrálás
Regisztrált felhasználók számára:
- Bejelentkezés
- Kijelentkezés
- Tárgyak listázása
- Hallgatók számára:
  - Tárgy felvétele
  - Tárgy leadása
- Tanárok számára
  - Tárgy létrehozása
  - Tárgy módosítása
  - Tárgy törlése

####Végpontok
- GET /: login oldal vagy átirányítás a listanézetre
- POST /: bejelentkezési adatok elküldése
- GET /login: login oldal vagy átirányítás a listanézetre
- POST /login: bejelentkezési adatok elküldése
- GET /signup: regisztrációs oldal
- POST /signup: regisztrációs adatok elküldése
- GET /logout: kijelentkezés
- GET /list: tárgyak listázása
- GET /new: új tantárgy hozzáadása oldal
- POST /new: új tantárgy létrehozása

- GET /modify/:id : tantárgy módosítása
- POST /modify/:id : tantárgy módosított adatainak elküldése
- GET /delete/:id : létrehozott tantárgy törlése
- GET /remove/:id : törlés a felvett tárgyak közül

### - Felhasználóifelület-modell
Oldalvázlatok
Designterv (nem kell, elég a végső megvalósítás kinézete)
### - Osztálymodell
Adatmodell
Adatbázisterv
Állapotdiagram
### - Dinamikus működés
Szekvenciadiagram

## 3. Implementáció
## 4. Tesztelés
## 5. Felhasználói dokumentáció
