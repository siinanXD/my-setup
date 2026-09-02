# Cursor Plugin Loop

Dieses Dokument integriert ausgewählte Plugins aus [`cursor/plugins`](https://github.com/cursor/plugins) in den bestehenden Engineering-Workflow.

Geprüfte Upstream-Revision: `efa2a531985e0a8084d36ff3cf87233be8a9f34b` vom 2. September 2026. Die Installation über Cursor löst die aktuell angebotene Plugin-Version auf; die Revision dokumentiert die geprüfte Grundlage, ist aber kein Lockfile.

## Einmalige Installation pro Cursor-Umgebung

In Cursor nacheinander ausführen:

```text
/add-plugin cursor-team-kit
/add-plugin ralph-loop
/add-plugin agent-compatibility
```

Optional für größere oder riskante Pull Requests:

```text
/add-plugin thermos
```

Nicht als Standard installieren:

```text
orchestrate
```

Die Plugin-Installation ist Cursor-/Gerätezustand und wird nicht durch Git synchronisiert. Deshalb die drei Standard-Plugins auf Haupt-PC und Laptop jeweils einmal installieren. Keine Plugin-Dateien in jedes Projekt kopieren und das vollständige Upstream-Repository nicht forken oder vendoren.

## Zuständigkeiten im Loop

| Phase | Tool oder Plugin | Ergebnis |
| --- | --- | --- |
| Planung | Linear | Vollständiger Auftrag mit Scope, Acceptance Criteria, Risiken und Testhinweisen |
| Implementierung | Cursor + bei Bedarf `ralph-loop` | Kleinster korrekter Diff auf einem Feature-Branch |
| Lokale Prüfung | bestehende Repo-Kommandos | Nur tatsächlich vorhandene Tests, Lint-, Typecheck- und Build-Schritte |
| CI-Reparatur | `cursor-team-kit`: `loop-on-ci` / `fix-ci` | Fokussierte Fixes bis relevante Checks grün sind oder ein echter Blocker vorliegt |
| PR-Vorbereitung | `cursor-team-kit`: `review-and-ship` / `make-pr-easy-to-review` | Kleiner, nachvollziehbarer PR; kein Merge |
| Unabhängiges Review | Codex | Befunde gegen aktuellen PR-Head und tatsächlichen Code |
| Fix + Re-Review | Cursor, danach Codex | Gültige Befunde minimal beheben und neuen Head erneut prüfen |
| Tiefenreview | Claude Code; optional `thermos` als Zusatz | Nur bei Architektur-, Security-, Datenmodell-, Skalierungs- oder Infrastruktur-Risiko |
| Abschluss | Owner | Manueller Merge; Production-Deploy bleibt separat und manuell |

## Ralph-Loop sicher starten

Ralph eignet sich nur für Arbeit, deren Ende automatisch prüfbar ist. Der Prompt enthält den vollständigen Linear-Auftrag, betroffene Grenzen, bestehende Testkommandos und eine endliche Iterationszahl.

Beispiel:

```text
Start a ralph loop: "
Implementiere den beschriebenen Linear-Auftrag auf einem Feature-Branch.

Acceptance Criteria:
- <konkretes Verhalten>
- <konkreter Test>
- nur der verlangte Scope
- relevante vorhandene Checks bestehen
- kein Merge und kein Production-Deploy

Stoppe bei fehlender Freigabe, Secrets, unklarer Produktentscheidung oder nicht reproduzierbarem Blocker.
Output <promise>IMPLEMENTATION_READY</promise> only when every criterion is evidenced.
" --completion-promise "IMPLEMENTATION_READY" --max-iterations 12
```

Die Zahl `12` ist ein Startwert, kein Ziel. Für kleine Fixes weniger Iterationen verwenden. Ein erreichter Promise-Text ersetzt weder CI noch Review.

## Standardablauf in Cursor

1. Aktuellen `main`-Stand und offene PRs auf GitHub prüfen.
2. Linear-Auftrag vollständig lesen und Branch vom aktuellen `main` erstellen.
3. Bestehende Patterns und reale Prüfkommandos ermitteln.
4. Direkt implementieren oder bei klar prüfbarer, iterativer Arbeit einen begrenzten Ralph-Loop starten.
5. Relevante Checks ausführen.
6. PR öffnen; niemals selbst mergen.
7. Mit `loop-on-ci` nur echte CI-Fehler bearbeiten.
8. Codex-Review abwarten und jeden Befund gegen den aktuellen Head validieren.
9. Nur gültige Befunde minimal beheben, Checks wiederholen und Codex auf dem neuen Head erneut prüfen lassen.
10. Bei riskanten Änderungen Claude Code als Final Review einsetzen.
11. Owner entscheidet über Merge und späteren Deploy.

## Einsatzgrenzen

- `agent-compatibility` beim erstmaligen Übernehmen eines Repos oder nach relevanten Workflow-/Bootstrap-Änderungen ausführen, nicht bei jedem kleinen PR.
- `thermos` nur für ausreichend große oder riskante Diffs. Es ergänzt Codex und Claude, ersetzt sie nicht.
- `review-and-ship` darf Branch, Commit und PR vorbereiten, aber keinen Merge oder Deploy auslösen.
- Keine automatische Änderung von Dependencies, Versionen, Secrets, Deployments oder Git-Historie.
- Bei uneindeutigem Scope zurück zu Linear bzw. zum Owner statt weitere Agentenschleifen zu starten.
