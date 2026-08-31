# Engineering

Diese Datei ist die **einzige Source of Truth** für Engineering-Regeln in diesem Repository.

Tool-Dateien (`.cursor/rules`, `AGENTS.md`, `CLAUDE.md`) dürfen diese Regeln nicht wiederholen. Sie verweisen nur hierher und setzen die tool-spezifische Standardrolle.

Wenn eine Anweisung in einem Tool-File dieser Datei widerspricht, gilt diese Datei — außer die Nutzerin oder der Nutzer hebt eine Regel für den aktuellen Auftrag ausdrücklich auf.

## Philosophie

- Einfach beginnen. Die kleinste Architektur wählen, die die aktuelle Anforderung korrekt löst.
- Komplexität muss durch eine konkrete Anforderung oder Messung verdient sein.
- Verständliche, bewährte Technik vor cleveren Abstraktionen.
- Bewährte Muster aus bestehenden Repositories wiederverwenden, bevor neue entstehen.
- Beobachtbarkeit und Testbarkeit von Anfang an mitdenken — aber keine Infrastruktur anlegen, die jetzt nicht gebraucht wird.

## Prinzipien

1. **Smallest correct change.** Ändere nur das, was nötig ist, damit der Auftrag korrekt erfüllt ist.
2. **Acceptance Criteria haben Vorrang.** Wenn AC, Issue, PR-Beschreibung oder der aktuelle Auftrag etwas fordern, gilt das vor Stil, Vorlieben und „Aufräumen“.
3. **Außerhalb des Scopes bleibt unverändert.** Keine Mitänderungen an benachbartem Code, Docs, Formatierung oder Konfiguration, die der Auftrag nicht verlangt.
4. **Keine unnötigen Refactorings.** Kein Umschreiben „nebenbei“, keine Umbenennungen, keine Strukturänderungen ohne Auftrag.
5. **Keine unnötigen Abstraktionen.** Keine neuen Layer, Helper, Generics oder „für später“-Frameworks, wenn ein konkreter, lokaler Fix reicht.
6. **Keine neuen Dependencies ohne Notwendigkeit.** Nur dann, wenn der Auftrag ohne bestehende Mittel im Repo nicht sinnvoll lösbar ist — und dann explizit begründen.
7. **Keine Dependency-Upgrades ohne Auftrag.** Keine Major/Minor/Patch-Updates, keine Lockfile-only-Upgrades, kein `latest`.
8. **Keine Versionsänderungen durch Coding Agents.** Keine Bumps von App-Version, Package-Version, Runtime, Image-Tags oder Toolchain-Dateien, außer ausdrücklich beauftragt.
9. **Kleine, klar abgegrenzte PRs.** Ein Anliegen pro PR. Diff klein halten. Keine Sammel-PRs.
10. **Bestehende Patterns bevorzugen.** Zuerst im Repo nach vergleichbarem Code suchen und denselben Stil, dieselbe Struktur und dieselben Bibliotheken verwenden.
11. **Tests entsprechend dem tatsächlichen Risiko.** Testumfang an Blast Radius, Nutzerwirkung und Fehlerkosten ausrichten — nicht an Gewohnheit und nicht an Vollständigkeit um der Vollständigkeit willen.
12. **Niemals direkt auf `main` arbeiten.** Immer einen Feature-Branch verwenden.
13. **Niemals selbstständig mergen.** Kein Merge, kein Rebase auf `main` mit Push, kein Auto-Merge.
14. **Niemals selbstständig Production deployen.** Kein Deploy, kein Release, kein Promote, kein Produktions-Secret-Zugriff.

## Standardrollen der Tools

Die Nutzerin oder der Nutzer kann die Rolle pro Auftrag überschreiben. Ohne explizite andere Anweisung gilt:

| Tool | Standardrolle | Schreibzugriff |
| --- | --- | --- |
| **Cursor** | Implementierer | Darf Code ändern, um den Auftrag umzusetzen. |
| **Codex** | Reviewer | Kein Code ändern, außer ausdrücklich gefordert. |
| **Claude Code** | Deep Reviewer | Kein Code ändern, außer ausdrücklich gefordert. Fokus: Architektur, Security, Regressionen, schwierige oder riskante Änderungen. |

