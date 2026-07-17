; Custom NSIS hooks for the FikraNova Print Agent installer.
;
; Silent install (fleet deployment):
;   FikraNovaPrinterSetup.exe /S
;
; The installer is generic — it carries no customer identity. The agent is bound
; to a restaurant at first launch via a pairing code, so the same binary can be
; pushed to every location.

!macro customInstall
  ; Stop a running instance before overwriting its files, otherwise the update
  ; silently fails on locked binaries.
  nsExec::Exec 'taskkill /F /IM "FikraNova Print Agent.exe" /T'
  Pop $0

  ; Outbound-only agent: no firewall rule is required. We deliberately do NOT
  ; open any inbound port.
!macroend

!macro customUnInstall
  nsExec::Exec 'taskkill /F /IM "FikraNova Print Agent.exe" /T'
  Pop $0

  ; Remove the auto-start entry created by auto-launch. Leaving it behind would
  ; make Windows try to start a deleted executable at every boot.
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "FikraNova Print Agent"
!macroend
