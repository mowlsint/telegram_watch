# Daily Telegram Watch

Standalone-HTML-Anwendung für die Vorschau sowie den PDF- und Markdown-Export von Telegram-/OSINT-Watches. `index.html` im Browser öffnen oder über das bestehende Webhosting aufrufen.

## Watch im Repository speichern

1. Watch-Text einfügen; Datum und Stand prüfen.
2. Unter **GitHub einrichten** einen [fine-grained Personal Access Token](https://github.com/settings/personal-access-tokens/new) eingeben. Als Repository nur `mowlsint/telegram_watch` auswählen und die Repository-Berechtigung **Contents: Read and write** erteilen. Ein Ablaufdatum setzen.
3. **Im Repository speichern** klicken. Die Erfolgsmeldung verlinkt die gespeicherte Datei.

Repository und Branch sind mit `mowlsint/telegram_watch` und `main` vorbelegt. Diese beiden Einstellungen werden nach erfolgreichem Speichern lokal gemerkt. Der Token bleibt ausschließlich im Eingabefeld des geöffneten Tabs; er wird weder in Local Storage noch im Repository gespeichert. **Schlüssel entfernen** leert das Feld. Die GitHub-Verbindung in ChatGPT stellt der eigenständigen HTML-Anwendung keinen Token zur Verfügung; deshalb ist diese Einrichtung erforderlich.

Die Ablage erfolgt als UTF-8-Markdown unter `watches/JJJJ/MM/`. Jede Speicherung erhält einen eindeutigen Dateinamen mit Watch-Datum, UTC-Speicherzeit und UUID. Datum und Stand stehen zusätzlich im YAML-Kopf der Datei. Mehrere Ausgaben desselben Tages überschreiben einander nicht. Der Markdown-Text wird aus dem aktuellen Eingabefeld erzeugt, auch ohne vorherige Vorschauaktualisierung. PDF bleibt ein separater Druckexport.

Bei einem Verbindungsabbruch zunächst im Repository prüfen, ob die Datei bereits angekommen ist. Geschützte Branches können direkte Schreibzugriffe verhindern. In öffentlichen Repositories sind auch die gespeicherten Watches öffentlich.

## Lokale Prüfung

`node --test tests/repository-save.test.cjs`

Die Tests verwenden simulierte GitHub-Antworten und schreiben keine Dateien nach GitHub.