Cursor bleibt für die Implementierung zuständig. Codex bleibt für unabhängiges Code-Review und Regressionsbefunde zuständig.

**Claude Code** für Architektur-Review nutzen, wenn eine Änderung nennenswerte Architektur-, Security-, Skalierungs-, Datenmodell- oder Infrastruktur-Entscheidungen einführt. Claude Code ist kein Pflicht-Freigabeschritt für kleine Änderungen.

Reviewer liefern Befunde, Risiken und konkrete Hinweise. Sie patchen, formatieren oder „verbessern“ das Repo nicht von sich aus.

## Review-, Fix- und Re-Review-Loop

Ein Review-Befund ist zunächst eine Hypothese, kein automatischer Änderungsauftrag.

1. Jeden Codex-, Copilot- oder Claude-Befund gegen den **aktuellen PR-Head**, den tatsächlichen Code, bestehende Tests und relevante Abhängigkeiten prüfen.
2. Befunde als **gültig**, **bereits behoben/veraltet** oder **nicht zutreffend** einordnen. Nicht zutreffende Befunde mit konkreter Evidenz ablehnen; niemals blind fixen.
3. Für einen gültigen Befund setzt Cursor oder ein ausdrücklich beauftragter Implementierer den **kleinsten sicheren Fix** um. Bei Verhaltens-, Security-, Daten- oder bisherigen Regressionsfehlern einen passenden Regressionstest ergänzen, wenn das bestehende Test-Pattern dies sinnvoll abbildet.
4. Danach die für die Änderung relevanten lokalen Checks und CI erneut ausführen. **Grüne CI allein schließt einen offenen Review-Befund nicht.**
5. Nach jedem codeändernden Fix muss der zuständige Reviewer den **neuen Head** erneut prüfen. Ein Review auf einer älteren SHA reicht nach weiteren Änderungen nicht als Freigabe.
6. Erst wenn alle materiellen Befunde auf dem aktuellen Head behoben, veraltet oder nachvollziehbar verworfen sind und die relevanten Checks grün sind, ist der PR merge-bereit. Merge bleibt ein menschlicher Schritt.
7. Bei nennenswerten Architektur-, Security-, Skalierungs-, Datenmodell- oder Infrastrukturänderungen folgt nach sauberem Codex-Review ein kurzer **Claude Code Final Review** auf dem aktuellen Head. Für kleine, risikoarme Änderungen ist Claude weiterhin kein Pflicht-Gate.

Standardablauf für relevante Änderungen:

`Cursor implementiert → CI/Copilot → Codex Review → Findings validieren → kleinste gültige Fixes → Tests/CI → Codex Re-Review auf neuem Head → bei riskanten Änderungen Claude Final Review → Owner Merge`

## Architekturentscheidungen

Bevor eine größere Komponente dazukommt: prüfen, ob die bestehende Architektur das Problem ohne sie löst.

Beispiele, die einen konkreten Grund brauchen: Redis, Background-Worker, eigene Vektordatenbanken, LangGraph, Message Queues, Microservices, zusätzliche AI-Provider, komplexe Caching-Schichten.

Projektspezifische Stacks stehen nicht in dieser Datei. Der AI-Stack und AI-spezifische Konventionen gehören nach `docs/AI_ENGINEERING_WORKFLOW.md`.

## Git und Lieferung

- Default-Branch ist `main`. Nicht darauf committen, nicht darauf pushen.
- Branch vom aktuellen Default-Branch erzeugen. Name kurz und sachlich.
- Commits beschreiben die Änderung, nicht das Tool.
- Nach der Implementierung: Branch pushen und Pull Request gegen `main` öffnen, wenn der Workflow das vorsieht.
- Merge, Deploy und Production-Release sind menschliche Schritte.
- Deployment- und Secret-Konventionen stehen in `docs/DEPLOYMENT_AND_SECRETS.md`.

## Dependencies und Versionen

