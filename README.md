# Waynora

Waynora to nowoczesna, frontendowa aplikacja nawigacyjna GPS działająca bez własnego backendu.

Projekt jest przeznaczony do publikacji przez GitHub Pages.

## Technologie

- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet
- React Leaflet
- OpenStreetMap
- Nominatim
- OSRM
- Geolocation API
- Web Speech API
- localStorage
- GitHub Actions
- GitHub Pages

## Funkcje

Waynora posiada:

- ekran startowy,
- prawdziwą mapę OpenStreetMap,
- GPS,
- śledzenie pozycji,
- wyszukiwanie miejsc,
- autocomplete,
- wybór celu,
- wyznaczanie trasy,
- dystans,
- czas przejazdu,
- ETA,
- tryb nawigacji,
- automatyczne centrowanie,
- wykrywanie zjazdu z trasy,
- ponowne wyznaczanie trasy,
- komunikaty głosowe,
- ulubione,
- historię,
- tryb ciemny,
- ustawienia,
- localStorage,
- responsywny interfejs,
- PWA manifest,
- GitHub Actions,
- GitHub Pages.

## Wymagania

Node.js 20 lub nowszy.

Git.

## Instalacja

Sklonuj repozytorium:

    git clone https://github.com/USERNAME/waynora.git

Przejdź do katalogu:

    cd waynora

Zainstaluj zależności:

    npm install

## Uruchomienie

Uruchom środowisko developerskie:

    npm run dev

Vite pokaże lokalny adres, zazwyczaj:

    http://localhost:5173

## Build

Sprawdź produkcyjny build:

    npm run build

Podczas budowania TypeScript jest sprawdzany przez:

    tsc -b

Następnie Vite tworzy katalog:

    dist/

## Podgląd produkcyjnego buildu

Po wykonaniu:

    npm run build

można uruchomić:

    npm run preview

## Konfiguracja API

Domyślne usługi:

Geocoding:

    https://nominatim.openstreetmap.org

Routing:

    https://router.project-osrm.org

Nie jest wymagany klucz API.

Można nadpisać adresy za pomocą `.env`.

Przykład:

    VITE_NOMINATIM_URL=https://nominatim.openstreetmap.org
    VITE_ROUTING_URL=https://router.project-osrm.org

Nie commituj prywatnych kluczy ani sekretów.

## Nominatim

Waynora używa Nominatim do wyszukiwania miejsc.

Publiczna instancja Nominatim posiada ograniczenia dotyczące liczby zapytań i sposobu korzystania z usługi.

Aplikacja stosuje debounce wyszukiwania i ogranicza liczbę wyników.

Nie należy używać publicznego Nominatim do dużego ruchu produkcyjnego bez sprawdzenia aktualnych zasad korzystania z usługi.

## OSRM

Waynora korzysta z publicznego OSRM do wyznaczania tras.

Publiczny serwer ma ograniczenia wydajności i nie powinien być traktowany jako nieograniczona infrastruktura produkcyjna.

## OpenStreetMap

Mapa korzysta z kafelków OpenStreetMap.

Aplikacja wyświetla wymagane oznaczenie OpenStreetMap.

## Geolokalizacja

Waynora korzysta z:

    navigator.geolocation

oraz:

    navigator.geolocation.watchPosition

Przeglądarka musi zezwolić na dostęp do lokalizacji.

W większości przeglądarek geolokalizacja wymaga bezpiecznego kontekstu HTTPS.

GitHub Pages zapewnia HTTPS.

Na localhost geolokalizacja również może działać w środowisku developerskim.

## Komunikaty głosowe

Waynora wykorzystuje Web Speech API.

Dostępność i zachowanie syntezy mowy zależy od przeglądarki oraz systemu operacyjnego.

Niektóre przeglądarki wymagają wcześniejszej interakcji użytkownika.

## GitHub Pages

### 1. Utwórz repozytorium

Na GitHub utwórz repozytorium:

    waynora

### 2. Umieść pliki

Skopiuj wszystkie pliki projektu do repozytorium.

### 3. Zainstaluj zależności

Lokalnie:

    npm install

### 4. Sprawdź build

    npm run build

### 5. Utwórz commit

    git add .

    git commit -m "Initial Waynora"

### 6. Dodaj remote

    git remote add origin https://github.com/USERNAME/waynora.git

### 7. Wyślij projekt

    git branch -M main

    git push -u origin main

### 8. Włącz GitHub Pages

Wejdź w:

Repository

Settings

Pages

W sekcji Build and deployment ustaw:

Source:

    GitHub Actions

Nie wybieraj Deploy from a branch.

### 9. Deployment

Po wykonaniu:

    git push

GitHub Actions automatycznie:

1. pobierze repozytorium,
2. uruchomi Node,
3. wykona npm install,
4. wykona npm run build,
5. utworzy artifact z dist,
6. opublikuje aplikację na GitHub Pages.

## Adres aplikacji

Po wdrożeniu aplikacja będzie dostępna pod adresem:

    https://USERNAME.github.io/waynora/

gdzie `USERNAME` należy zastąpić nazwą użytkownika GitHub.

## Kolejne aktualizacje

Po zmianie kodu:

    git add .

    git commit -m "Update Waynora"

    git push

GitHub Actions ponownie zbuduje i opublikuje aplikację.

## localStorage

Waynora przechowuje lokalnie:

- ulubione,
- historię,
- Dom,
- Pracę,
- ustawienia.

Dane nie są wysyłane do własnego backendu.

Wyczyszczenie danych witryny może usunąć te informacje.

## Bezpieczeństwo

Projekt nie wymaga prywatnego API key.

Nie umieszczaj w repozytorium:

- haseł,
- tokenów,
- prywatnych kluczy,
- danych użytkowników.

## Ograniczenia

Waynora jest aplikacją webową.

Przeglądarka może ograniczać:

- działanie GPS w tle,
- ciągłą nawigację po zablokowaniu ekranu,
- automatyczne odtwarzanie głosu,
- dokładność lokalizacji,
- dostęp do czujników,
- działanie aplikacji po zamknięciu karty.

Nie należy traktować aplikacji webowej jako pełnego zamiennika natywnej aplikacji nawigacyjnej.

## Licencje usług

Projekt wykorzystuje zewnętrzne usługi i dane, w szczególności:

OpenStreetMap

Nominatim

OSRM

Przed wdrożeniem aplikacji z dużym ruchem należy sprawdzić aktualne warunki korzystania z każdej usługi.

## Struktura

    src/
    ├── components/
    ├── hooks/
    ├── services/
    ├── types/
    ├── utils/
    ├── App.tsx
    ├── index.css
    └── main.tsx

## Status

Waynora jest frontendową aplikacją nawigacyjną przeznaczoną do działania w przeglądarce i publikacji przez GitHub Pages.