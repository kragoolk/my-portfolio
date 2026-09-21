**Windows XP System Compromise via Anonymous FTP and Malware Installation**

**Affected system:** `win-xp-1.ISCS-int.lan` (172.16.3.211) &nbsp;·&nbsp; **Investigation period:** October 7–15, 2025

## Executive Summary

This report documents the forensic investigation and root cause analysis of a Windows XP system compromise discovered on an internal lab network. The investigation revealed a multi-stage attack involving anonymous FTP exploitation, malware installation via pirated software, and deployment of multiple persistent backdoors. The attacker gained full administrative access, established command-and-control infrastructure, and successfully harvested user credentials. The incident highlights critical security deficiencies: an unsupported operating system, misconfigured network services, weak password policies, and insufficient network segmentation.

## Initial Discovery and Reconnaissance

The investigation began with network enumeration using **Nmap**, revealing a Windows XP host with an unusually wide set of open ports: FTP (21), SMTP (25), HTTP (80), SMB (445), VNC (5900), and several non-standard ports including 666, 6666, and 6667. Windows XP reached end-of-life in April 2014 — over a decade without security updates, leaving the system exposed to a vast, well-documented set of unpatched vulnerabilities.

Further examination showed the FTP service was configured for **anonymous access with read *and* write permissions** — a severe misconfiguration that lets any network user upload arbitrary files without authentication. Browsing the anonymous FTP directory turned up several suspicious files: `lock.bat`, `nc.exe`, `Razor.1911.IRC.nfo`, `runasspc.exe`, and a `VNC4` directory containing multiple DLL/EXE/DAT files.

## Attack Vector Analysis

The `Razor.1911.IRC.nfo` file was the key piece of intelligence. **Razor 1911** is a well-known "warez scene" group distributing pirated software bundled with NFO installation-instruction files. The NFO referenced an IRC server on the compromised network (port 6667, channel `#chat`, bot `mybotDCC`) — infrastructure characteristic of warez distribution and botnet command-and-control.

Reconstructed attack sequence:

1. A user downloaded a pirated release (a Razor 1911 crack of *The Sims 3* and related updates) from an external source.
2. The user executed the installer, which bundled malware alongside the cracked game files.
3. The malware's installation routine deployed multiple persistent backdoors and remote-access tools.
4. The malware reconfigured the FTP service for anonymous write access, letting the attacker upload further tools and stage exfiltration.
5. The attacker established C2 via IRC and layered in multiple persistence mechanisms to maintain access.

## Post-Exploitation and Persistence Mechanisms

- **Bindshell backdoor** — a `cmd.exe` shell bound to TCP port 6666 (Nmap banner: *"CMD.EXE (BACKDOOR)"*). Connecting with netcat confirmed full, unauthenticated remote command execution at SYSTEM/Administrator-level privilege — complete system compromise.
- **Startup persistence** — a malicious `startup.bat` planted in the user's Startup folder, executed automatically at every login, launching the bindshell and other malicious processes on boot.
- **`lock.bat`** — an additional batch script recovered from the FTP directory, consistent with the kind of script attackers use to disable security tooling, alter firewall rules, or create scheduled tasks for persistence.
- **RealVNC 4.0** — installed and exposed on both TCP 5900 (VNC) and 5800 (VNC-over-HTTP), offering a further remote-access channel alongside the bindshell.

## Credential Compromise and Password Analysis

The investigator extracted the Windows **SAM** database and `SYSTEM` registry hive (`reg save`). On Windows XP, local password hashes are stored using the legacy **LAN Manager (LM)** algorithm alongside NTLM — and LM's design (uppercasing, splitting passwords into two independently-hashed 7-character halves, unsalted DES) makes it trivially susceptible to rainbow-table attacks.

Using `ophcrack` with the XP free rainbow tables, every local account password was recovered in **under two seconds**, at a 99.95% success rate — a direct illustration of why LM hash storage should never be enabled on a modern system, and of the risk posed by short, dictionary-word passwords.

## Additional Attack Surface

Beyond FTP and the bindshell, the host exposed SMB on ports 139/445 — Windows XP is susceptible to **MS08-067 (CVE-2008-4250)**, the RCE vulnerability behind the 2008 Conficker worm (automated exploitation attempts in this investigation did not succeed, but the underlying exposure remained present and unpatched). An IRC daemon was confirmed live on port 6667, consistent with the Razor 1911 package installing IRC infrastructure for C2 and file distribution — a highly anomalous service for a Windows workstation to be running at all.

## Root Cause Determination

The root cause of this incident is the combination of **anonymous FTP write access on an unpatched Windows XP system**, which allowed an attacker to upload and execute malware disguised as pirated software. That root cause was compounded by several contributing failures:

- **End-of-life OS** — Windows XP had received no security patches in over a decade, leaving a permanently vulnerable attack surface.
- **FTP misconfiguration** — anonymous write access should never be enabled on a production/production-like system.
- **Weak password policy** — every recovered password fell to rainbow tables in seconds; modern policy should mandate 14+ character passwords and disable LM hash storage entirely.
- **No network segmentation** — the compromised host could freely run IRC and bindshell services on non-standard ports without triggering any network-level alerting.
- **No endpoint protection** — an EDR solution, or even legacy antivirus, would likely have flagged the malware components tied to this release.
- **User behavior** — the incident was ultimately triggered by installing software from an untrusted, pirated source.

## Impact Assessment

**Confidentiality:** all data on the system should be considered exposed — local files, cached credentials, and every local account password (confirmed via SAM extraction).
**Integrity:** the attacker had unrestricted ability to modify files, the registry, and system configuration; no data on the host can be trusted without full forensic validation.
**Availability:** while no destructive activity was observed, SYSTEM-level bindshell access gave the attacker the same capability as a legitimate administrator, including the ability to disable services or wipe the drive.

The layered persistence (startup script + multiple backdoor channels) indicates the attacker intended sustained access rather than a one-off opportunistic hit.

## Recommendations

**Immediate:**

- Isolate the system from the network; image the drive before any remediation that would alter evidence.
- Reset every credential identified on the host, starting with the Administrator account.
- Disable anonymous FTP network-wide and audit other systems for the same misconfiguration.

**Long-term:**

- Decommission remaining Windows XP systems in favor of a currently-supported OS.
- Implement network segmentation and firewall rules between security zones.
- Deploy EDR across workstations/servers, plus application whitelisting.
- Enforce 14+ character passwords, disable LM hash storage, and require MFA for administrative accounts.
- Stand up SIEM logging and a tested incident-response process.
- Run regular vulnerability assessments and user security-awareness training, specifically covering the risks of pirated software.

## Conclusion

The technical evidence gathered conclusively shows this was not a zero-day or advanced-persistent-threat compromise, but the predictable outcome of well-documented, stacked security failures: an end-of-life OS, a misconfigured FTP service, weak credentials, and no segmentation or endpoint visibility. Anonymous FTP write access on an unpatched Windows XP host, exploited through malware bundled with pirated software, was the root cause — and a textbook case for why defense-in-depth and basic security hygiene matter even on systems that feel low-stakes.

*The full report, including the Nmap/Zenmap scan output, ophcrack results, and forensic screenshots, is available as a PDF below.*