- Vor einer neuen Dependency prüfen, ob das Repo das Problem bereits löst.
- Keine neuen Tools, Linter, Formatter oder CI-Actions ohne Auftrag.
- `package.json`, Lockfiles, Runtime-Dateien (z. B. `.nvmrc`, `Dockerfile`, GitHub Actions `node-version`) nicht „auf aktuellen Stand“ bringen.

## Tests, Qualität, Risiko

- Vor dem Ändern klären, welche Checks das Projekt wirklich hat (siehe unten). Erfundene Checks nicht erfinden.
- Bestehende Tests, die durch die Änderung relevant sind, ausführen.
- Neue Tests nur, wenn das Risiko es rechtfertigt: geänderte Verhaltenslogik, Regression an einer bisherigen Fehlerstelle, Security- oder Datenpfade, undichte Verträge.
- Keine Tests für reines Rename, reine Docs oder unverändertes Verhalten.
- Vorhandene Test-Patterns verwenden. Kein neues Test-Framework.

## Bestehende Patterns

- Öffentliche APIs, Ordnerstruktur, Naming, Error-Handling und State-Patterns des Repos übernehmen.
- Nicht auf ein „saubereres“ Muster wechseln, nur weil es allgemeiner Best Practice ist.
- Generierten Code und Vendor-Dateien nicht von Hand anfassen.

## Kommandos in diesem Repository

Dieses Repository enthält derzeit **keine Anwendung**, keine Toolchain und **keine** Test-, Lint-, Typecheck- oder Build-Skripte.

Stand bei Einrichtung:

- Inhalt: `README.md` plus diese Agent-Dokumentation
- Kein `package.json`, kein `Makefile`, kein `pyproject.toml`, kein `Cargo.toml`, kein `go.mod`
- Kein `.github/workflows`
- Deshalb **nicht** `npm test`, `lint`, `typecheck` oder `build` ausführen oder anlegen, solange der Auftrag das nicht verlangt

### Kommandos später ermitteln

Sobald Anwendungscode existiert, Kommandos in dieser Reihenfolge suchen — und nur ausführen, was tatsächlich definiert ist:

1. `README.md` und diese Datei
2. `package.json` → `scripts` (`test`, `lint`, `typecheck`/`tsc`, `build`)
3. `pnpm-lock.yaml` / `yarn.lock` / `bun.lock` / `package-lock.json` → passenden Package-Manager verwenden, nicht wechseln
4. `Makefile` oder `justfile`
5. Python: `pyproject.toml`, `tox.ini`, `pytest.ini`, `ruff`, `mypy`
6. `Cargo.toml`, `go.mod`, Gradle/Maven
7. `.github/workflows/*` für die in CI tatsächlich laufenden Befehle

Fehlt ein Check, ihn nicht hinzufügen, nur um „vollständig“ zu wirken.

Wenn sich kanonische Kommandos etabliert haben, hier konkret eintragen (Befehl plus wann er zu laufen hat). Bis dahin gilt nur das Ermittlungsverfahren.

## Auftrag ausführen

1. Acceptance Criteria / Auftrag lesen. Unklarheiten am Auftrag festmachen, nicht am Geschmack.
2. Diese Datei und die Standardrolle des laufenden Tools anwenden.
3. Kleinsten korrekten Pfad wählen. Bestehende Patterns zuerst.
4. Nur Dateien anfassen, die der Scope braucht.
5. Risikoabschätzung: welche Checks und Tests sind für *diese* Änderung nötig?
6. Nicht mergen. Nicht nach Production deployen. Nicht auf `main` arbeiten.

## Dokumentationsstruktur

- `docs/ENGINEERING.md` — allgemeine Engineering-Regeln (diese Datei).
- `docs/AI_ENGINEERING_WORKFLOW.md` — Workflow für AI-Projekte: Default-AI-Stack, Evaluation, Observability und Retrieval.
- `docs/DEPLOYMENT_AND_SECRETS.md` — Deployment-, Environment- und Secret-Management-Konventionen für lokale Geräte, CI, Vercel und Railway.

Spezialisierte Dokumente dürfen diese Regeln ergänzen, ihnen aber nicht widersprechen.
