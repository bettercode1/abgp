# ABGP production server

Live site: https://abgpindia.in

This file is the record of where the server is, how to sign in, where backups are, and what member data exists after the October 2026 recovery. Do not put passwords, Razorpay secrets, or the Firebase private key in this file.

## Server

| Item | Value |
| --- | --- |
| Host | `207.180.226.196` |
| Provider | Contabo VPS, customer panel `my.contabo.com` |
| SSH user | `root` |
| App directory | `/home/deploy/apps/ABGP/abgp` |
| API process | PM2 name `abgp-backend`, port `3001`, started on boot |
| Web server | Nginx. Public site and `/api` are proxied to the API |
| Database | PostgreSQL database `ABGP`, schema `abgp`, listens on localhost only |
| Deploy | Push to `main` runs `.github/workflows/deploy.yml` |

## How to log in

SSH password login is turned off. That is intentional. On 7 October 2026 someone logged in as root with a password and deleted the site.

From this computer:

```powershell
ssh -i C:\Users\Admin\.ssh\id_rsa root@207.180.226.196
```

In PuTTY, host `207.180.226.196`, port `22`, username `root`. Under **Connection → SSH → Auth → Credentials**, select the private key. If PuTTY rejects `C:\Users\Admin\.ssh\id_rsa`, open PuTTYgen, choose **Conversions → Import key**, import that file, then **Save private key** and use the `.ppk` file.

The Contabo web console still accepts the root password saved with **Reset credentials** in the VPS panel. That console is not SSH. Use it only if the SSH key is unavailable. GitHub Actions also has its own deploy key on the server.

## What happened

On 7 October 2026, about 18:46 India time, a root session upgraded Ubuntu from 24.04 to 26.04 and then deleted the live site. The commands removed `/home/deploy/apps`, Nginx, Node.js, PostgreSQL, and the `deploy` user. There was no Contabo snapshot and no database dump, so complaints, edited page content, annual-report files, activity photos, and members who never paid through Razorpay could not be restored.

On 9 October 2026 the app was installed again from GitHub, with a new empty database and a new HTTPS certificate (expires 7 January 2027; Certbot renews it).

On 12 October 2026 the Razorpay payments export `payments - 01 Apr 26 - 12 Oct 26.csv` was imported. Captured payments from both abgpindia.in and abgpindia.com were stored as successful payments. Member login uses the email and 10-digit phone on a successful payment. Failed payments were not imported. The import result was 33,451 successful payments and 15,189 distinct email addresses.

## Backups

A backup runs every night at 02:15 server time. It keeps 14 days of files in `/var/backups/abgp` (root only, not on the website):

- `abgp-YYYYMMDD-HHMMSS.dump` — PostgreSQL custom-format dump
- `nginx-YYYYMMDD-HHMMSS.conf` — Nginx site file
- `env-YYYYMMDD-HHMMSS.env` — backend environment file (secrets; do not commit or email)

The script is `/usr/local/sbin/abgp-backup.sh`. The schedule is `/etc/cron.d/abgp-backup`. The log is `/var/log/abgp-backup.log`.

A copy from 12 October 2026 is also on this PC:

`C:\Users\Admin\Desktop\bettercode\ABGP-backups\2026-10-12\`

That folder is outside the git repository. Leave it there. Do not commit it.

Restore a dump onto the server:

```bash
sudo systemctl stop nginx
sudo -u postgres pg_restore -d ABGP --clean --if-exists /var/backups/abgp/abgp-YYYYMMDD-HHMMSS.dump
sudo systemctl start nginx
sudo pm2 restart abgp-backend
```

## Contabo snapshot

The nightly dump is the backup that stays. A Contabo snapshot is a second copy stored outside the VPS, and only the customer panel can create it. Snapshots are deleted after 30 days.

1. Open the VPS control page for `207.180.226.196` (ABGP).
2. Click the camera icon in the **Snap shots** column.
3. Click **Create Snapshot**.
4. Name it with the date, for example `after-recovery-2026-10-12`.

Do not click **Re install**. That wipes the server.

## Firewall and SSH

UFW allows only SSH (22), HTTP (80), and HTTPS (443). PostgreSQL is not open to the internet. Fail2ban blocks an SSH address after repeated failures. These settings are in `/etc/ssh/sshd_config.d/00-abgp-hardening.conf` and `/etc/fail2ban/jail.d/abgp-sshd.local`.
