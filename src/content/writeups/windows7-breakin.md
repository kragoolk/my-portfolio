> The computer belonged to someone who had passed away. Everything they had ever done on the computer was still on it, and breaking in took about ten minutes.

A few months ago, as I was leaving my neighborhood, I noticed several cars parked outside a house with an estate sale sign on it — people coming in and out of the door carrying vintage glassware and mini plane models. Decided I ought to check it out; it's not a common occurrence for an estate sale to open up in my neighborhood. What better to do on a Saturday afternoon anyways?

About a half hour in, having dreamt up a story of the old couple that lived in that home based on their belongings, I wandered into the living room and found an old computer. It looked like the one I had as a kid — its plastic case oxidized into a light yellow through the years, a fading Windows 7 and Intel Core i5 sticker on its face. A Dell XPS, 2011. On top of it, a fifty-dollar tag. Score. Next to it, a Lego Star Wars and Lord of the Rings CD-ROM. Double score. Figured it could be a fun little exercise to break into it, and play Lego Star Wars once I got in, as a treat of course.

![Kali Linux boot menu on the old Dell's monitor](/media/writeups/windows7-breakin/01-kali-boot.jpg)

The thing gathered dust in my garage for a few months. I started a new job, picked up a few networking skills, and decided it was the perfect time to run Cat6 cable through the attic in the middle of July. Once all of the attic fiberglass dust settled and I had the Windows 7 computer on its own dark, cold, and isolated VLAN port on my EdgeSwitch, I flashed a copy of `kali-linux-2026.2-live-everything-amd64` onto a USB with Rufus and booted it up. I thought the VLAN work was overkill for a standalone offline attack — but figured why not.

## Finding the SAM

This same live USB can be a defender's evidence-preservation tool, or an attacker's disk-editing tool, depending on how you boot it. For this exercise, I chose the Live system, where the full range of offensive tools are loaded in.

So, let's get to the meat of it: I'm doing an offline SAM attack — mounting the Windows disk and using `chntpw` to edit the password directly. The Windows OS never runs, so its login can't stop me. First things first, I need to see what I can get my hands on. `sudo fdisk -l` enumerates the partitions. I'm looking for the one holding the SAM and SYSTEM databases — Windows' password and policy store.

![First fdisk -l pass, showing two bootable NTFS candidates](/media/writeups/windows7-breakin/02-fdisk-first-look.jpg)

Two candidates turned up, both with a bootable NTFS partition:

- `sdb2` (144.3G, bootable) on the old Maxtor drive
- `sda2` (13.2G, bootable) on the WDC drive

Both had a Windows install on them, so I flipped a coin and went with `sdb2` first — the bigger, older Maxtor drive. Mounted it up and went looking for the SAM.

My first `ls` came up empty — no `System32/config` at that path — but a peek at the root showed a full Windows install: `boot.ini`, `ntldr`, `Documents and Settings`. Old-school. This was a **Windows XP** layout, not 7.

![Browsing the mounted drive — an entire stranger's file listing, XP-style](/media/writeups/windows7-breakin/03-wrong-drive-pictures.jpg)

Sure enough, the config folder was there, just under the uppercase `WINDOWS\system32\config` the way XP does it. SAM, SYSTEM, SECURITY — all present and accounted for. Good enough for me. The SAM is the SAM. I pointed `chntpw` at it and got to work.

## Editing the wrong machine (and not knowing it yet)

![chntpw -i SAM, main interactive menu](/media/writeups/windows7-breakin/04-chntpw-sam-menu.jpg)

`chntpw -i SAM` opens the hive and drops you into its interactive menu. Option 1 gets you into the user and password editor.

![User list: Administrator, AJ, ASPNET, Guest, HelpAssistant, Linda, SUPPORT](/media/writeups/windows7-breakin/05-user-list.jpg)

There they are. I picked the main user account and went in. `chntpw` even tells you the account probably has a blank password once you clear it — no NT or LANMAN hash left to check against.

![Password cleared confirmation in the user editor](/media/writeups/windows7-breakin/06-password-cleared.jpg)

Cleared the password and unlocked the user. Then, because the Live USB wipes itself every reboot and I did not feel like coming back, I figured I would disable the blank-password login policy while I was in here too. That lives in the SYSTEM hive, in the registry, not the SAM.

Opening the SYSTEM hive in `chntpw`'s registry editor took me a second to find the right path — it's `ControlSet001\Control\Lsa`, not the `CurrentControlSet` alias Windows shows you while it's running.

![Inside Lsa — LimitBlankPasswordUse set to 1](/media/writeups/windows7-breakin/07-lsa-registry-before.jpg)

`LimitBlankPasswordUse` is set to 1 — that's the switch that stops blank-password accounts from logging in at the normal screen.

![LimitBlankPasswordUse flipped to 0 and verified](/media/writeups/windows7-breakin/08-lsa-registry-after.jpg)

Flipped it to 0. Small gotcha: `chntpw`'s registry editor is case-sensitive, so `LimitBlankPasswordUse` got me nothing but the lowercase `limitblankpassworduse` worked. Wrote the hive and backed out.

Password cleared, policy disabled, hive written. By every check I had just won. So I rebooted, pulled the USB, and… nothing. Same login screen, same lock. Tried logging in with no password. Nope.

At this point I realized something else was wrong. I even tried copying `cmd.exe` over `utilman.exe` in the `system32` folder so a terminal could open when I clicked the accessibility helper button at the login screen — the classic Utilman trick, where a SYSTEM shell drops before you ever log in. Did the swap. The real accessibility menu still popped up. That was the moment it clicked that something bigger was off.

## The ghost machine

I decided to check `fdisk` again, to see what I could find. Maybe there was something I missed.

![Second fdisk -l pass — sda3 stands out, unmarked bootable](/media/writeups/windows7-breakin/09-fdisk-second-look.jpg)

Weird — `/dev/sda3` is quite massive for it to not be bootable, and `sda2` is just 13.2G. Maybe I could still mount it and see what that's all about. Juicy. I wonder why this was overlooked because of the bootable signifier. Couldn't tell in its usual naming standard — all lowercase `sam` and `system`. Wonder why? And why were both SAM and SYSTEM files identical to before?

Same drill, this time on the real disk. `chntpw -i sam` (lowercase, again) opens the actual Windows 7 SAM. Different user list, different machine — this was the one that had been booting all along.

Cleared the password, and changed the password policy on this partition as well, just to be sure and not have to come back here again. Remember, the Live USB resets every time it gets loaded up again. Same policies set — default stuff. Blanked the password, no more password necessary.

![Windows 7 Welcome screen, logging in with no password](/media/writeups/windows7-breakin/10-welcome-screen.jpg)

And there we go. Little mishap there, but jeez — it's really that simple? Just plug a USB in and you get pwned?

## What actually happened

Well, almost that simple. That ten-minute figure is doing some heavy lifting, because the first time around I spent most of it breaking into the wrong computer.

That old Maxtor drive I flipped a coin on was carrying a Windows XP install from some earlier life of the machine — a whole second operating system, sitting there with its own SAM, its own users, its own everything. I cleared its password, rewrote its registry, swapped its Utilman, and rebooted straight into a Windows 7 login screen that had never heard of a single thing I just did. A flawless break-in, on a ghost.

That's the part worth keeping. A bootable partition with a valid SAM looks exactly like the real target right up until you reboot and nothing happens. The drive that was actually running Windows 7, `sda3`, did not even have the bootable flag set, which is the whole reason I skipped past it. **Confirm which OS actually boots before you spend an hour attacking one that doesn't.** "A Windows install" and "the Windows install" are not the same thing.

When I finally got into the right one, I got what I came for — Lego Star Wars fired right up. But I also got everything else. Behind that login was a stranger's entire life: documents, photos, accounts, all of it readable by anyone willing to do what I just did on a slow afternoon. I'm not going to say what was on there. It belonged to someone who is not around to mind, and that is reason enough to leave it be. But it landed in a way a lab VM never could. This was not an exercise. It was a real person, and their password did nothing to protect any of it.

## The actual point

A Windows login password stops your little brother. It does not stop someone who can hold the drive in their hands. The one thing that would have stopped me is full-disk encryption. With BitLocker turned on, that SAM file is an unreadable blob and this whole write-up is thirty seconds of me staring at a locked drive. **A password guards the door. Encryption guards the house.**

The uncomfortable footnote is where this machine came from in the first place. Estate sales, marketplace listings, donated and resold computers — they are everywhere, and almost none of them get wiped. People upgrade, pass away, clean out a garage, and their entire digital life walks out the door on a fifty-dollar Dell. I bought mine to play Lego Star Wars. The next person might be after something else.
