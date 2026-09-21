## Executive Summary

This report presents a comprehensive analysis of a network packet capture from a 2005-era home environment, with the primary goal of determining whether malicious activity occurred during the monitored session. The capture was 8 minutes and 25 seconds long, with 2,449 packets captured, totaling 811,157 bytes. Protocols observed included TCP, UDP, FTP, HTTP, ARP, DNS, legacy SSL variants, and the proprietary TiVoConnect protocol.

The analysis focused on several indicators of compromise, including repeated anonymous FTP access, abnormal HTTP activity to sensitive sites, and the transfer of potentially unsafe executable and multimedia objects. By reconstructing the network timeline, the investigation indicated lateral movement, access to financial and academic accounts, and activity mirroring attack techniques now codified in frameworks such as MITRE ATT&CK.

The client, who only used the computer for e-mail access through their Internet Service Provider (ISP), suspected intrusion. Evidence from the capture shows exploitation of a zero-day FTP vulnerability (**CVE-2002-1345**), multi-stage reconnaissance, likely exfiltration, and exposure to legacy malware delivery channels (e.g. SWF/Flash). While no malware transfers or credential theft was recorded, the assessment concludes that clear compromise and unauthorized data access occurred. Collectively, these actions formed a multi-stage attack chain: external compromise, lateral movement, privilege escalation, and probable data exfiltration.

## Methodology

The investigation followed best practices as outlined by NIST and SANS. The primary tools leveraged in this analysis were **Wireshark** and **NetworkMiner**, together with open-source intelligence. The process combined automated analysis and manual review to uncover the sequence of events, identify potential exploitation, and correlate traffic patterns with known attack vectors.

Wireshark was the primary protocol analyzer used to visualize packet flow, filter traffic by protocol, and reconstruct sessions — leaning on display filters (`ftp`, `dns`, `tcp.stream eq x`, `http`), stream reconstruction, and timeline/volume analysis. NetworkMiner provided supplemental analysis for endpoint enumeration (hostnames, OS, IPs), file carving, and OS/protocol correlation. Automated I/O graphing and manual stream-follow analysis revealed periods of anomalous protocol behavior, which were mapped to attack stages using packet numbers and extracted endpoint evidence. CVE databases were used to confirm exploit paths in the FTP protocol.

## Network Environment and Topology

| IP | Hostname | Role | Protocols Seen |
|---|---|---|---|
| 172.16.0.1 | homeportal.gateway.2wire.net | DHCP Gateway/Router | DNS, DHCP |
| 172.16.1.35 | KaufmanUpstairs | Client (Windows 2000) | All |
| 172.16.1.37 | DVR-8525.local | Digital Video Recorder (TiVo) | MDNS, TiVoConnect |
| 66.39.22.157 | ftp.linux-wlan.org | Remote Attacker (FreeBSD) | FTP, SSLv3, HTTP enumeration |

## Key Event Timeline

| Time (s) | Event | Packets |
|---|---|---|
| 26.7–53.7 | Anonymous FTP login by attacker (66.39.22.157), directory traversal | 27–150 |
| 53.8–69.1 | FTP enumeration, user listing, read/write test commands | 151–206 |
| 94–107 | High-volume HTTP burst, SSLv3 sessions, access to rbfcu.org (bank) | 236–1300 |
| 115–166 | HTTP ad network reach-outs, Flash, microsoft.com, *.msn.com | 1301–1523 |
| 169–171 | Further FTP activity: user creation, file listing, document exfil | 1526–1571 |
| 172–251 | HTTP/SSLv3 sessions, access to academic faculty website | 1572–1590 |
| 251–253 | FTP new accounts created, evidence of persistence | 1700–1785 |
| 255–289 | Webmail/JavaScript login at Yahoo Mail, SSLv3 sessions | 1788–2031 |
| >400 | Session closes, normal TiVoConnect behavior and AOL email observed | 2100–2449 |

## Attack Timeline and Analysis

Initial entry occurred as an anonymous FTP user (66.39.22.157; packets 27–150) using a known NcFTPd vulnerability. The attacker successfully executed directory traversal, confirmed by numerous `LIST` and `USER` commands. After environment enumeration, they exploited system-level access to pivot to HTTP, launching a high-volume web session targeting a banking site between packets 236–1300 (`rbfcu.org`) — sustained, temporally linked activity strongly suggesting a transition from reconnaissance to sensitive-data targeting, consistent with MITRE ATT&CK's Initial Access and Collection TTPs.

