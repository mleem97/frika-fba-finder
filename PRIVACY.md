# Datenschutzerklärung für die Browser-Erweiterung "FBA Finder"

**Stand: 14. Januar 2026**

Wir freuen uns über Ihr Interesse an unserer Browser-Erweiterung "FBA Finder" (im Folgenden "Erweiterung"). Der Schutz Ihrer Privatsphäre ist für uns von höchster Bedeutung. Nachstehend informieren wir Sie ausführlich über den Umgang mit Ihren Daten.

---

## 1. Verantwortlicher

Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze ist:

**Meyer Media**  
Am Friedrich-Ebert-Park 1a  
31157 Sarstedt  
Deutschland

E-Mail: dsa@marvinlee.de

---

## 2. Grundprinzip: Lokale Datenverarbeitung

Der wichtigste Grundsatz unserer Erweiterung ist: **Ihre Daten gehören Ihnen.**

Der "FBA Finder" ist so konzipiert, dass alle Funktionen zur Filterung von Amazon-Suchergebnissen **ausschließlich lokal auf Ihrem Endgerät** (in Ihrem Browser) ausgeführt werden. Es findet **keine Übertragung** von personenbezogenen Daten, Suchverläufen oder Kaufverhalten an Server von Meyer Media oder Dritte statt.

---

## 3. Erhebung und Speicherung von Daten

### 3.1. Keine Personenbezogenen Daten

Wir erheben, speichern oder verarbeiten keine personenbezogenen Daten (wie Name, Adresse, E-Mail, IP-Adresse). Wir legen keine Nutzerprofile an.

### 3.2. Einstellungen und Konfiguration

Die Erweiterung speichert Ihre gewählten Einstellungen (z.B. "Gesponserte Produkte ausblenden: Ja/Nein") lokal in Ihrem Browser. Hierfür nutzen wir die `chrome.storage`-Technologie.

* **chrome.storage.local:** Daten werden lokal auf Ihrem Gerät gespeichert.
* **chrome.storage.sync:** Sofern Sie im Chrome-Browser mit einem Google-Konto angemeldet sind und die Synchronisation aktiviert haben, werden diese Einstellungen von Google verschlüsselt synchronisiert, damit Sie Ihre Einstellungen auf allen Ihren Geräten nutzen können. Meyer Media hat keinen Zugriff auf diese Daten.

**Gespeicherte Einstellungen:**

| Einstellung | Zweck |
|-------------|-------|
| `enabled` | Ob der Filter aktiv ist |
| `hideSponsored` | Präferenz zum Ausblenden gesponserter Produkte |
| `hideFBM` | Präferenz zum Ausblenden von Nicht-FBA Produkten |
| `viewMode` | Darstellungsmodus (Ausblenden/Abdunkeln/Markieren) |
| `strictPrime` | Strikte Prime-Filterung |

### 3.3. Webseiten-Inhalte

Um die Filterfunktion bereitzustellen, analysiert die Erweiterung kurzzeitig den HTML-Code der von Ihnen aufgerufenen Amazon-Webseiten (DOM-Manipulation). Diese Analyse findet im Arbeitsspeicher Ihres Geräts statt. Die Inhalte werden weder dauerhaft gespeichert noch an uns übermittelt.

---

## 4. Berechtigungen (Permissions)

Die Erweiterung fordert bei der Installation bestimmte Berechtigungen an. Diese sind technisch notwendig, um die Funktion zu gewährleisten:

| Berechtigung | Verwendungszweck |
|--------------|------------------|
| **"Auf Ihre Daten für alle amazon.* Websites zugreifen"** | Zwingend erforderlich, damit das Skript die Produkte auf der Amazon-Webseite erkennen und filtern kann (Content Script). Das Skript wird nur auf Amazon-Domains aktiv. |
| **"Storage" (Speicher)** | Dient ausschließlich dem Speichern Ihrer Filtereinstellungen (siehe Punkt 3.2). |

Diese Berechtigungen sind das Minimum, das für die Funktionalität der Erweiterung erforderlich ist.

---

## 5. Weitergabe von Daten an Dritte

Da wir keine Daten erheben, geben wir folglich auch keine Daten an Dritte weiter. Wir nutzen **keine** Analyse-Tools (wie Google Analytics, Matomo) und binden **keine** Werbung Dritter in die Erweiterung ein.

**Die Erweiterung verwendet KEINE Drittanbieter-Dienste:**

- ❌ Keine Analyse-Dienste
- ❌ Keine Werbenetzwerke
- ❌ Keine externen APIs
- ❌ Keine Datenerfassungsdienste
- ❌ Keine Social-Media-Integrationen

---

## 6. Datensicherheit