Further FTP sessions (packets 1526–1785) displayed new account creation and enabled exfiltration of files from academic directories (`faculty.utsa.edu`). The attacker also accessed additional multimedia and ad networks, delivering legacy SWF content as a potential malware vector. Session evidence closes with webmail access attempts (Yahoo Mail) and the resumption of normal AOL e-mail — but not before the attacker had established full lifecycle compromise: initial access, recon, persistence, and exfiltration.

### Impact of the Zero-Day FTP Vulnerability (CVE-2002-1345)

The exploitation of a zero-day vulnerability in the NcFTPd server had a critical impact on the security posture of the host `KaufmanUpstairs`. This vulnerability permitted an external attacker to bypass FTP jail restrictions through directory traversal and remote command execution, leveraging weaknesses in the server's handling of user input and directory permissions. Without the breakout, HTTP and persistence phases would not have been feasible — attacker access would have stayed confined to the FTP chroot.

**Immediate consequences observed in the capture:**

- **Unauthorized system access** — execution of `LIST` commands and enumeration of system users/directories beyond standard FTP sandboxing (packets 27–150).
- **Privilege escalation and lateral movement** — the breakout enabled HTTP requests from the compromised client against financial, email, and academic sites with the victim's privileges (packets 236–2031).
- **Persistence and further compromise** — multiple new FTP user accounts created post-exploit (packets 1700–1786), independent of the original anonymous login.
- **Facilitation of data exfiltration** — the sequence and timing of FTP document listing and new-user creation suggest staged exfiltration around the sensitive HTTP/SSLv3 sessions (packets 500–2031).

## Maliciousness Assessment

The chain of events — each supported by packet-capture evidence and cross-referenced against known vulnerabilities and attack methods — leaves little doubt as to the malicious nature of this activity. The timeline matches textbook TTPs for multi-stage compromise: external exploit, privilege escalation, lateral movement, and exfiltration (MITRE ATT&CK **T1071, T1078, T1041**). While encrypted protocol use prevented direct observation of credential transit or malware binaries, the presence of classic multi-stage attack behavior together with evidence of post-exploit persistence and data staging satisfies both contemporary and modern definitions of compromise.

## Recommendations

- Immediately disable or restrict anonymous FTP access across all systems; where legitimate FTP is required, enforce authentication with strong, unique credentials and least-privilege permissions.
- Patch and update all FTP services (especially NcFTPd) against known CVEs, with an ongoing patch management policy.
- Mandate encrypted authentication and data transmission for sensitive services (webmail, banking, file transfer) — replace FTP/HTTP with SFTP/FTPS/HTTPS.
- Deploy logging, network segmentation, and anomaly-based IDS/IPS capable of detecting lateral movement, brute-force attempts, and exfiltration patterns.
- Regularly review and audit system, network, and FTP logs for unauthorized access, credential compromise, or privilege escalation.

## Conclusion

This analysis confirms that the capture reflects a multi-stage network compromise, initiated by exploitation of a zero-day FTP vulnerability that enabled the attacker to break free from directory restrictions and gain system-level access. Through forensic packet inspection, the attacker is shown enumerating directories, creating new accounts, and pivoting toward sensitive web sessions targeting banking, email, and academic assets — classic tactics consistent with modern adversary behavior: privilege escalation, lateral movement, persistence, and probable data exfiltration. Even though no direct credential theft was observed, the attacker's control over the host and access to high-value web sessions greatly increased the potential for data loss and further compromise. The case underscores the importance of defense-in-depth, proactive vulnerability management, and secure configuration, even in legacy or non-enterprise environments.

## References

- Christey, S. M. (2002). *Directory Traversal Vulnerabilities in FTP Clients.* MARC Bugtraq.
- CVE-2002-1345. CVE.org.
- KINGCOPE. (2009). *NcFTPd 2.8.5 – Remote Jail Breakout.* Exploit Database.
- Chuvakin, A. (2002). *FTP attack case study — Part I: The analysis.* LinuxSecurity.com.
- MITRE ATT&CK. T1071, T1078, T1041. attack.mitre.org
- SANS Institute, *Incident Handler's Handbook.*
- NetworkMiner Official Documentation. netresec.com

*The full report, including the packet-capture appendix (Wireshark and NetworkMiner screenshots), is available as a PDF below.*