- Alle Einstellungen werden mit der sicheren Chrome Storage API gespeichert
- Es werden keine Daten über das Internet übertragen
- Diese Erweiterung stellt keine externen Verbindungen her
- Der gesamte Code läuft lokal in Ihrem Browser

---

## 7. Ihre Rechte

Auch wenn wir keine personenbezogenen Daten verarbeiten, stehen Ihnen gemäß DSGVO folgende Rechte zu, sofern Daten vorhanden wären:

- **Recht auf Auskunft** (Art. 15 DSGVO)
- **Recht auf Berichtigung** (Art. 16 DSGVO)
- **Recht auf Löschung** (Art. 17 DSGVO)
- **Recht auf Einschränkung der Verarbeitung** (Art. 18 DSGVO)
- **Recht auf Datenübertragbarkeit** (Art. 20 DSGVO)
- **Widerspruchsrecht** (Art. 21 DSGVO)

Da wir keine Nutzerdaten speichern, können wir Anfragen zur Auskunft über gespeicherte Daten in der Regel nur mit dem Hinweis beantworten, dass keine Daten vorliegen.

**Praktische Ausübung Ihrer Rechte:**

1. **Zugriff auf Ihre Daten:** Einsicht in die Einstellungen über die Optionsseite der Erweiterung
2. **Ändern Ihrer Daten:** Einstellungen jederzeit über die Erweiterung änderbar
3. **Löschen Ihrer Daten:** Deinstallation der Erweiterung entfernt alle gespeicherten Daten
4. **Datenübertragbarkeit:** Ihre Einstellungen werden via Chrome Sync synchronisiert (falls aktiviert)

---

## 8. Datenschutz bei Kindern

Diese Erweiterung sammelt wissentlich keine Informationen von Kindern unter 13 Jahren. Die Erweiterung sammelt grundsätzlich keine personenbezogenen Daten von Nutzern jeglichen Alters.

---

## 9. Änderungen dieser Datenschutzerklärung

Wenn wir Änderungen an dieser Datenschutzerklärung vornehmen, aktualisieren wir das Datum "Stand" am Anfang dieses Dokuments. Die weitere Nutzung der Erweiterung nach Änderungen stellt die Akzeptanz der aktualisierten Richtlinie dar.

---

## 10. Open Source

FBA Finder ist Open Source. Sie können den vollständigen Quellcode einsehen, um unsere Datenschutzpraktiken zu überprüfen:

- **Repository:** https://github.com/meyermedia/frika-fba-finder (Platzhalter - bitte anpassen)

---

## 11. Kontakt

Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden:

**Meyer Media**  
E-Mail: dsa@marvinlee.de

Für Supportanfragen zur Erweiterung:
- GitHub Issues: https://github.com/meyermedia/frika-fba-finder/issues (Platzhalter - bitte anpassen)

---

## 12. Bereitstellung dieser Richtlinie

Diese Datenschutzerklärung kann für die Chrome Web Store-Einreichung auf GitHub Pages gehostet werden:

1. GitHub Pages in den Repository-Einstellungen aktivieren
2. Die Richtlinie ist dann verfügbar unter: `https://meyermedia.github.io/frika-fba-finder/PRIVACY`

---

*Diese Datenschutzerklärung tritt mit Wirkung vom 14. Januar 2026 in Kraft.*

---

## English Version (Privacy Policy)

**Last Updated: January 14, 2026**

### Controller

**Meyer Media**  
Am Friedrich-Ebert-Park 1a  
31157 Sarstedt  
Germany

Email: dsa@marvinlee.de

### Core Principle: Local Data Processing

**Your data belongs to you.** FBA Finder processes all filtering functions **exclusively locally on your device** (in your browser). **No transmission** of personal data, search history, or purchasing behavior to Meyer Media servers or third parties takes place.

### Data Collection

**We do NOT collect any personal data.**

- ❌ No personal information collected
- ❌ No browsing history collected
- ❌ No search queries collected
- ❌ No user behavior tracking
- ❌ No tracking cookies
- ❌ No user accounts or login required

### Local Storage

Settings are stored locally using `chrome.storage` (sync/local). Meyer Media has no access to this data.

### Permissions

- **Amazon domain access:** Required to filter products on Amazon pages
- **Storage:** Saves your filter preferences locally

### Third-Party Services

**NONE.** No analytics, ads, external APIs, or social media integrations.

### Your Rights (GDPR)

Right to access, rectification, deletion, restriction, data portability, and objection. Since no data is collected, most requests will be answered confirming no data exists.

### Contact

**Meyer Media**  
Email: dsa@marvinlee.de

*This privacy policy is effective as of January 14, 2026.*
